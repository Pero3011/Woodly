import { createToken } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();

    if (!body || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    connection = await getDatabaseConnection();

    const result = await connection.query(
      `SELECT user_id, name, email, password, phone, role FROM users WHERE email = $1`,
      [body.email.toLowerCase()],
    );

    const users = result.rows;

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    const userFound = users[0];

    const isPasswordValid = await bcrypt.compare(
      body.password,
      userFound.password,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid Credentials..please try again!" },
        { status: 401 },
      );
    }

    // Generate Token
    const token = await createToken({
      user_id: userFound.user_id,
      user_name: userFound.name,
      user_email: userFound.email,
      user_phone: userFound.phone,
      role: userFound.role,
    });

    // Stores token in a cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: userFound.user_id,
        email: userFound.email,
        name: userFound.name,
        phone: userFound.phone,
        role: userFound.role,
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
  } catch (err: any) {
    console.error("Auth Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    connection?.release();
  }
}
