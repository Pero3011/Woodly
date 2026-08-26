import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import oracledb from "oracledb";
export async function GET() {
  let connection;

  try {
    connection = await getDatabaseConnection();

    const result = connection.execute(
      `SELECT PROD_ID,NAME, DESCRIPTION, RATING, CATEGORY, PRICE, IMAGE FROM PRODUCTS`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = (await result).rows as any[];
    const product = rows[0];

    if (!rows || rows.length == 0) {
      return NextResponse.json(
        { message: "No products Shop is empty" },
        { status: 404 },
      );
    }

    const products = rows.map((row) => ({
      prod_id: row.PROD_ID.toString("hex"),
      prod_name: row.NAME,
      prod_description: row.DESCRIPTION,
      prod_rating: row.RATING,
      prod_category: row.CATEGORY,
      prod_price: row.PRICE,
      prod_img: row.IMAGE,
    }));

    return NextResponse.json({ products });
  } catch (err: any) {
    console.error("Update Profile Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    await connection?.close();
  }
}
