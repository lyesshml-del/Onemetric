"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/**
 * ONE-73 (Move #5 — Activation Loop) — instant gratification: send a real test
 * event so a user who hasn't deployed the snippet yet still gets the "it works"
 * moment (PostHog-style). It POSTs through the **real** ingest path
 * (`POST /api/collect`, same-origin) with the project's public key — exactly the
 * payload the tracker sends — so this is a genuine, clearly-labelled event
 * ("Test event", `metadata.test`), not fabricated sample data. After it lands it
 * `router.refresh()`es so the verification / Overview flips to connected (the
 * ONE-72 auto-verify would catch it too).
 *
 * Client island (the page stays an RSC); reuses the shared outline Button; no new
 * dependency; neutral + dark-first; no accent of its own.
 */
export function SendTestEventButton({ publicKey }: { publicKey: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function send() {
    setState("sending");
    try {
      // Same-origin → a "simple" text/plain POST, no preflight; mirrors the
      // tracker's payload shape. /api/collect always 204s (it never leaks key
      // validity), so a non-2xx means a transport failure.
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          publicKey,
          type: "custom",
          name: "Test event",
          path: "/",
          metadata: { source: "onemetric-dashboard", test: true },
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setState("sent");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p
        className="text-muted-foreground text-sm"
        role="status"
        aria-live="polite"
      >
        Test event sent — your dashboard is updating…
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={send}
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : "Send a test event"}
      </Button>
      {state === "error" ? (
        <p className="text-muted-foreground text-xs">
          Couldn&apos;t send the test event — please try again.
        </p>
      ) : null}
    </div>
  );
}
