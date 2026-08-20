import { NextResponse } from "next/server";
import { getDatabaseConnection } from "@/lib/db";
import bcrypt from "bcrypt";

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

    const newUser = await connection.execute(
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

    return NextResponse.json(newUser);
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
