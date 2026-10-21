import { NextResponse } from "next/server";
import { getSession, updateSessionUser } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { cookies } from "next/headers";

// GET the current logged in User
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

// UPDATE Logged In user Data
export async function PUT(request: Request) {
  let connection;

  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const user_email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!name || !user_email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 },
      );
    }

    connection = await getDatabaseConnection();

    // Check if the new email belongs to another user
    const existing = await connection.query(
      `SELECT user_id FROM users WHERE email = $1 AND user_id != $2`,
      [user_email, session.user_id],
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "That email is already in use" },
        { status: 409 },
      );
    }

    // Update and return the modified row in a single query
    const updateResult = await connection.query(
      `UPDATE users
       SET name = $1, phone = $2, email = $3
       WHERE user_id = $4
       RETURNING user_id, name, email, phone, role`,
      [name, phone || null, user_email, session.user_id],
    );

    const row = updateResult.rows[0];

    await updateSessionUser({
      user_name: row.name,
      user_email: row.email,
      user_phone: row.phone,
    });

    return NextResponse.json({
      user: {
        id: row.user_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
      },
    });
  } catch (err: any) {
    console.error("Update Profile Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// DELETE user
export async function DELETE() {
  let connection;

  const session = await getSession();
  if (!session?.user_id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    connection = await getDatabaseConnection();

    await connection.query(`DELETE FROM users WHERE user_id = $1`, [
      session.user_id,
    ]);

    const storedCookie = await cookies();
    storedCookie.delete("token");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Profile Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
