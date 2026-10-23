import { getDatabaseConnection } from "@/lib/db";
import { NextResponse } from "next/server";

// Lightweight deployment smoke check. Never expose connection strings or
// database error details in the public response.
export async function GET() {
  let connection;

  try {
    connection = await getDatabaseConnection();
    await connection.query("SELECT 1");

    return NextResponse.json(
      { status: "ok", database: "connected" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      { status: "unavailable", database: "disconnected" },
      { status: 503 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
