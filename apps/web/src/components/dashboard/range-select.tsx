"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RANGES, type RangeKey } from "@/lib/range";

export function RangeSelect({ value }: { value: RangeKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", next);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Date range"
      className="border-input bg-background h-9 rounded-md border px-3 text-sm"
    >
      {(Object.keys(RANGES) as RangeKey[]).map((key) => (
        <option key={key} value={key}>
          {RANGES[key].label}
        </option>
      ))}
    </select>
  );
}
