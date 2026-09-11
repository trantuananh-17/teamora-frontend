"use client"

import { usePathname, useRouter } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { NotificationStatus } from "../service/notifications.service"

export function NotificationsToolbar({ status }: { status?: NotificationStatus }) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex max-w-sm">
      <Select
        value={status ?? "all"}
        onValueChange={(value) =>
          router.replace(value === "all" ? pathname : `${pathname}?status=${value}`)
        }
      >
        <SelectTrigger aria-label="Lọc theo trạng thái email">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="pending">Đang chờ</SelectItem>
            <SelectItem value="sent">Đã gửi</SelectItem>
            <SelectItem value="failed">Gửi lỗi</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
