"use client"

import { RouteError } from "@/components/route-error"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Không tải được dữ liệu quản trị"
      message="Máy chủ chưa phản hồi hoặc dữ liệu kỳ này đang tạm thời không truy cập được. Hãy thử lại sau ít phút."
    />
  )
}
