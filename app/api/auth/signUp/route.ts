import { NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import bcrypt from "bcrypt";
import oracledb from "oracledb";
import { createToken } from "@/lib/auth";

export async function POST(request: any) {
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

    const passwordHashed = await bcrypt.hash(body.password, 10);
    const role = body.role || "user";

    await connection.execute(
      `INSERT INTO users (name, phone, email, password, role) VALUES (:name, :phone, :email, :password, :role)`,
      {
        name: body.name,
        Phone: body.phone,
        Email: body.email,
        Password: passwordHashed,
        Role: role,
      },
      { autoCommit: true },
    );

    const fetched = await connection.execute(
      `SELECT user_id, name, role FROM users WHERE email = :email`,
      { email: body.email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    const newUserRow = (fetched.rows as any[])[0];

    //Generate Token
    const token = await createToken({
      user_id: newUserRow.USER_ID,
      user_name: newUserRow.NAME,
      role: newUserRow.ROLE,
    });

    //Stores token in a cookie
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: newUserRow.USER_ID,
        name: newUserRow.NAME,
        role: newUserRow.ROLE,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 5,
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
