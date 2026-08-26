import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";
import oracledb from "oracledb"
export async function GET() {
  let connection;

  try {
    connection = await getDatabaseConnection();

    const products = connection.execute(
      `SELECT PROD_ID,NAME, DESCRIPTION, RATING, CATEGORY, PRICE, IMAGE FROM PRODUCTS`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = (await products).rows as any[];
    const product = rows[0];

    if (!products) {
      return NextResponse.json(
        { message: "No products Shop is empty" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      prod_id: product.PROD_ID,
      prod_name: product.NAME,
      prod_description: product.DESCRIPTION,
      prod_rating: product.RATING,
      prod_category: product.CATEGORY,
      prod_price: product.PRICE,
      prod_img: product.IMAGE,
    });
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
