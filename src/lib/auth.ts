import { cache } from "react"
import { redirect } from "next/navigation"

import { TEAMORA_API_URL, forwardedCookie } from "./server-fetch"

/**
 * The server-side session gate.
 *
 * `teamora-backend` is the only source of identity, so this asks it rather than
 * decoding anything locally — a revoked session stops working here the moment it
 * stops working there.
 *
 * Everything below is UX. The backend re-checks the actor and the event's status
 * on every one of its own routes, and is what actually enforces them (ADR-006).
 * In particular: do not decide here whether someone may edit a registration.
 * That depends on `event.status`, not on a role.
 */
const SESSION_PATH = "/v1/auth/get-session"

/** REQUIREMENTS §2. `user.role` is what Better Auth's `admin` plugin stores. */
export type Role = "employee" | "team_leader" | "organizer" | "super_admin"

const ORGANIZER_ROLES: readonly Role[] = ["organizer", "super_admin"]

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  image?: string | null
  role?: string | null
}

export interface AppSession {
  user: SessionUser
}

/** Wrapped in `cache` so one render asks the backend once. */
export const getSession = cache(async (): Promise<AppSession | null> => {
  const cookie = await forwardedCookie()
  if (!cookie) return null

  const response = await fetch(`${TEAMORA_API_URL}${SESSION_PATH}`, {
    headers: { cookie, accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })

  // An expired/revoked session is anonymous. A network error or a backend 5xx
  // is a system failure, not a logout: let it reach the route error boundary so
  // the user sees a retry screen and is not misleadingly sent to /login.
  if (response.status === 401) return null
  if (!response.ok) throw new Error(`Session service returned ${response.status}`)

  // Better Auth answers 200 with a literal `null` body for an anonymous caller.
  const body = (await response.json()) as AppSession | null
  if (!body?.user) return null
  return body
})

export async function getCurrentUser(): Promise<SessionUser | null> {
  return (await getSession())?.user ?? null
}

export function isOrganizer(user: SessionUser | null | undefined): boolean {
  return ORGANIZER_ROLES.includes(user?.role as Role)
}

/**
 * Every signed-in page starts with this. The path the caller was on is carried
 * in `redirect` so signing in returns them to it rather than to the app root.
 */
export async function requireAuth(redirectTo?: string): Promise<AppSession> {
  const session = await getSession()
  if (!session) {
    redirect(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login")
  }
  return session
}

/**
 * The first line of every page under `app/admin/`. The admin layout is a plain
 * shell and gates nothing — a page that forgets this call is simply ungated
 * here, which is why the backend checks again.
 *
 * A signed-in employee is sent to their own journey rather than back to the
 * sign-in page: they are authenticated, just not an organiser, and bouncing them
 * to a gate they have already passed reads as a broken app.
 */
export async function requireOrganizer(): Promise<AppSession> {
  const session = await requireAuth()
  if (!isOrganizer(session.user)) redirect("/")
  return session
}

/** Keeps a signed-in user off the sign-in page. */
export async function requireUnAuth(): Promise<void> {
  if (await getSession()) redirect("/")
}
