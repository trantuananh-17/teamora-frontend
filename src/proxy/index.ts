import { Hono } from "hono"
import type { Context } from "hono"
import { proxy } from "hono/proxy"

import { TEAMORA_API_URL } from "@/lib/server-fetch"

/**
 * The server-side API surface the browser talks to.
 *
 * Every backend call from a client component goes through here rather than
 * straight to the backend, for two reasons: the backend URL stays out of the
 * bundle, and the request stays same-origin so the browser attaches the httpOnly
 * session cookie without any CORS arrangement.
 *
 * There is no token to mint. `teamora-backend` authenticates the Better Auth
 * session cookie itself, so this proxy forwards the credential and adds nothing.
 *
 * Ragenta splits this across `proxy/index.ts` and `proxy/auth.ts`. The auth half
 * is one route here, because the thing that made it its own file there — undoing
 * a cookie `Domain` in development — has nothing to undo: Teamora's backend
 * never sets one (there is no `AUTH_COOKIE_DOMAIN` in its `config/env.ts`).
 */
const app = new Hono()

/** Refuses a misconfiguration that would make this app proxy to itself. */
function isSelfReference(target: string, host: string | undefined) {
  if (!host) return false
  try {
    return new URL(target).host === host
  } catch {
    return false
  }
}

async function forward(c: Context, target: string) {
  const host = c.req.header("host")

  if (isSelfReference(target, host)) {
    return c.json(
      {
        error: {
          code: "PROXY_MISCONFIGURED",
          message: "TEAMORA_API_URL points back at the frontend.",
        },
      },
      500,
    )
  }

  try {
    return await proxy(target, {
      ...c.req,
      headers: {
        ...c.req.header(),
        "X-Forwarded-Host": host ?? "",
      },
    })
  } catch (error) {
    return c.json(
      {
        error: {
          code: "PROXY_FAILED",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      502,
    )
  }
}

/** This app's own liveness, for the container healthcheck. Reaches no backend. */
app.get("/api/health", (c) => c.json({ status: "ok" }))

// Better Auth lives inside teamora-backend at /v1/auth/*. Registered before the
// catch-all below so it claims its prefix first.
app.all("/api/auth/*", (c) => {
  const url = new URL(c.req.url)
  const path = url.pathname.replace(/^\/api\/auth\/?/, "")
  return forward(c, `${TEAMORA_API_URL}/v1/auth/${path}${url.search}`)
})

/**
 * The product API. The `/v1` segment is kept in the path so the proxy is a
 * rewrite of the host only, and a route reads the same here as it does in the
 * backend's own router.
 *
 * `hono/proxy` streams the upstream body through untouched, which is what will
 * make the allocation-progress SSE endpoint work across it in S3.
 */
app.all("/api/v1/*", (c) => {
  const url = new URL(c.req.url)
  const path = url.pathname.replace(/^\/api\/v1\/?/, "")
  return forward(c, `${TEAMORA_API_URL}/v1/${path}${url.search}`)
})

export default app
