import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface CheckoutItem {
  id: string;
  price: number;
  quantity: number;
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

    const body: CheckoutBody = await req.json();

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty — nothing to order" },
        { status: 400 },
      );
    }

    // Generate short unique order code (e.g. "A1B2C3D4")
    const orderCode = crypto.randomUUID().split("-")[0].toUpperCase();

    // Calculate totals to satisfy database constraints
    const subtotal = body.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const totalAmount = subtotal + body.shippingCost + body.tax;

    connection = await getDatabaseConnection();

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
        body.paymentMethod,
        subtotal,
        body.shippingCost,
        body.tax,
        totalAmount,
      ],
    );

    const orderId = orderHeaderResult.rows[0].order_id;

    // 2. Insert line items into ORDER_ITEMS table
    for (const item of body.items) {
      const itemName = item.name || "Handcrafted Wood Piece";
      const lineUnitPrice = item.price * item.quantity;

      await connection.query(
        `INSERT INTO ORDER_ITEMS (
          ORDER_ID,
          PROD_ID,
          ITEM_NAME,
          UNIT_PRICE
        ) VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, itemName, lineUnitPrice],
      );
    }

    // Commit transaction
    await connection.query("COMMIT");

    return NextResponse.json({
      order_id: orderId,
      order_code: orderCode,
      item_count: body.items.length,
    });
  } catch (err: any) {
    if (connection) {
      await connection.query("ROLLBACK");
    }
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
