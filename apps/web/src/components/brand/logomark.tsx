/**
 * OneMetric logomark — Move #3 / Phase E.
 *
 * A hand-built, dependency-free geometric mark: three ascending bars (a metric
 * rising), where the tallest — "the *one* metric that matters" — is the signature
 * accent (`--brand`) and the other two stay monochrome (`foreground`). No text
 * inside the SVG; it pairs with the "OneMetric" wordmark in the headers, so it is
 * `aria-hidden` here (the wordmark carries the accessible name). Recognizable down
 * to 16px; adapts to dark/light via theme tokens. Server-safe (pure SVG, no JS).
 *
 * The same geometry drives `app/icon.svg` (favicon, on a dark tile) and the
 * `opengraph-image` mark, so the identity is consistent everywhere.
 */
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="5" y="17" width="6" height="9" rx="2" className="fill-foreground" />
      <rect x="13" y="12" width="6" height="14" rx="2" className="fill-foreground" />
      <rect x="21" y="6" width="6" height="20" rx="2" className="fill-brand" />
    </svg>
  );
}
