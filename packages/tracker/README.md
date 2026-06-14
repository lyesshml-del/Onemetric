# @onemetric/tracker

The embeddable OneMetric analytics tracking script.

- **Isolated**: standalone workspace package, no dependency on the web app or any
  framework. Plain TypeScript compiled to a tiny browser script.
- **Status**: implemented (Phase 3).
- **Behavior**: auto-captures pageviews + SPA route changes (`history` patch +
  `popstate`), exposes `window.onemetric.track(name, props)` (with a pre-load queue),
  respects Do-Not-Track, and POSTs events to `/api/collect` on the origin it is served
  from. Uses `navigator.sendBeacon` (with a `fetch` keepalive fallback).

## Build

```bash
npm run build   # esbuild → ../../apps/web/public/onemetric.js (minified IIFE)
```

The web app serves the built file statically at `/onemetric.js`. From the repo root,
`npm run build:tracker` does the same, and `npm run build` runs it before the web build.

## Install snippet

```html
<script defer src="https://your-app-url/onemetric.js" data-public-key="om_xxx"></script>
```

The public key is shown per project at `/dashboard/[projectId]`.
