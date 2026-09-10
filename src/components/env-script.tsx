/**
 * Serializes the client-readable env allowlist into `window.__env` at request
 * time, so one image runs against staging and production without a rebuild.
 * Read it through `lib/config.ts`, never directly.
 *
 * `TEAMORA_API_URL` is deliberately absent, and so is anything else the backend
 * holds: the browser reaches the backend through this app's own proxy, and SMTP
 * credentials and the database path must never leave the backend.
 */
export function EnvScript() {
  const env = {
    APP_BASE_URL: process.env.APP_BASE_URL ?? "",
  }

  return (
    <script dangerouslySetInnerHTML={{ __html: `window.__env=${JSON.stringify(env)}` }} />
  )
}
