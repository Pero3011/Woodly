import { getSession } from "@/lib/auth";
import { ALLOWED_TYPES, MAX_FILE_SIZE } from "@/lib/uploadRules";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export const runtime = "nodejs";

const MAX_MB = MAX_FILE_SIZE / (1024 * 1024);

const EXTENSIONS: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "application/pdf": ".pdf",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "sketches");

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const sketch = formData.get("sketch");

    if (!(sketch instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (sketch.size === 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (sketch.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File is too big. Max is ${MAX_MB}MB` },
        { status: 413 },
      );
    }

    if (!(ALLOWED_TYPES as readonly string[]).includes(sketch.type)) {
      return NextResponse.json(
        { error: "Only PNG, JPG, or PDF allowed" },
        { status: 400 },
      );
    }

    // Build a safe, unique name. We never use the user's file name.
    const fileName = `${randomUUID()}${EXTENSIONS[sketch.type]}`;

    // Read the file bytes
    const bytes = Buffer.from(await sketch.arrayBuffer());

    // Make sure the folder exists, then save the file
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, fileName), bytes);

    // This is the path you will store in the database
    return NextResponse.json({ path: `/uploads/sketches/${fileName}` });
  } catch (err) {
    console.error("Upload POST Error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
