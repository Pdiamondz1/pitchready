// Graceful-off observability — inert unless configured, and ZERO build-time deps.
//
// Error tracking loads Sentry from its CDN ONLY when VITE_SENTRY_DSN is set; with
// no DSN, nothing loads and nothing phones home. (CDN-load keeps the Tier-0 app
// building with no extra npm install — swap to the `@sentry/react` package when
// you add a backend/build step that installs it.)
//
// track() is a vendor-neutral analytics hook that no-ops until you wire a provider.
// It's the client half of the metrics loop; the server half is the `sync-metrics` skill.

export function initObservability(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return; // no DSN → error tracking stays completely off

  const s = document.createElement("script");
  s.src = "https://browser.sentry-cdn.com/7.120.3/bundle.tracing.min.js";
  s.crossOrigin = "anonymous";
  s.onload = () => {
    const w = window as unknown as {
      Sentry?: { init: (o: { dsn: string; tracesSampleRate: number }) => void };
    };
    w.Sentry?.init({ dsn, tracesSampleRate: 0.1 });
  };
  document.head.appendChild(s);
}

/** Vendor-neutral analytics. No-ops until you wire a provider below. */
export function track(event: string, props?: Record<string, unknown>): void {
  // WIRE YOUR ANALYTICS PROVIDER HERE (Plausible / PostHog / GA), e.g.:
  //   (window as unknown as { plausible?: (e: string, o?: unknown) => void })
  //     .plausible?.(event, { props });
  if (import.meta.env.DEV) console.debug("[track]", event, props ?? {});
}
