import { getSession } from "@/lib/auth";
import { getDatabaseConnection } from "@/lib/db";
import { FIELD_LIMITS } from "@/lib/fieldLimits";
import { asMoneyOrNull, asUuid } from "@/lib/pg";
import { isUploadedSketchUrl } from "@/lib/uploadRules";
import { NextRequest, NextResponse } from "next/server";

const MAX_SIZE_CM = 1000;

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
  let transactionStarted = false;

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

    if (!title || title.length > FIELD_LIMITS.customTitle) {
      return badRequest(
        `Title is required (max ${FIELD_LIMITS.customTitle} characters)`,
      );
    }

    if (!isUploadedSketchUrl(img)) {
      return badRequest("A valid uploaded sketch is required");
    }

    if (!timber || timber.length > FIELD_LIMITS.timber) {
      return badRequest("Timber variety is required");
    }

    if (instructions.length > FIELD_LIMITS.customDescription) {
      return badRequest(
        `Instructions are too long (max ${FIELD_LIMITS.customDescription} characters)`,
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

    if (widthCm > MAX_SIZE_CM || heightCm > MAX_SIZE_CM) {
      return badRequest(`Size is too big (max ${MAX_SIZE_CM} cm)`);
    }

    connection = await getDatabaseConnection();

    await connection.query("BEGIN");
    transactionStarted = true;

    const customOrderResult = await connection.query(
      `INSERT INTO customized_orders (
        user_id,
        req_title,
        req_description,
        height,
        width,
        timber,
        customized_status
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6, 'pending')
      RETURNING customized_id`,
      [session.user_id, title, instructions || null, heightCm, widthCm, timber],
    );

    const customizedId = asUuid(customOrderResult.rows[0].customized_id);

    await connection.query(
      `INSERT INTO custom_gallery (
        customized_id,
        image_url,
        sort_order
      ) VALUES ($1::uuid, $2, 1)`,
      [customizedId, img],
    );

    await connection.query("COMMIT");
    transactionStarted = false;

    return NextResponse.json({ message: "Request created" }, { status: 201 });
  } catch (err: any) {
    if (connection && transactionStarted) {
      try {
        await connection.query("ROLLBACK");
      } catch {
        /* ignore */
      }
      transactionStarted = false;
    }
    console.error("Customized POST Error:", err);
    return NextResponse.json(
      { error: "Could not create request" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
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
        c.customized_id,
        c.req_title,
        c.customized_status,
        c.quoted_price,
        c.req_description,
        g.image_url AS custom_image
      FROM customized_orders c
      LEFT JOIN custom_gallery g 
        ON c.customized_id = g.customized_id AND g.sort_order = 1
      WHERE c.user_id = $1::uuid
      ORDER BY c.requested_at DESC
    `;

    connection = await getDatabaseConnection();

    const result = await connection.query(query, [session.user_id]);

    const rows = result.rows || [];

    const orders = rows.map((row) => ({
      id: asUuid(row.customized_id),
      title: row.req_title,
      status: row.customized_status,
      quotedPrice: asMoneyOrNull(row.quoted_price),
      description: row.req_description,
      image: row.custom_image,
    }));

    return NextResponse.json({ count: orders.length, orders });
  } catch (err: any) {
    console.error("Customized GET Error:", err);
    return NextResponse.json(
      { error: "Could not load requests" },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
