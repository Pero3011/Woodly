import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // 1. Extract Pagination Parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "3", 10));
    const offset = (page - 1) * limit;

    // 2. Extract Filter & Sorting Parameters
    const categoryParam = searchParams.get("category");
    const woodType = searchParams.get("woodType");
    const priceParam = searchParams.get("price");
    const sortBy = searchParams.get("sortBy") || "newest";

    const price = priceParam ? parseFloat(priceParam) : null;
    const categories = categoryParam
      ? categoryParam.split(",").filter(Boolean)
      : [];

    // 3. Build Dynamic WHERE Clause and Parameter Array
    let filterClause = ` WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    // Multi-Category Filter (IN clause)
    if (categories.length > 0) {
      const catPlaceholders = categories.map(() => `$${paramIndex++}`);
      filterClause += ` AND category IN (${catPlaceholders.join(",")})`;
      values.push(...categories);
    }

    // Wood Type Filter
    if (woodType) {
      filterClause += ` AND wood_type = $${paramIndex++}`;
      values.push(woodType.toLowerCase());
    }

    // Max Price Filter
    if (price !== null && !isNaN(price)) {
      filterClause += ` AND price <= $${paramIndex++}`;
      values.push(price);
    }

    // 4. Dynamic ORDER BY Clause
    let orderByClause = ` ORDER BY created_at DESC, prod_id DESC`; // Default ("newest")
    if (sortBy === "price-asc") {
      orderByClause = ` ORDER BY price ASC, prod_id DESC`;
    } else if (sortBy === "price-desc") {
      orderByClause = ` ORDER BY price DESC, prod_id DESC`;
    }

    connection = await getDatabaseConnection();

    // 5. Query Count & Paginated Data Concurrently
    const countSql = `SELECT COUNT(*) AS total FROM products${filterClause}`;
    const dataSql = `SELECT prod_id, name, description, category, price, image 
                     FROM products${filterClause}${orderByClause} 
                     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;

    const dataValues = [...values, limit, offset];

    const [countResult, dataResult] = await Promise.all([
      connection.query(countSql, values),
      connection.query(dataSql, dataValues),
    ]);

    const totalItems = parseInt(countResult.rows[0]?.total || "0", 10);
    const rows = dataResult.rows || [];

    // 6. Format Output for Frontend
    const products = rows.map((row) => ({
      prod_id: row.prod_id,
      prod_name: row.name,
      prod_description: row.description,
      prod_category: row.category,
      prod_price: Number(row.price),
      prod_img: row.image,
    }));

    return NextResponse.json({
      products,
      meta: {
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalItems / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error("Fetch Products Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
