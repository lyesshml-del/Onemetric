import { type NextRequest, NextResponse } from "next/server";
import { collectSchema } from "@/lib/validation/collect";
import { ingest } from "@/server/ingest/collect";

// Prisma requires the Node.js runtime (not Edge). Always run dynamically.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The tracker runs on arbitrary customer sites, so ingestion is open + CORS-permissive.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
} as const;

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: NextRequest) {
  // Body is sent as text/plain (keeps the browser request "simple", no preflight).
  let raw: unknown;
  try {
    raw = JSON.parse(await request.text());
  } catch {
    return NextResponse.json(
      { error: "invalid_body" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const parsed = collectSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "0.0.0.0";
  const userAgent = request.headers.get("user-agent") ?? "";
  const countryHeader = request.headers.get("x-vercel-ip-country");
  const country =
    countryHeader && countryHeader.length === 2 ? countryHeader : null;

  // Fire-and-forget semantics: always 204, never reveal whether the key exists.
  await ingest(parsed.data, { ip, userAgent, country });

  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
