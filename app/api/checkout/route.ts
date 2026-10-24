import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { FIELD_LIMITS } from "@/lib/fieldLimits";
import { calculateTotals } from "@/lib/pricing";
import { asMoney, asUuid, isUniqueViolation } from "@/lib/pg";
import { NextRequest, NextResponse } from "next/server";

interface CheckoutItem {
  id: string;
  quantity: number;
  // price and name from the client are intentionally not trusted.
  price?: number;
  name?: string;
}

interface CheckoutBody {
  items: CheckoutItem[];
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postcode: string;
  };
  paymentMethod: string;
}

export async function POST(req: NextRequest) {
  let connection;
  let transactionStarted = false;

  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: CheckoutBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty — nothing to order" },
        { status: 400 },
      );
    }

    if (
      !body.shipping ||
      typeof body.shipping.firstName !== "string" ||
      !body.shipping.firstName.trim() ||
      typeof body.shipping.lastName !== "string" ||
      !body.shipping.lastName.trim() ||
      typeof body.shipping.address !== "string" ||
      !body.shipping.address.trim() ||
      typeof body.shipping.city !== "string" ||
      !body.shipping.city.trim() ||
      typeof body.shipping.postcode !== "string" ||
      !body.shipping.postcode.trim() ||
      typeof body.paymentMethod !== "string" ||
      !body.paymentMethod.trim()
    ) {
      return NextResponse.json(
        { error: "Please provide valid shipping and payment details" },
        { status: 400 },
      );
    }

    const ship = body.shipping;
    const paymentMethod = body.paymentMethod.trim();
    if (
      ship.firstName.length > FIELD_LIMITS.shipFirstName ||
      ship.lastName.length > FIELD_LIMITS.shipLastName ||
      ship.address.length > FIELD_LIMITS.shipAddress ||
      ship.city.length > FIELD_LIMITS.shipCity ||
      ship.postcode.length > FIELD_LIMITS.shipPostcode ||
      paymentMethod.length > FIELD_LIMITS.paymentMethod
    ) {
      return NextResponse.json(
        { error: "Shipping or payment details exceed allowed length" },
        { status: 400 },
      );
    }

    const requestedItems: { id: string }[] = [];
    const seenIds = new Set<string>();
    for (const item of body.items) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !item.id.trim() ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity !== 1
      ) {
        return NextResponse.json(
          {
            error:
              "Each piece is one-of-a-kind — quantity must be 1 per product",
          },
          { status: 400 },
        );
      }
      const id = item.id.trim();
      if (seenIds.has(id)) {
        return NextResponse.json(
          { error: "Duplicate products in cart" },
          { status: 400 },
        );
      }
      seenIds.add(id);
      requestedItems.push({ id });
    }

    // Generate short unique order code (e.g. "A1B2C3D4")
    const orderCode = crypto.randomUUID().split("-")[0].toUpperCase();

    connection = await getDatabaseConnection();

    // Start the transaction before reading authoritative prices and writing rows.
    await connection.query("BEGIN");
    transactionStarted = true;

    const productIds = requestedItems.map((item) => item.id);
    const productResult = await connection.query(
      `SELECT prod_id, name, price, product_status
       FROM products
       WHERE prod_id = ANY($1::uuid[])`,
      [productIds],
    );

    const productById = new Map(
      productResult.rows.map((row) => [
        asUuid(row.prod_id),
        {
          name: String(row.name),
          price: asMoney(row.price),
          productStatus: String(row.product_status),
        },
      ]),
    );

    if (productById.size !== productIds.length) {
      await connection.query("ROLLBACK");
      transactionStarted = false;
      return NextResponse.json(
        { error: "One or more products are no longer available" },
        { status: 400 },
      );
    }

    for (const product of productById.values()) {
      if (product.productStatus !== "available") {
        await connection.query("ROLLBACK");
        transactionStarted = false;
        return NextResponse.json(
          { error: "One or more products are no longer available" },
          { status: 400 },
        );
      }
    }

    const orderItems = requestedItems.map((item) => {
      const product = productById.get(item.id);
      if (!product) {
        throw new Error("A requested product could not be found.");
      }
      return {
        id: item.id,
        name: product.name,
        unitPrice: product.price,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice, 0);
    const { shippingCost, taxAmount, totalAmount } = calculateTotals(subtotal);

    // 1. Insert Order Header into ORDERS table
    const orderHeaderResult = await connection.query(
      `INSERT INTO orders (
        order_code,
        user_id,
        ship_first_name,
        ship_last_name,
        ship_address,
        ship_city,
        ship_postcode,
        payment_method,
        subtotal,
        shipping_cost,
        tax_amount,
        total_amount
      ) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING order_id`,
      [
        orderCode,
        session.user_id,
        body.shipping.firstName,
        body.shipping.lastName,
        body.shipping.address,
        body.shipping.city,
        body.shipping.postcode,
        paymentMethod,
        subtotal,
        shippingCost,
        taxAmount,
        totalAmount,
      ],
    );

    const orderId = asUuid(orderHeaderResult.rows[0].order_id);

    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id,
          prod_id,
          item_name,
          unit_price
        ) VALUES ($1::uuid, $2::uuid, $3, $4)`,
        [orderId, item.id, item.name, item.unitPrice],
      );
    }

    await connection.query(
      `UPDATE products
       SET product_status = 'sold'
       WHERE prod_id = ANY($1::uuid[])
         AND product_status = 'available'`,
      [productIds],
    );

    // Commit transaction
    await connection.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({
      order_id: orderId,
      order_code: orderCode,
      item_count: body.items.length,
    });
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      if (connection && transactionStarted) {
        try {
          await connection.query("ROLLBACK");
        } catch {
          /* ignore */
        }
        transactionStarted = false;
      }
      return NextResponse.json(
        { error: "One or more products were just purchased by someone else" },
        { status: 409 },
      );
    }

    if (connection && transactionStarted) {
      try {
        await connection.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Checkout rollback error:", rollbackError);
      } finally {
        transactionStarted = false;
      }
    }
    console.error("Checkout Error:", err);
    return NextResponse.json(
      { error: "Could not complete checkout. Please try again." },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
