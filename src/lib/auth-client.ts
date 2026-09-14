"use client"

import { createAuthClient } from "better-auth/react"

/**
 * Better Auth's own surface, and only that: sign-in, sign-out, password reset.
 * There is no sign-up — accounts come from the organisers' employee import
 * (ADR-016), so this app has no `/signup` route to point at.
 *
 * Teamora's product API is plain REST and goes through `lib/ky.ts` instead.
 *
 * Dual-mode: in the browser it calls `/api/auth`, same-origin, so the session
 * cookie is attached automatically and the proxy forwards it upstream.
 */
export const authClient = createAuthClient({
  baseURL:
    typeof window === "undefined" ? process.env.TEAMORA_API_URL || "http://localhost:8080" : "",
  basePath: typeof window === "undefined" ? "/v1/auth" : "/api/auth",
})
