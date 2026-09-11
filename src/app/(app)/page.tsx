import { CalendarClockIcon, MapIcon, SparklesIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { EventStatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { getCurrentUser } from "@/lib/auth"

export default async function JourneyPage() {
  const [user, event] = await Promise.all([getCurrentUser(), getCurrentEvent()])

  if (event && ["registration_open", "registration_closed", "allocation_processing"].includes(event.status)) {
    redirect("/register")
  }

  if (!event) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><CalendarClockIcon /></EmptyMedia>
              <EmptyTitle>Chưa có kỳ Team Building hiện hành</EmptyTitle>
              <EmptyDescription>
                Khi Ban Tổ chức tạo kỳ mới, thông tin đăng ký và hành trình của bạn sẽ xuất hiện
                tại đây.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden">
        <CardHeader className="gap-4 bg-primary/5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <EventStatusBadge status={event.status} />
            <span className="text-xs text-muted-foreground">Mã kỳ {event.code}</span>
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Hành trình của {user?.name || user?.email}
            </CardTitle>
            <CardDescription className="max-w-2xl text-sm sm:text-base">
              Tất cả thông tin chuyến bay, xe, phòng và lịch trình của {event.name} sẽ được tập
              trung trên một màn hình này.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <Empty className="min-h-72 border">
            <EmptyHeader>
              <EmptyMedia variant="icon"><MapIcon /></EmptyMedia>
              <EmptyTitle>Hành trình cá nhân đang được hoàn thiện</EmptyTitle>
              <EmptyDescription>
                Ban Tổ chức sẽ cập nhật từng phần sau khi phân bổ xong. Dữ liệu chưa có ở thời
                điểm này không phải là lỗi.
              </EmptyDescription>
            </EmptyHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SparklesIcon className="size-4" aria-hidden="true" />
              Luôn xem Teamora để nhận thông tin mới nhất
            </div>
          </Empty>
        </CardContent>
      </Card>
    </div>
  )
}
