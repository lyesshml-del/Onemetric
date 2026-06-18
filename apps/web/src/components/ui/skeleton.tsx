import { cn } from "@/lib/utils";

/**
 * Move #2 / Phase 0 — a calm skeleton placeholder: a muted block with a subtle
 * shimmer sweep (the `shimmer` keyframe in `globals.css`). Under
 * `prefers-reduced-motion` the global guard freezes the sweep off-screen, so it
 * degrades to a static block. Decorative → `aria-hidden`.
 *
 * Not yet used on any page — Phase A assembles the Overview loading skeleton from
 * these. Pass sizing/spacing via `className` (e.g. `h-4 w-32`).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("bg-muted relative overflow-hidden rounded-md", className)}
      aria-hidden
    >
      <span className="animate-shimmer absolute inset-0 block -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}
