import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("prod_id");
    const query = `SELECT * FROM PRODUCTS WHERE PROD_ID = :PROD_ID`;

    connection = await getDatabaseConnection();

    const product = await connection.execute(query, { PROD_ID: id });

    if (product.rows?.length==0) {
      return NextResponse.json(
        { error: "Product Not Found" },
        { status: 404 },
      );
    }

    return NextResponse.json(product.rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    connection?.close();
  }
}
