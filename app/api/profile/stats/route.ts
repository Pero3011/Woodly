import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Not Authenticated" }, { status: 401 });
  }

  const userIdBuffer = Buffer.from(session.user_id, "hex");

  const InvestementQuery = `
    SELECT NVL(ROUND(SUM(order_total), 2), 0) AS TOTAL_INVESTEMENTS
    FROM (
      SELECT order_id,
             SUM(total_price) + MAX(shipping_cost) + MAX(tax_amount) AS order_total
      FROM orders
      WHERE user_id = :id
      GROUP BY order_id
    )`;

  const PiecesOwnedQuery = `
    SELECT NVL(SUM(quantity), 0) AS NUM_PIECES
    FROM ORDERS
    WHERE USER_ID = :id`;

  const CustomizedQuery = `
    SELECT COUNT(*) AS NUM_CUSTOMIZED
    FROM CUSTOMIZED_ORDERS
    WHERE USER_ID = :id`;

  let connection;
  try {
    connection = await getDatabaseConnection();

    const InvResult = await connection.execute(
      InvestementQuery,
      { id: userIdBuffer },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const InvRow = (InvResult.rows as any[])?.[0];
    const Total_Investements = InvRow?.TOTAL_INVESTEMENTS ?? 0;

    const PiecesOwnedResult = await connection.execute(
      PiecesOwnedQuery,
      { id: userIdBuffer },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const PiecesRow = (PiecesOwnedResult.rows as any[])?.[0];
    const Pieces_Owned = PiecesRow?.NUM_PIECES ?? 0;

    const CustomizedResult = await connection.execute(
      CustomizedQuery,
      { id: userIdBuffer },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const CustomizedRow = (CustomizedResult.rows as any[])?.[0];
    const Custom_Commissions = CustomizedRow?.NUM_CUSTOMIZED ?? 0;

    return NextResponse.json({
      Investements: Total_Investements,
      PiecesOwned: Pieces_Owned,
      CustomCommissions: Custom_Commissions,
    });
  } catch (err) {
    console.error("Profile stats error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  } finally {
    await connection?.close();
  }
}
