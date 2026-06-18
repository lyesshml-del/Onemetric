"use client";

import { useState, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { RANGES, type RangeKey } from "@/lib/range";

/**
 * Move #2 / Phase B — the Overview's optimistic range control + content shell.
 *
 * Owns the range `<select>` and navigates via `useTransition` so a range change
 * feels instant: the active value flips immediately (local state), the content is
 * **dimmed + `aria-busy`** while the server re-renders — the transition suppresses
 * the Phase-A Suspense skeleton, so the content stays in place instead of flashing
 * — and **scroll is preserved** (`scroll: false`).
 *
 * Server-first preserved: the page stays an RSC and passes its rendered content as
 * `children`; there is **no client data/state library** ("optimistic" = instant UI
 * feedback during the server round-trip, not client-side data mutation). The dim's
 * opacity transition uses the Phase-0 `--motion-base`/`--motion-ease` tokens and is
 * made instant under `prefers-reduced-motion` by the global guard in `globals.css`.
 *
 * Overview-only — the other pages keep the shared (non-optimistic) `<RangeSelect>`.
 */
export function OverviewShell({
  range,
  children,
}: {
  range: RangeKey;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<RangeKey>(range);

  function onChange(next: RangeKey) {
    setValue(next); // reflect the choice immediately (before the server commits)
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as RangeKey)}
          aria-label="Date range"
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        >
          {(Object.keys(RANGES) as RangeKey[]).map((key) => (
            <option key={key} value={key}>
              {RANGES[key].label}
            </option>
          ))}
        </select>
      </div>

      <div
        aria-busy={isPending}
        className={cn(
          "space-y-8 transition-opacity",
          isPending && "pointer-events-none opacity-60",
        )}
        style={{
          transitionDuration: "var(--motion-base)",
          transitionTimingFunction: "var(--motion-ease)",
        }}
      >
        {children}
      </div>
    </>
  );
}
