import { createToken } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();

    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    connection = await getDatabaseConnection();

    const result = await connection.query(
      `SELECT user_id, name, email, password, phone, role
       FROM users
       WHERE email = $1
       LIMIT 1`,
      [body.email],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = await createToken({
      user_id: String(user.user_id),
      user_name: user.name,
      user_email: user.email,
      user_phone: user.phone,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.user_id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Sign-in failed:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}
