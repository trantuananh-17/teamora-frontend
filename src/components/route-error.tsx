"use client"

import Link from "next/link"
import { AlertTriangleIcon, HomeIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface RouteErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  title?: string
  message?: string
}

/**
 * Public error surface for route and server-fetch failures.
 *
 * Never render `error.message`: responses may contain internal URLs or backend
 * details. The digest is safe to share with support and can be correlated with
 * the server log without turning the UI into a stack-trace screen.
 */
export function RouteError({
  error,
  reset,
  title = "Không tải được dữ liệu",
  message = "Hệ thống đang gặp gián đoạn hoặc máy chủ chưa phản hồi. Bạn có thể thử tải lại.",
}: RouteErrorProps) {
  return (
    <div className="flex min-h-[min(32rem,70vh)] w-full items-center justify-center px-4 py-10">
      <div
        role="alert"
        className="flex w-full max-w-lg flex-col items-center gap-5 rounded-xl border bg-card p-6 text-center shadow-sm sm:p-8"
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangleIcon className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{message}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" onClick={reset}>
            <RefreshCwIcon aria-hidden="true" />
            Thử lại
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <HomeIcon aria-hidden="true" />
              Về trang chính
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground">
            Mã tham chiếu: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  )
}
