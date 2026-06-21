import Link from "next/link";
import { RefreshButton } from "@/components/dashboard/refresh-button";
import { AutoVerify } from "@/components/dashboard/auto-verify";

/**
 * ONE-70 (Move #4 — Activation) — the verification + first-event guidance shown
 * right after the user installs the snippet (Settings → Verification card). It
 * answers the questions a new user has at that exact moment:
 *   • "Did I install it correctly?"  → the live status (real ingest stats)
 *   • "What should I do now?"         → concrete next steps
 *   • "How do I trigger my event?"    → load any page / call track()
 *   • "How do I know it's working?"   → ONE-72: auto-detected — no button. While
 *                                       waiting, <AutoVerify> quietly polls and
 *                                       the card flips to connected on its own.
 *   • "Where will I see the result?"  → a link to the project's dashboard
 *
 * Everything is derived from real data (`events` / `lastEventAt`) — no fake
 * progress. Server component; reuses the established emerald/amber status-dot
 * language; neutral + dark-first; no accent of its own (links are quiet text
 * links, not brand buttons).
 */
export function FirstEventGuide({
  events,
  lastEventAt,
  overviewHref,
}: {
  events: number;
  lastEventAt: Date | null;
  overviewHref: string;
}) {
  const receiving = events > 0;

  return (
    <div className="space-y-4">
      {receiving ? (
        <>
          <div className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
            <span>
              Receiving data — {events} event{events === 1 ? "" : "s"} so far
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Your site is connected — OneMetric is recording events. You&apos;re
            all set.
          </p>
          {lastEventAt ? (
            <p className="text-muted-foreground text-sm">
              Last event: {lastEventAt.toUTCString()}
            </p>
          ) : null}
          <RefreshButton />
          <Link
            href={overviewHref}
            className="text-foreground hover:text-foreground/80 inline-block text-sm font-medium underline-offset-4 hover:underline"
          >
            View your dashboard →
          </Link>
        </>
      ) : (
        <div className="space-y-3 text-sm">
          <div className="text-muted-foreground space-y-2">
            <p className="text-foreground font-medium">Trigger your first event</p>
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                Open your site in a new tab and load any page — that records your
                first pageview.
              </li>
              <li>
                Then return to this tab — OneMetric detects it automatically, no
                refresh needed.
              </li>
            </ol>
            <p>
              This stays on “waiting” until the first page loads — that&apos;s
              normal. Events usually appear within a few seconds. Custom actions
              like signups or purchases show up once you add{" "}
              <code className="text-foreground">onemetric.track()</code> — see
              Custom events below.
            </p>
          </div>
          {/* ONE-72 — auto-verify: quietly polls and flips this card to the
              connected state on its own (replaces the manual "Check again"). */}
          <AutoVerify />
          <Link
            href={overviewHref}
            className="text-muted-foreground hover:text-foreground inline-block text-sm underline-offset-4 hover:underline"
          >
            Where you&apos;ll see it: your dashboard →
          </Link>
        </div>
      )}
    </div>
  );
}
