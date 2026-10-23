import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
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
  shippingCost: number;
  tax: number;
}

export async function POST(req: NextRequest) {
  let connection;

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

    const shippingCost = Number(body.shippingCost);
    const tax = Number(body.tax);
    if (
      !Number.isFinite(shippingCost) ||
      shippingCost < 0 ||
      !Number.isFinite(tax) ||
      tax < 0
    ) {
      return NextResponse.json(
        { error: "Shipping and tax must be valid non-negative amounts" },
        { status: 400 },
      );
    }

    const requestedItems: { id: string; quantity: number }[] = [];
    for (const item of body.items) {
      if (
        !item ||
        typeof item.id !== "string" ||
        !item.id.trim() ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 100
      ) {
        return NextResponse.json(
          { error: "Each cart item must have a valid product ID and quantity" },
          { status: 400 },
        );
      }
      requestedItems.push({ id: item.id.trim(), quantity: item.quantity });
    }

    // Generate short unique order code (e.g. "A1B2C3D4")
    const orderCode = crypto.randomUUID().split("-")[0].toUpperCase();

    connection = await getDatabaseConnection();

    // Start the transaction before reading authoritative prices and writing rows.
    await connection.query("BEGIN");

    const productIds = [...new Set(requestedItems.map((item) => item.id))];
    const productResult = await connection.query(
      `SELECT prod_id, name, price
       FROM products
       WHERE prod_id = ANY($1)`,
      [productIds],
    );

    const productById = new Map(
      productResult.rows.map((row) => [
        String(row.prod_id),
        {
          name: String(row.name),
          price: Number(row.price),
        },
      ]),
    );

    if (productById.size !== productIds.length) {
      await connection.query("ROLLBACK");
      return NextResponse.json(
        { error: "One or more products are no longer available" },
        { status: 400 },
      );
    }

    for (const product of productById.values()) {
      if (!Number.isFinite(product.price) || product.price < 0) {
        throw new Error("A product has an invalid database price.");
      }
    }

    const orderItems = requestedItems.map((item) => {
      const product = productById.get(item.id);
      if (!product) {
        throw new Error("A requested product could not be found.");
      }
      return {
        id: item.id,
        quantity: item.quantity,
        name: product.name,
        unitPrice: product.price,
      };
    });

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const totalAmount = subtotal + shippingCost + tax;

    if (!Number.isFinite(subtotal) || !Number.isFinite(totalAmount)) {
      throw new Error("Checkout total is invalid.");
    }

    // Start transaction block
    await connection.query("BEGIN");

    // 1. Insert Order Header into ORDERS table
    const orderHeaderResult = await connection.query(
      `INSERT INTO ORDERS (
        ORDER_CODE,
        USER_ID,
        SHIP_FIRST_NAME,
        SHIP_LAST_NAME,
        SHIP_ADDRESS,
        SHIP_CITY,
        SHIP_POSTCODE,
        PAYMENT_METHOD,
        SUBTOTAL,
        SHIPPING_COST,
        TAX_AMOUNT,
        TOTAL_AMOUNT
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING ORDER_ID`,
      [
        orderCode,
        session.user_id,
        body.shipping.firstName,
        body.shipping.lastName,
        body.shipping.address,
        body.shipping.city,
        body.shipping.postcode,
        body.paymentMethod.trim(),
        subtotal,
        shippingCost,
        tax,
        totalAmount,
      ],
    );

    const orderId = orderHeaderResult.rows[0].order_id;

    // 2. Insert line items into ORDER_ITEMS table
    for (const item of orderItems) {
      await connection.query(
        `INSERT INTO ORDER_ITEMS (
          ORDER_ID,
          PROD_ID,
          ITEM_NAME,
          UNIT_PRICE
        ) VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.name, item.unitPrice],
      );
    }

    // Commit transaction
    await connection.query("COMMIT");

    return NextResponse.json({
      order_id: orderId,
      order_code: orderCode,
      item_count: body.items.length,
    });
  } catch (err: unknown) {
    if (connection) {
      try {
        await connection.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Checkout rollback error:", rollbackError);
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
