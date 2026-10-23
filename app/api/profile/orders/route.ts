import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.user_id) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  // Optional query params for pagination
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const offsetParam = Number(searchParams.get("offset"));

  const limit =
    Number.isInteger(limitParam) && limitParam >= 1
      ? Math.min(limitParam, 50)
      : 5;
  const offset =
    Number.isInteger(offsetParam) && offsetParam >= 0 ? offsetParam : 0;

  // PostgreSQL numeric columns may be returned as strings by the driver.
  // Preserve NULL for unquoted custom requests, but reject malformed non-null prices.
  function normalizeOrderTotal(value: unknown): number | null {
    if (value === null || value === undefined) return null;

    const amount = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(amount)) {
      throw new Error("Database returned an invalid order total.");
    }

    return amount;
  }

  const recentOrdersQuery = `
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
      -- 1. Marketplace Orders
      SELECT 'marketplace' AS order_type,
             o.order_id::text AS order_id,
             p.name AS name,
             p.image AS image,
             p.wood_type AS wood_type,
             o.ordered_at AS ordered_at,
             o.order_status AS order_status,
             o.total_amount AS order_total,
             (
               SELECT COUNT(*) - 1 
               FROM order_items oi2 
               WHERE oi2.order_id = o.order_id
             ) AS extra_items
      FROM orders o
      JOIN LATERAL (
        SELECT oi.prod_id
        FROM order_items oi
        WHERE oi.order_id = o.order_id
        ORDER BY oi.unit_price DESC
        LIMIT 1
      ) top_item ON TRUE
      JOIN products p ON p.prod_id = top_item.prod_id
      WHERE o.user_id = $1

      UNION ALL

      -- 2. Custom Requests
      SELECT 'custom' AS order_type,
             c.customized_id::text AS order_id,
             c.req_title AS name,
             cg.image_url AS image,
             c.timber AS wood_type,
             c.requested_at AS ordered_at,
             c.customized_status AS order_status,
             c.quoted_price AS order_total,
             0 AS extra_items
      FROM customized_orders c
      LEFT JOIN custom_gallery cg 
        ON c.customized_id = cg.customized_id AND cg.sort_order = 1
      WHERE c.user_id = $1
    ) combined_orders
    ORDER BY ordered_at DESC, order_id DESC
    LIMIT $2 OFFSET $3
  `;

  let connection;
  try {
    connection = await getDatabaseConnection();

    const result = await connection.query(recentOrdersQuery, [
      session.user_id,
      limit,
      offset,
    ]);

    const rows = result.rows || [];

    const orders = rows.map((row) => ({
      type: row.order_type as "marketplace" | "custom",
      id: row.order_id,
      title: row.name,
      image: row.image,
      woodType: row.wood_type,
      date: row.ordered_at,
      status: row.order_status,
      total: normalizeOrderTotal(row.order_total), // null when a custom order has no quote yet
      extraItems: Number(row.extra_items),
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Recent orders error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
