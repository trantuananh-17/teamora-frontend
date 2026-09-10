import ky from "ky"

import { TEAMORA_API_URL, forwardedCookie } from "./server-fetch"
import { redirectToLogin } from "./unauthorized"

/**
 * The only way this app talks to `teamora-backend`. No `fetch()` in a component,
 * no Server Action.
 *
 * Dual-mode. In the browser the base URL is relative so the call goes through
 * this app's own Hono proxy, which is what keeps the backend URL out of the
 * bundle and every request same-origin. On the server it addresses the backend
 * directly and replays the caller's session cookie.
 */
function baseUrl() {
  return typeof window === "undefined" ? `${TEAMORA_API_URL}/v1` : "/api/v1"
}

export const api = ky.create({
  prefixUrl: baseUrl(),
  retry: 0,
  // Excel import and long admin lists outlive ky's 10s default.
  timeout: 60_000,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (typeof window !== "undefined") return
        const cookie = await forwardedCookie()
        if (cookie) request.headers.set("cookie", cookie)
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) redirectToLogin()
        return response
      },
    ],
  },
})

/** The absolute URL of a backend route as seen from the browser. */
export function apiUrl(path: string): string {
  return `/api/v1/${path.replace(/^\//, "")}`
}
