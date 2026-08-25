import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import oracledb from "oracledb";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  return NextResponse.json({
    user: {
      id: session.user_id,
      email: session.user_email,
      name: session.user_name,
      phone: session.user_phone,
      role: session.role,
    },
  });
}

export async function PUT(request: Request) {
  let connection;

  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const user_email = typeof body?.email === "string" ? body.email.trim() : "";
    const userIdBuffer = Buffer.from(session.user_id, "hex");

    if (!name || !user_email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    connection = await getDatabaseConnection();

    const existing = await connection.execute(
      `SELECT user_id FROM USERS WHERE email = :email AND user_id != :id`,
      { email: user_email, id: userIdBuffer },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if ((existing.rows as any[]).length > 0) {
      return NextResponse.json(
        { error: "That email is already in use" },
        { status: 409 },
      );
    }

    await connection.execute(
      `update users
   set name = :name, phone = :phone, email = :email
   where user_id = :id`,
      { name, phone, email: user_email, id: userIdBuffer },
      { autoCommit: true },
    );

    const updated = await connection.execute(
      `select user_id, name, email, phone, role from users where user_id = :id`,
      { id: userIdBuffer },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const row = (updated.rows as any[])[0];

    return NextResponse.json({
      user: {
        id: row.USER_ID,
        name: row.NAME,
        email: row.EMAIL,
        phone: row.PHONE,
        role: row.ROLE,
      },
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