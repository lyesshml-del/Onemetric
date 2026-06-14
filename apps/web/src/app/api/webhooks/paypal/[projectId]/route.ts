import { type NextRequest, NextResponse } from "next/server";
import { getPayPalCredentials } from "@/server/queries/integrations";
import {
  verifyPayPalSignature,
  extractCapture,
  recordRevenueEvent,
} from "@/server/ingest/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  const credentials = await getPayPalCredentials(projectId);
  if (!credentials) {
    return NextResponse.json({ error: "not_connected" }, { status: 404 });
  }

  let event: unknown;
  try {
    event = JSON.parse(await request.text());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const verified = await verifyPayPalSignature(
    credentials,
    {
      authAlgo: request.headers.get("paypal-auth-algo") ?? "",
      certUrl: request.headers.get("paypal-cert-url") ?? "",
      transmissionId: request.headers.get("paypal-transmission-id") ?? "",
      transmissionSig: request.headers.get("paypal-transmission-sig") ?? "",
      transmissionTime: request.headers.get("paypal-transmission-time") ?? "",
    },
    event,
  );
  if (!verified) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  const capture = extractCapture(event);
  if (capture) {
    await recordRevenueEvent(projectId, capture);
  }

  return NextResponse.json({ received: true });
}
