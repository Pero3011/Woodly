import { NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import bcrypt from "bcrypt";
import { createToken } from "@/lib/auth";

export async function POST(request: Request) {
  let connection;
  try {
    connection = await getDatabaseConnection();
    const body = await request.json();

    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(body.email);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Email Format" },
        { status: 400 },
      );
    }

    const emailNormalized = body.email.toLowerCase();
    const passwordHashed = await bcrypt.hash(body.password, 10);
    const role = body.role || "user";
    const phone = body.phone || null;

    // Single query inserts and returns the created user
    const insertResult = await connection.query(
      `INSERT INTO users (name, phone, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, phone, role`,
      [body.name, phone, emailNormalized, passwordHashed, role],
    );

    const newUserRow = insertResult.rows[0];

    // Generate Token
    const token = await createToken({
      user_id: newUserRow.user_id,
      user_name: newUserRow.name,
      user_email: newUserRow.email,
      user_phone: newUserRow.phone,
      role: newUserRow.role,
    });

    // Stores token in a cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: newUserRow.user_id,
        email: newUserRow.email,
        name: newUserRow.name,
        phone: newUserRow.phone,
        role: newUserRow.role,
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
  } catch (error: any) {
    console.error("Signup Error:", error);
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
