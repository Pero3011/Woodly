import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const productId = id.trim();

  let connection;
  try {
    connection = await getDatabaseConnection();

    // 1. Prepare queries for product details and gallery images
    const productQuery = `
      SELECT prod_id, name, description, category, price
      FROM products
      WHERE prod_id = $1
    `;

    const galleryQuery = `
      SELECT image_url
      FROM prodgallery
      WHERE prod_id = $1
      ORDER BY sort_order ASC
    `;

    // 2. Fetch both product and gallery records concurrently
    const [productResult, galleryResult] = await Promise.all([
      connection.query(productQuery, [productId]),
      connection.query(galleryQuery, [productId]),
    ]);

    const prodRow = productResult.rows[0];

    // Early exit if product does not exist
    if (!prodRow) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const images = galleryResult.rows.map((r) => r.image_url);

    // Format final product object
    const product = {
      prod_id: prodRow.prod_id,
      prod_name: prodRow.name,
      prod_description: prodRow.description,
      prod_category: prodRow.category,
      prod_price: Number(prodRow.price),
      prod_imgs: images,
    };

    return NextResponse.json({ product });
  } catch (err: any) {
    console.error("Fetch Product Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
