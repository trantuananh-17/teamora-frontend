import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/**
 * Rewritten from shadcn's generated version, which subscribed in an effect and
 * then called `setState` in the same effect body to seed the first value. React
 * Compiler's lint refuses that — correctly: it is a second render on every mount.
 *
 * A media query is an external store, and this is the hook for reading one. The
 * server snapshot is `false` because there is no viewport to measure there, and
 * the sidebar's desktop layout is the one that must not flash.
 */
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
