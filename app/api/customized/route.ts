import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

export async function POST(req: NextRequest) {
  let connection;

  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIdBuffer = Buffer.from(session.user_id, "hex");
    
    const body = await req.json();

    const query = `
      INSERT INTO customized_orders (
        USER_ID,
        REQ_TITLE,
        REQ_DESCRIPTION,
        CUSTOM_IMAGE,
        CUSTOMIZED_STATUS,
        HEIGHT,
        WIDTH,
        TIMBER,
        QUOTED_PRICE
      ) VALUES (
        :user_id,
        :req_title,
        :req_description,
        :custom_image,
        'pending',
        :height,
        :width,
        :timber,
        0
      )
    `;

    const binds = {
      user_id: userIdBuffer,
      req_title: body.title,
      req_description: body.description,
      custom_image: body.img,
      height: body.height,
      width: body.width,
      timber: body.timber,
    };

    connection = await getDatabaseConnection();

    await connection.execute(query, binds, { autoCommit: true });

    return NextResponse.json({
      user_id: session.user_id,
      req_title: body.title,
      req_description: body.description,
      custom_image: body.img,
      height: body.height,
      width: body.width,
      timber: body.timber,
    });
  } catch (err: any) {
    console.error("Customized POST Error:", err);
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

export async function GET() {
  let connection;

  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIdBuffer = Buffer.from(session.user_id, "hex");

    const query = `
      SELECT
        REQ_TITLE,
        CUSTOM_IMAGE,
        CUSTOMIZED_STATUS,
        QUOTED_PRICE,
        REQ_DESCRIPTION
      FROM CUSTOMIZED_ORDERS
      WHERE USER_ID = :id
    `;

    connection = await getDatabaseConnection();

    const result = await connection.execute(
      query,
      { id: userIdBuffer },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = result.rows || [];

    return NextResponse.json({
      count: rows.length,
      orders: rows,
    });
  } catch (err: any) {
    console.error("Customized GET Error:", err);
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