"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

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
  const searchParams = useSearchParams()

  return (
    <div className="flex">
      <Select
        value={status ?? "all"}
        onValueChange={(value) => {
          const next = new URLSearchParams(searchParams.toString())
          if (value === "all") next.delete("status")
          else next.set("status", value)
          next.delete("page")
          router.replace(`${pathname}${next.size ? `?${next}` : ""}`)
        }}
      >
        <SelectTrigger className="w-full sm:w-56" aria-label="Lọc theo trạng thái email">
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
