"use client"

import { AlertTriangleIcon } from "lucide-react"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"

export function AuditLogsLoading() {
  return <EntityTableSkeleton columns={6} />
}

export function AuditLogsError() {
  return <EntityStateView icon={<AlertTriangleIcon />} title="Không tải được nhật ký" message="Tải lại trang. Nếu vẫn lỗi, kiểm tra backend còn chạy không." />
}
