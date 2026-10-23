import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session?.user_id) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const userId = session.user_id;

  const investmentQuery = `
    SELECT COALESCE(ROUND(SUM(total_amount), 2), 0) AS total_investments
    FROM orders
    WHERE user_id = $1
  `;

  const piecesOwnedQuery = `
    SELECT COALESCE(COUNT(oi.item_id), 0) AS num_pieces
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.order_id
    WHERE o.user_id = $1 AND oi.is_released = FALSE
  `;

  const customizedQuery = `
    SELECT COALESCE(COUNT(*), 0) AS num_customized
    FROM customized_orders
    WHERE user_id = $1
  `;

  let connection;
  try {
    connection = await getDatabaseConnection();

    // Execute queries concurrently for maximum speed
    const [invResult, piecesResult, customResult] = await Promise.all([
      connection.query(investmentQuery, [userId]),
      connection.query(piecesOwnedQuery, [userId]),
      connection.query(customizedQuery, [userId]),
    ]);

    // Normalize PostgreSQL numeric/count results into finite JSON numbers.
    // COALESCE in SQL handles empty aggregates; these guards protect against
    // unexpected driver values without sending NaN or Infinity to the client.
    function toFiniteNumber(value: unknown, field: string): number {
      const number = typeof value === "number" ? value : Number(value ?? 0);
      if (!Number.isFinite(number)) {
        throw new Error(`Database returned an invalid ${field} value.`);
      }
      return number;
    }

    const totalInvestments = toFiniteNumber(
      invResult.rows[0]?.total_investments,
      "total investments",
    );
    const piecesOwned = toFiniteNumber(
      piecesResult.rows[0]?.num_pieces,
      "pieces owned",
    );
    const customCommissions = toFiniteNumber(
      customResult.rows[0]?.num_customized,
      "custom commissions",
    );

    return NextResponse.json({
      Investements: totalInvestments,
      PiecesOwned: piecesOwned,
      CustomCommissions: customCommissions,
    });
  } catch (err) {
    console.error("Profile stats error:", err);
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
