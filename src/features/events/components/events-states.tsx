"use client"

import { AlertTriangleIcon } from "lucide-react"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"

export function EventsLoading() {
  return <EntityTableSkeleton columns={5} />
}

export function EventsError() {
  return (
    <EntityStateView
      icon={<AlertTriangleIcon />}
      title="Không tải được danh sách kỳ"
      message="Tải lại trang. Nếu vẫn lỗi, kiểm tra backend còn chạy không."
    />
  )
}
