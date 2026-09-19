import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Route params arrive as a Promise in Next.js 16
  const { id } = await params;

  let connection;
  try {
    connection = await getDatabaseConnection();

    // PROD_ID looks like a RAW (binary) column based on how your list
    // route handles it (Buffer.isBuffer check). RAWTOHEX turns the raw
    // bytes into the same hex string your frontend already uses as `id`,
    // so we compare hex-to-hex instead of raw bytes to a string.
    // ⚠️ If PROD_ID is actually a NUMBER in your schema, replace this
    // WHERE clause with: WHERE PROD_ID = :id
    const query = `
      SELECT PROD_ID, NAME, DESCRIPTION, RATING, CATEGORY, PRICE, IMAGE
      FROM products
      WHERE RAWTOHEX(PROD_ID) = :id
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

    // No matching product — tell the caller honestly instead of
    // returning a fake "success" with nothing inside it
    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Same shape your list route already produces, so both endpoints
    // are consistent for whatever reads them
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
