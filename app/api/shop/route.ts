import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

export async function GET(request: NextRequest) {
  let connection;

  try {
    const { searchParams } = new URL(request.url);

    // 1. Extract Pagination Parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "3", 10));
    const offset = (page - 1) * limit;

    // 2. Extract Filter & Sorting Parameters
    const categoryParam = searchParams.get("category"); // e.g. "Electronics,Clothing"
    const woodType = searchParams.get("woodType");
    const priceParam = searchParams.get("price");
    const sortBy = searchParams.get("sortBy") || "newest";

    const price = priceParam ? parseFloat(priceParam) : null;
    const categories = categoryParam
      ? categoryParam.split(",").filter(Boolean)
      : [];

    // 3. Build Dynamic WHERE Clause and Binds
    let filterClause = ` WHERE 1=1`;
    const binds: Record<string, any> = {};

    // Multi-Category Filter (IN clause)
    if (categories.length > 0) {
      const catBinds = categories.map((_, i) => `:cat${i}`);
      filterClause += ` AND CATEGORY IN (${catBinds.join(",")})`;
      categories.forEach((cat, i) => {
        binds[`cat${i}`] = cat;
      });
    }

    // Wood Type Filter (Search across NAME and DESCRIPTION)
    if (woodType) {
      filterClause += ` AND (LOWER(NAME) LIKE '%' || :woodType || '%' OR LOWER(DESCRIPTION) LIKE '%' || :woodType || '%')`;
      binds.woodType = woodType.toLowerCase();
    }

    // Max Price Filter
    if (price !== null && !isNaN(price)) {
      filterClause += ` AND PRICE <= :price`;
      binds.price = price;
    }

    // 4. Dynamic ORDER BY Clause
    let orderByClause = ` ORDER BY PROD_ID DESC`; // Default ("newest")
    if (sortBy === "price-asc") {
      orderByClause = ` ORDER BY PRICE ASC, PROD_ID DESC`;
    } else if (sortBy === "price-desc") {
      orderByClause = ` ORDER BY PRICE DESC, PROD_ID DESC`;
    }

    connection = await getDatabaseConnection();

    // 5. Query: Fetch Paginated & Sorted Rows
    const countSql = `SELECT COUNT(*) AS TOTAL FROM products${filterClause}`;
    const countResult = await connection.execute(countSql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    const totalItems = (countResult.rows as any[])?.[0]?.TOTAL || 0;

    const dataSql = `SELECT PROD_ID, NAME, DESCRIPTION, RATING, CATEGORY, PRICE, IMAGE FROM products${filterClause}${orderByClause} OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    const paginatedBinds = { ...binds, offset, limit };

    const dataResult = await connection.execute(dataSql, paginatedBinds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    const rows = (dataResult.rows || []) as any[];

    // 6. Format Database Output for Frontend
    const products = rows.map((row) => ({
      prod_id: Buffer.isBuffer(row.PROD_ID)
        ? row.PROD_ID.toString("hex")
        : row.PROD_ID?.toString() || "",
      prod_name: row.NAME,
      prod_description: row.DESCRIPTION,
      prod_rating: row.RATING,
      prod_category: row.CATEGORY,
      prod_price: row.PRICE,
      prod_img: row.IMAGE,
    }));

    return NextResponse.json({
      products,
      meta: {
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalItems / limit) || 1, // Will divide totalItems by 3
      },
    });
  } catch (err: any) {
    console.error("Fetch Products Error:", err);
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
