import Link from "next/link"

import { SignOutButton } from "@/features/auth/components"

/**
 * A plain shell. It deliberately does **not** gate: every page under `admin/`
 * calls `await requireOrganizer()` on its first line instead.
 *
 * Gating here would look safer and be worse — a page added later inherits a
 * check nobody wrote, and the day someone renders one outside this layout the
 * check silently is not there. Per page, it is visible in the page.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-2">
          <Link href="/admin" className="text-base font-semibold tracking-tight">
            Teamora
          </Link>
          <span className="text-xs text-muted-foreground">Quản trị</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Hành trình của tôi
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
    </div>
  )
}
