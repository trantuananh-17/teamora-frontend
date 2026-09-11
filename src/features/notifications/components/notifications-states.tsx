"use client"

import { AlertTriangleIcon } from "lucide-react"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"

export function NotificationsLoading() {
  return <EntityTableSkeleton columns={7} />
}

export function NotificationsError() {
  return (
    <EntityStateView
      icon={<AlertTriangleIcon />}
      title="Không tải được lịch sử email"
      message="Tải lại trang. Nếu vẫn lỗi, kiểm tra backend còn chạy không."
    />
  )
}
