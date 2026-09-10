import Link from "next/link"

import { SignOutButton } from "@/features/auth/components"
import { isOrganizer, requireAuth } from "@/lib/auth"

/**
 * The employee shell. Gates once here for the whole subtree; the pages below do
 * not repeat it.
 *
 * `EventProvider` — the current event plus the caller's own registration — lands
 * here in S1, once there is an `event` table to read.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAuth()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Teamora
        </Link>
        <div className="flex items-center gap-2">
          {isOrganizer(user) && (
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Quản trị
            </Link>
          )}
          <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
    </div>
  )
}
