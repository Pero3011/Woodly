import { getDatabaseConnection } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import oracledb from "oracledb";

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

    const result = await connection.execute(
      `select email, password from users where email = :email`,
      { email: body.email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const users = result.rows as any[];

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    const userFound = users[0];

    const isPasswordValid = await bcrypt.compare(
      body.password,
      userFound.PASSWORD,
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid Credentials..please try again!" },
        { status: 401 },
      );
    }

    return NextResponse.json({ message: "Sign in successfully!!" });
  } catch (err: any) {
    console.error("Auth Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  } finally {
    await connection?.close();
  }
}