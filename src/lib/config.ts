/**
 * Runtime configuration, not build-time. `EnvScript` serializes the allowlist
 * below into `window.__env` on every render, so one Docker image runs against
 * staging and production without being rebuilt. There is no `NEXT_PUBLIC_*`
 * variable anywhere in this repo, and that is why.
 *
 * Only values a browser may see belong here. `TEAMORA_API_URL` never does — the
 * browser reaches the backend through this app's own /api/* proxy, and SMTP
 * credentials and the database path must not leave the backend at all.
 */
declare global {
  interface Window {
    __env?: {
      APP_BASE_URL?: string
    }
  }
}

type PublicKey = keyof NonNullable<Window["__env"]>

function runtimeEnv(key: PublicKey, fallback: string): string {
  if (typeof window !== "undefined") return window.__env?.[key] || fallback
  return process.env[key] || fallback
}

/** This app's own origin. */
export const appBaseUrl = () => runtimeEnv("APP_BASE_URL", "http://localhost:3000")
