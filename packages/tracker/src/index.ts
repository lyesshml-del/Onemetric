/**
 * OneMetric tracking script.
 *
 * Tiny, dependency-free. Auto-captures pageviews (including SPA route changes)
 * and exposes `window.onemetric.track(name, props)` for custom events.
 * Posts to the ingestion endpoint (`/api/collect`) on the origin it is served from.
 *
 * Usage:
 *   <script defer src="https://app.example.com/onemetric.js"
 *           data-public-key="om_xxx"></script>
 */

interface OneMetricGlobal {
  /** Pre-load queue: calls made before the script finished loading. */
  q?: Array<[string, Record<string, unknown>?]>;
  track: (name: string, props?: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    onemetric?: OneMetricGlobal;
  }
}

(() => {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) return;

  const publicKey = script.getAttribute("data-public-key");
  if (!publicKey) return;

  const endpoint = new URL(script.src).origin + "/api/collect";

  const getUtm = () => {
    const p = new URLSearchParams(location.search);
    return {
      utmSource: p.get("utm_source") || undefined,
      utmMedium: p.get("utm_medium") || undefined,
      utmCampaign: p.get("utm_campaign") || undefined,
    };
  };

  const send = (
    type: "pageview" | "custom",
    name: string,
    metadata?: Record<string, unknown>,
  ) => {
    // Respect Do Not Track.
    if (navigator.doNotTrack === "1") return;

    const payload = {
      publicKey,
      type,
      name,
      path: location.pathname,
      referrer: document.referrer || undefined,
      ...getUtm(),
      metadata,
    };

    const body = JSON.stringify(payload);

    // text/plain keeps the request "simple" (no CORS preflight).
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }));
        return;
      }
    } catch {
      // fall through to fetch
    }

    void fetch(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "text/plain" },
      keepalive: true,
      mode: "no-cors",
    }).catch(() => {});
  };

  let lastPath: string | null = null;
  const pageview = () => {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    send("pageview", location.pathname);
  };

  // SPA support: capture client-side navigations.
  const patch = (type: "pushState" | "replaceState") => {
    const original = history[type].bind(history);
    history[type] = (
      data: unknown,
      unused: string,
      url?: string | URL | null,
    ) => {
      const result = original(data, unused, url ?? null);
      pageview();
      return result;
    };
  };
  patch("pushState");
  patch("replaceState");
  addEventListener("popstate", pageview);

  // Public API + flush any queued calls made before load.
  const queued = window.onemetric?.q ?? [];
  window.onemetric = {
    track: (name: string, props?: Record<string, unknown>) =>
      send("custom", name, props),
  };
  queued.forEach((args) => window.onemetric!.track(...args));

  pageview();
})();

export {};
