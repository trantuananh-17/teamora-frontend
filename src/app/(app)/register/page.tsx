import { Suspense } from "react"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { CalendarDaysIcon, ClipboardCheckIcon, Loader2Icon, RouteIcon } from "lucide-react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { EventStatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { getMyEmployeeProfile } from "@/features/employees/service/employees.service"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { getQueryClient } from "@/lib/get-query-client"
import { getPickupPoints, getTeams } from "@/features/registration/service/master-data.service"
import { prefetchMyRegistration } from "@/features/registration/server/prefetch"
import { RegistrationContainer } from "@/features/registration/components/registration-container"

export const metadata: Metadata = { title: "Đăng ký tham gia" }

function formatDeadline(date: Date | null) {
  if (!date) return "Theo thông báo của Ban Tổ chức"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
}

export default async function RegisterPage() {
  const event = await getCurrentEvent()
  if (!event) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDaysIcon />
              </EmptyMedia>
              <EmptyTitle>Chưa có kỳ Team Building hiện hành</EmptyTitle>
              <EmptyDescription>
                Ban Tổ chức sẽ thông báo khi kỳ mới mở đăng ký. Bạn không cần thực hiện thao tác nào
                lúc này.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }
  if (["information_published", "event_started", "event_completed"].includes(event.status)) {
    redirect("/")
  }

  const eventId = event.id

  const [, employee, teams, pickupPoints] = await Promise.all([
    prefetchMyRegistration(eventId),
    getMyEmployeeProfile(),
    getTeams(eventId),
    getPickupPoints(eventId),
  ])

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,0.8fr)]">
          <CardHeader className="gap-4 border-b bg-primary/5 p-6 sm:p-8 lg:border-r lg:border-b-0">
            <div className="flex flex-wrap items-center gap-2">
              <EventStatusBadge status={event.status} />
              <span className="text-xs text-muted-foreground">Mã kỳ {event.code}</span>
            </div>
            <div className="flex flex-col gap-2">
              <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Đăng ký {event.name}
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm sm:text-base">
                Xác nhận tham gia, ca bay nguyện vọng và nhu cầu xe trong một lần. Bạn có thể cập
                nhật lại thông tin khi kỳ vẫn đang mở đăng ký.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 p-6 sm:grid-cols-3 lg:grid-cols-1 lg:p-8">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardCheckIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium">Một biểu mẫu duy nhất</span>
                <span className="text-xs text-muted-foreground">Thông tin được lưu tập trung</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDaysIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium">Hạn đăng ký</span>
                <span className="text-xs text-muted-foreground">
                  {formatDeadline(event.registrationCloseAt)}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <RouteIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm font-medium">Hành trình liền mạch</span>
                <span className="text-xs text-muted-foreground">
                  BTC dùng dữ liệu này để phân bổ
                </span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <RegistrationContainer
            eventId={eventId}
            event={event}
            employee={employee}
            teams={teams}
            pickupPoints={pickupPoints}
          />
        </Suspense>
      </HydrationBoundary>
    </div>
  )
}
