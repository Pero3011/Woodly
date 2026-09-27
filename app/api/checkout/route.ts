import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Shape the checkout page sends. `id` on each item is the product's
// PROD_ID as a hex string — the same format the shop routes already
// use (see app/api/shop/[id]/route.ts), so it can go straight into
// HEXTORAW() below without any extra conversion.
interface CheckoutItem {
  id: string;
  price: number;
  quantity: number;
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

    // One shared ORDER_ID ties every product line of this order together.
    // 8 hex characters comfortably fits the ORDER_ID VARCHAR2(10 BYTE) column.
    const orderId = crypto.randomUUID().split("-")[0].toUpperCase();

    // One bind row per cart item — every row shares the same orderId,
    // user, shipping info and payment method; only the product,
    // quantity and line total change per row.
    const binds = body.items.map((item) => ({
      order_id: orderId,
      user_id: session.user_id,
      prod_id: item.id,
      quantity: item.quantity,
      total_price: item.price * item.quantity,
      ship_first_name: body.shipping.firstName,
      ship_last_name: body.shipping.lastName,
      ship_address: body.shipping.address,
      ship_city: body.shipping.city,
      ship_postcode: body.shipping.postcode,
      payment_method: body.paymentMethod,
      shipping_cost: body.shippingCost,
      tax_amount: body.tax,
    }));

    const query = `
      INSERT INTO ORDERS (
        ORDER_ID,
        USER_ID,
        PROD_ID,
        QUANTITY,
        TOTAL_PRICE,
        SHIP_FIRST_NAME,
        SHIP_LAST_NAME,
        SHIP_ADDRESS,
        SHIP_CITY,
        SHIP_POSTCODE,
        PAYMENT_METHOD,
        SHIPPING_COST,
        TAX_AMOUNT
      ) VALUES (
        :order_id,
        HEXTORAW(:user_id),
        HEXTORAW(:prod_id),
        :quantity,
        :total_price,
        :ship_first_name,
        :ship_last_name,
        :ship_address,
        :ship_city,
        :ship_postcode,
        :payment_method,
        :shipping_cost,
        :tax_amount
      )
    `;
    // ORDER_STATUS and ORDERED_AT are left out on purpose — the migration
    // gives them safe defaults ('pending' and SYSDATE), so every new
    // order starts in a consistent state without repeating that here.

    connection = await getDatabaseConnection();

    // executeMany inserts all product lines for this order in one
    // round trip, and either every line is saved or none are.
    await connection.executeMany(query, binds, { autoCommit: true });

    return NextResponse.json({
      order_id: orderId,
      item_count: body.items.length,
    });
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
}
