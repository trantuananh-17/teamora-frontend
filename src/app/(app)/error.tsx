"use client"

import { RouteError } from "@/components/route-error"

export default function EmployeeError({
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
      title="Không tải được thông tin của bạn"
      message="Hành trình hoặc thông tin đăng ký đang tạm thời không truy cập được. Hãy thử tải lại."
    />
  )
}
