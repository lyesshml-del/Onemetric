import { InstallSnippet } from "@/components/dashboard/install-snippet";

/**
 * ONE-69 (Move #4 — Activation) — the install experience around the tracking
 * snippet, built to remove the "where do I paste this?" friction between
 * creating a project and the first event. Wraps the existing client
 * `InstallSnippet` (snippet + one-click copy, unchanged) with a precise
 * placement line and a zero-JS native `<details>` of per-stack hints for the
 * common cases. Server component, purely presentational; neutral + dark-first;
 * no accent of its own (the copy button keeps its existing outline styling).
 */
const PLACEMENTS = [
  {
    stack: "Plain HTML",
    where: "Paste it inside the <head> of every page, just before </head>.",
  },
  {
    stack: "Next.js / React",
    where:
      "Add it to your root layout's <head> (app/layout.tsx) or index.html — once is enough.",
  },
  {
    stack: "WordPress",
    where:
      "Use a “header scripts” plugin, or paste into your theme's header.php inside <head>.",
  },
  {
    stack: "Webflow / Framer / no-code",
    where: "Add it to the site-wide custom code in the <head> section.",
  },
];

export function InstallGuide({ snippet }: { snippet: string }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        Add this once, just before the closing{" "}
        <code className="text-foreground">&lt;/head&gt;</code> tag on every page
        you want to track. It loads asynchronously, so it never slows your site
        down.
      </p>

      <InstallSnippet snippet={snippet} />

      <details className="bg-muted/30 rounded-md border px-4 py-3 text-sm">
        <summary className="text-foreground hover:text-foreground/80 cursor-pointer list-none font-medium [&::-webkit-details-marker]:hidden">
          Where does this go? →
        </summary>
        <ul className="mt-3 space-y-2">
          {PLACEMENTS.map((p) => (
            <li key={p.stack}>
              <span className="font-medium">{p.stack}</span>
              <span className="text-muted-foreground"> — {p.where}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
