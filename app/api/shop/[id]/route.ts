import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cleanId = id.trim().toUpperCase();

  let connection;
  try {
    connection = await getDatabaseConnection();

    // 1. Fetch main product details
    const ProductQuery = `
      SELECT PROD_ID, NAME, DESCRIPTION, CATEGORY, PRICE
      FROM products
      WHERE PROD_ID = HEXTORAW(:id)
    `;

    const products = await connection.execute(
      ProductQuery,
      { id: cleanId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const ProdRows = (products.rows || []) as any[];
    const ProdRow = ProdRows[0];

    // Early exit if product does not exist
    if (!ProdRow) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. Fetch gallery images
    const GalleryQuery = `
      SELECT IMAGE_URL
      FROM prodgallery
      WHERE PROD_ID = HEXTORAW(:id)
      ORDER BY SORT_ORDER ASC
    `;

    const gallery = await connection.execute(
      GalleryQuery,
      { id: cleanId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const GallRows = (gallery.rows || []) as any[];
    const images = GallRows.map((r) => r.IMAGE_URL);

    // Format final product object
    const product = {
      prod_id: Buffer.isBuffer(ProdRow.PROD_ID)
        ? ProdRow.PROD_ID.toString("hex")
        : ProdRow.PROD_ID?.toString() || "",
      prod_name: ProdRow.NAME,
      prod_description: ProdRow.DESCRIPTION,
      prod_category: ProdRow.CATEGORY,
      prod_price: ProdRow.PRICE,
      prod_imgs: images,
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
