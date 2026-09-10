/**
 * What a 401 does in the browser, in one place.
 *
 * A session that expires mid-visit otherwise leaves someone reading an error
 * card on a page that can no longer load anything. Sending them back to the gate
 * with where they were is the only useful answer.
 */
export function redirectToLogin(): void {
  if (typeof window === "undefined") return

  const here = window.location.pathname + window.location.search
  const safe = here.startsWith("/") && !here.startsWith("//") && here !== "/login"

  window.location.href = safe
    ? `/login?redirect=${encodeURIComponent(here)}`
    : "/login"
}
