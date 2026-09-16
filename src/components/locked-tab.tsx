import { CalendarClockIcon, ClipboardPenIcon, LockKeyholeIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import type { EventStatus } from "@/features/events/service/events.service"

/**
 * The one rule behind every locked tab and every lock icon in the employee
 * sidebar. Before this point the backend refuses `GET /v1/me/journey`, so a page
 * that renders anything but this empty state would be showing a 409.
 */
export const isPublished = (status: EventStatus) =>
  status === "information_published" || status === "event_started" || status === "event_completed"

export const LOCKED_MESSAGE = "Sau khi Ban Tổ chức công bố"

/** Shared empty state for a tab that opens only after publication. Not an error — no warning tone. */
export function LockedTab() {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LockKeyholeIcon />
            </EmptyMedia>
            <EmptyTitle>{LOCKED_MESSAGE}</EmptyTitle>
            <EmptyDescription>
              Thông tin này hiện sau khi Ban Tổ chức phân bổ xong và công bố. Bạn sẽ nhận được
              email khi hành trình sẵn sàng.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  )
}

export function NoEventTab() {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClockIcon />
            </EmptyMedia>
            <EmptyTitle>Chưa có kỳ Team Building hiện hành</EmptyTitle>
            <EmptyDescription>
              Khi Ban Tổ chức tạo kỳ mới, thông tin đăng ký và hành trình của bạn sẽ xuất hiện tại
              đây.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  )
}

export function NotRegisteredTab() {
  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardContent>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardPenIcon />
            </EmptyMedia>
            <EmptyTitle>Bạn chưa đăng ký kỳ này</EmptyTitle>
            <EmptyDescription>Hành trình chỉ được tạo cho CBNV đã gửi đăng ký.</EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline">
            <Link href="/register">Xem trang đăng ký</Link>
          </Button>
        </Empty>
      </CardContent>
    </Card>
  )
}
