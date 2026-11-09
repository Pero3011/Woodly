import { getSession } from "@/lib/auth";
import {
  ALLOWED_TYPES,
  isAllowedSketchPathname,
  MAX_FILE_SIZE,
} from "@/lib/uploadRules";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: HandleUploadBody;
    try {
      body = (await req.json()) as HandleUploadBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        const current = await getSession();
        if (!current?.user_id) {
          throw new Error("Unauthorized");
        }

        if (!isAllowedSketchPathname(pathname)) {
          throw new Error("Invalid upload path");
        }

        return {
          allowedContentTypes: [...ALLOWED_TYPES],
          maximumSizeInBytes: MAX_FILE_SIZE,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: current.user_id }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("Upload POST Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 },
    );
  }
}
