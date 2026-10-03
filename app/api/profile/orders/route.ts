import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const userIdBuffer = Buffer.from(session.user_id, "hex");

  // Optional options from the address, e.g. ?limit=10&offset=10
  // No options = the old behaviour: the last 5 orders.
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const offsetParam = Number(searchParams.get("offset"));

  const limit =
    Number.isInteger(limitParam) && limitParam >= 1
      ? Math.min(limitParam, 50)
      : 5;
  const offset =
    Number.isInteger(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  const RecentOrdersQuery = `
    SELECT order_type,
           order_id,
           name,
           image,
           wood_type,
           ordered_at,
           order_status,
           order_total,
           extra_items
    FROM (
      SELECT 'marketplace' AS order_type,
             order_id,
             name,
             image,
             wood_type,
             ordered_at,
             order_status,
             order_total,
             extra_items
      FROM (
        SELECT o.order_id AS order_id,
               p.name AS name,
               p.image AS image,
               p.wood_type AS wood_type,
               MIN(o.ordered_at) OVER (PARTITION BY o.order_id) AS ordered_at,
               o.order_status AS order_status,
               ROUND(
                 SUM(o.total_price) OVER (PARTITION BY o.order_id)
                 + o.shipping_cost
                 + o.tax_amount,
                 2
               ) AS order_total,
               COUNT(*) OVER (PARTITION BY o.order_id) - 1 AS extra_items,
               ROW_NUMBER() OVER (
                 PARTITION BY o.order_id
                 ORDER BY o.total_price DESC, o.prod_id
               ) AS rn
        FROM orders o
        JOIN products p ON p.prod_id = o.prod_id
        WHERE o.user_id = :id
      )
      WHERE rn = 1

      UNION ALL

      SELECT 'custom' AS order_type,
             RAWTOHEX(c.customized_id) AS order_id,
             c.req_title AS name,
             c.custom_image AS image,
             c.timber AS wood_type,
             c.requested_at AS ordered_at,
             c.customized_status AS order_status,
             c.quoted_price AS order_total,
             0 AS extra_items
      FROM customized_orders c
      WHERE c.user_id = :id
    )
    ORDER BY ordered_at DESC, order_id DESC
    OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;

  let connection;
  try {
    connection = await getDatabaseConnection();

    const result = await connection.execute(
      RecentOrdersQuery,
      { id: userIdBuffer, offset, limit },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = (result.rows ?? []) as any[];

    const orders = rows.map((row) => ({
      type: row.ORDER_TYPE as "marketplace" | "custom",
      id: String(row.ORDER_ID),
      title: row.NAME,
      image: row.IMAGE,
      woodType: row.WOOD_TYPE,
      date: row.ORDERED_AT,
      status: row.ORDER_STATUS,
      total: row.ORDER_TOTAL, // null for a custom order with no quote yet
      extraItems: row.EXTRA_ITEMS,
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Recent orders error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  } finally {
    await connection?.close();
  }
}