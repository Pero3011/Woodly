import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET(
  { params }: { params: Promise<{ id: string }> },
) {
  // Route params arrive as a Promise in Next.js 16
  const { id } = await params;

  let connection;
  try {
    connection = await getDatabaseConnection();

    const query = `
      SELECT PROD_ID, NAME, DESCRIPTION, RATING, CATEGORY, PRICE, IMAGE
      FROM products
      WHERE RAWTOHEX(PROD_ID) = UPPER(:id)
    `;

    const result = await connection.execute(
      query,
      { id },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const rows = (result.rows || []) as any[];
    const row = rows[0];

    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = {
      prod_id: Buffer.isBuffer(row.PROD_ID)
        ? row.PROD_ID.toString("hex")
        : row.PROD_ID?.toString() || "",
      prod_name: row.NAME,
      prod_description: row.DESCRIPTION,
      prod_rating: row.RATING,
      prod_category: row.CATEGORY,
      prod_price: row.PRICE,
      prod_img: row.IMAGE,
    };

    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("Fetch Product Error:", err);
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
