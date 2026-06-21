"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const POLL_INTERVAL_MS = 6000;
const MAX_DURATION_MS = 5 * 60 * 1000; // give up auto-polling after 5 minutes

/**
 * ONE-72 (Move #5 — Activation Loop) — auto-verify installation. While a project
 * is waiting for its first event, this quietly re-fetches the server data
 * (`router.refresh()`) so the surrounding RSC re-renders and flips to its
 * "connected" state on its own — the user never has to press "Check again".
 *
 * The server stays the source of truth (this only re-fetches the existing
 * `getProjectIngestStats` / Overview data — no new endpoint, no schema, no fake
 * data). Bounded by design (no polling abuse): it only exists while waiting
 * (once the first event lands the parent renders the connected state and this
 * unmounts → polling stops), it pauses while the tab is backgrounded, re-checks
 * immediately when the tab regains focus, and gives up after `MAX_DURATION_MS`,
 * revealing a calm manual fallback. Reduced-motion-safe; no new dependency.
 */
export function AutoVerify({ className }: { className?: string }) {
  const router = useRouter();
  const [exhausted, setExhausted] = useState(false);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    if (exhausted) return;

    // Re-check the instant the user returns to this tab (e.g. after opening
    // their site in another tab) instead of waiting for the next interval.
    const onVisibility = () => {
      if (!document.hidden) router.refresh();
    };

    const id = setInterval(() => {
      if (document.hidden) return; // pause while backgrounded
      if (Date.now() - startedAt.current > MAX_DURATION_MS) {
        setExhausted(true);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, exhausted]);

  if (exhausted) {
    return (
      <div className={cn("space-y-2 text-sm", className)}>
        <p className="text-muted-foreground">
          Still no events. The moment your site sends one, it&apos;ll appear here
          — keep listening, or come back later.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            startedAt.current = Date.now();
            setExhausted(false);
            router.refresh();
          }}
        >
          Keep listening
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex size-2" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500/60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
      </span>
      <span>Listening for your first event…</span>
    </div>
  );
}
