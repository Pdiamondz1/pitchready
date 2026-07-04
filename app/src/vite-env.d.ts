/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Sentry DSN — when set, error tracking loads (see src/lib/observability.ts). */
  readonly VITE_SENTRY_DSN?: string;
  /** Optional analytics id — wire a provider in src/lib/observability.ts. */
  readonly VITE_ANALYTICS_ID?: string;
}
