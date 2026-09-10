"use client"

import { Button } from "@/components/ui/button"
import { useLogout } from "../hooks/auth.hook"

export function SignOutButton() {
  const logout = useLogout()

  return (
    <Button variant="ghost" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
      Đăng xuất
    </Button>
  )
}
