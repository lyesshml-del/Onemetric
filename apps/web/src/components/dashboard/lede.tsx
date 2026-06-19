import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LedeToken } from "@/lib/lede";

/**
 * Move #1 / Phase B — renders the Overview Lede.
 *
 * Calm prose at the top of the Overview: the connective words are muted and the
 * data nouns (emphasis) are bright, so the sentence reads like a briefing. A
 * token with an `href` becomes an inline drill link; otherwise it's plain text.
 * Presentational + server-safe. Monochrome — accent is Move #3.
 */
export function Lede({ tokens }: { tokens: LedeToken[] }) {
  return (
    <p className="text-muted-foreground text-lg leading-relaxed text-balance tabular-nums">
      {tokens.map((t, i) => {
        const emphasis = t.emphasis ? "text-foreground font-medium" : undefined;
        if (t.href) {
          return (
            <Link
              key={i}
              href={t.href}
              className={cn(
                // At rest: foreground (Move #1). Move #3 — tint to the signature
                // accent on hover/focus only, via --brand-text (the lighter
                // text-on-bg token, AA 7.15:1 dark / 5.98:1 light). Never at rest.
                "underline-offset-4 hover:underline hover:text-brand-text focus-visible:text-brand-text",
                emphasis ?? "text-foreground",
              )}
            >
              {t.text}
            </Link>
          );
        }
        return (
          <span key={i} className={emphasis}>
            {t.text}
          </span>
        );
      })}
    </p>
  );
}
