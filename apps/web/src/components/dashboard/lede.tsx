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
    <p className="text-muted-foreground text-lg leading-relaxed text-balance">
      {tokens.map((t, i) => {
        const emphasis = t.emphasis ? "text-foreground font-medium" : undefined;
        if (t.href) {
          return (
            <Link
              key={i}
              href={t.href}
              className={cn(
                "underline-offset-4 hover:underline",
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
