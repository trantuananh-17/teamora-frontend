import { HydrationBoundary, dehydrate } from "@tanstack/react-query"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { prefetchEvents } from "@/features/events/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { getCurrentUser } from "@/lib/auth"

/**
 * A shell. It deliberately does **not** gate: every page under `admin/` calls
 * `await requireOrganizer()` on its first line instead.
 *
 * Gating here would look safer and be worse — a page added later inherits a
 * check nobody wrote, and the day someone renders one outside this layout the
 * check silently is not there. Per page, it is visible in the page.
 *
 * `getCurrentUser` reads the session rather than demanding one, so an
 * unauthenticated request still renders this frame and the page below is what
 * redirects. Demanding it here would move the redirect into the layout and hide
 * it from the file that owns the rule.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  // The sidebar's edition block is the frame's own data, not any one page's, so
  // it is warmed here. Without this the whole point of the design — knowing
  // which edition you are editing — arrives only after hydration, and the group
  // of edition links pops in a beat late on every navigation.
  //
  // `prefetchQuery` never throws: an anonymous request stores the failure in the
  // cache and the page below redirects, which is what should happen anyway.
  await prefetchEvents()

  return (
    <SidebarProvider>
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <AppSidebar
          user={{
            name: user?.name || user?.email || "—",
            email: user?.email ?? "",
            role: user?.role ?? null,
          }}
        />
        <SidebarInset className="flex h-svh min-w-0 flex-col overflow-hidden bg-accent/20">
          {children}
        </SidebarInset>
      </HydrationBoundary>
    </SidebarProvider>
  )
}
