"use client";

import { useState, type ReactNode } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";
import { countryName, flagEmoji } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SourceRow } from "@/components/dashboard/source-row";
import type { BreakdownRow } from "@/server/queries/analytics";

/**
 * Move #1 / Phase G — the Audience card: one card with a segmented control that
 * merges the former Countries / Devices / Browsers breakdown cards.
 *
 * Client component only for the tab toggle — all three datasets are already
 * fetched server-side, so switching just re-renders a different array (no new
 * request, no animation beyond the existing colour transition). Reuses
 * `<SourceRow>`: flags for countries (`flagEmoji`), monochrome device glyphs
 * (lucide, already a dependency), monograms for browsers. Accent is Move #3.
 */
type Segment = "countries" | "devices" | "browsers";
const SEGMENTS: Segment[] = ["countries", "devices", "browsers"];

const DEVICE_ICON: Record<string, ReactNode> = {
  DESKTOP: <Monitor className="text-muted-foreground size-3.5" />,
  MOBILE: <Smartphone className="text-muted-foreground size-3.5" />,
  TABLET: <Tablet className="text-muted-foreground size-3.5" />,
};

function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function AudienceCard({
  countries,
  devices,
  browsers,
}: {
  countries: BreakdownRow[];
  devices: BreakdownRow[];
  browsers: BreakdownRow[];
}) {
  const [segment, setSegment] = useState<Segment>("countries");

  const rows =
    segment === "countries"
      ? countries
      : segment === "devices"
        ? devices
        : browsers;
  const max = Math.max(1, ...rows.map((r) => r.value));

  function renderRow(r: BreakdownRow, i: number): ReactNode {
    if (segment === "countries") {
      const flag = flagEmoji(r.label);
      return (
        <SourceRow
          key={`c-${r.label}-${i}`}
          label={countryName(r.label)}
          value={r.value}
          max={max}
          icon={flag || undefined}
        />
      );
    }
    if (segment === "devices") {
      return (
        <SourceRow
          key={`d-${r.label}-${i}`}
          label={titleCase(r.label)}
          value={r.value}
          max={max}
          icon={DEVICE_ICON[r.label] ?? undefined}
        />
      );
    }
    return (
      <SourceRow key={`b-${r.label}-${i}`} label={r.label} value={r.value} max={max} />
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Audience</CardTitle>
        <div className="bg-muted/50 inline-flex rounded-md p-0.5 text-xs">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={segment === s}
              onClick={() => setSegment(s)}
              className={cn(
                "rounded px-2 py-1 capitalize transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                segment === s
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data yet</p>
        ) : (
          <ul className="space-y-0.5">{rows.map(renderRow)}</ul>
        )}
      </CardContent>
    </Card>
  );
}
