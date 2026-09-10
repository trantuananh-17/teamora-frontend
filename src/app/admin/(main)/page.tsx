import type { Metadata } from "next"

import { requireOrganizer } from "@/lib/auth"

export const metadata: Metadata = { title: "Quản trị" }

export default async function AdminHomePage() {
  const { user } = await requireOrganizer()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Bảng điều khiển</h1>
      <p className="text-sm text-muted-foreground">
        Đăng nhập với vai trò {user.role}. Quản lý kỳ Team Building, CBNV và phân bổ sẽ nằm ở đây.
      </p>
    </div>
  )
}
