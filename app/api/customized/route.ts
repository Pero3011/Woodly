import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import oracledb from "oracledb";

// The image path must look exactly like what the upload route makes
const UPLOADED_IMAGE_PATTERN =
  /^\/uploads\/sketches\/[0-9a-f-]{36}\.(png|jpg|pdf)$/i;

// Change these to match your database column sizes
const LIMITS = {
  title: 100,
  instructions: 1000,
  timber: 100,
  maxSizeCm: 1000,
};

// The database stores size in cm, so we convert everything to cm
const UNIT_TO_CM: Record<string, number> = { cm: 1, mm: 0.1, in: 2.54 };

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toPositiveNumber(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(toText(value));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let connection;

  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON");
    }

    if (!body || typeof body !== "object") {
      return badRequest("Invalid request body");
    }

    const title = toText(body.title);
    const img = toText(body.img);
    const timber = toText(body.timberVariety);
    const instructions = toText(body.instructions);
    const unit = toText(body.unit).toLowerCase();
    const width = toPositiveNumber(body.width);
    const height = toPositiveNumber(body.height);

    if (!title || title.length > LIMITS.title) {
      return badRequest(`Title is required (max ${LIMITS.title} characters)`);
    }

    if (!UPLOADED_IMAGE_PATTERN.test(img)) {
      return badRequest("A valid uploaded sketch is required");
    }

    if (!timber || timber.length > LIMITS.timber) {
      return badRequest("Timber variety is required");
    }

    if (instructions.length > LIMITS.instructions) {
      return badRequest(
        `Instructions are too long (max ${LIMITS.instructions} characters)`,
      );
    }

    const factor = UNIT_TO_CM[unit];
    if (!factor) {
      return badRequest("Unit must be cm, mm, or in");
    }

    if (width === null || height === null) {
      return badRequest("Width and height must be positive numbers");
    }

    const widthCm = Math.round(width * factor * 100) / 100;
    const heightCm = Math.round(height * factor * 100) / 100;

    if (widthCm > LIMITS.maxSizeCm || heightCm > LIMITS.maxSizeCm) {
      return badRequest(`Size is too big (max ${LIMITS.maxSizeCm} cm)`);
    }

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
      user_id: Buffer.from(session.user_id, "hex"),
      req_title: title,
      req_description: instructions,
      custom_image: img,
      height: heightCm,
      width: widthCm,
      timber,
    };

    connection = await getDatabaseConnection();

    await connection.execute(query, binds, { autoCommit: true });

    return NextResponse.json({ message: "Request created" }, { status: 201 });
  } catch (err) {
    console.error("Customized POST Error:", err);
    return NextResponse.json(
      { error: "Could not create request" },
      { status: 500 },
    );
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
      { id: Buffer.from(session.user_id, "hex") },
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    const rows = result.rows || [];

    return NextResponse.json({ count: rows.length, orders: rows });
  } catch (err) {
    console.error("Customized GET Error:", err);
    return NextResponse.json(
      { error: "Could not load requests" },
      { status: 500 },
    );
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
