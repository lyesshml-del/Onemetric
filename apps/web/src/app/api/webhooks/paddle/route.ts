import { type NextRequest, NextResponse } from "next/server";
import {
  verifyPaddleSignature,
  handlePaddleEvent,
  type PaddleEvent,
} from "@/server/ingest/paddle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  // Read the raw body before parsing — signature is computed over the exact bytes.
  const raw = await request.text();

  if (!secret) {
    console.error("[paddle] PADDLE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "not_configured" }, { status: 500 });
  }

  if (!verifyPaddleSignature(raw, request.headers.get("paddle-signature"), secret)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(raw) as PaddleEvent;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    await handlePaddleEvent(event);
  } catch (err) {
    // Return 5xx so Paddle retries — a transient DB error shouldn't drop the event.
    console.error("[paddle] handler error", err);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
