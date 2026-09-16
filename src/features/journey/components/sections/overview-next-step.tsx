import { Suspense } from "react"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ClipboardPenIcon,
  HourglassIcon,
  Loader2Icon,
  MegaphoneIcon,
} from "lucide-react"

import { isPublished } from "@/components/locked-tab"
import { EventStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Event } from "@/features/events/service/events.service"
import type { Registration } from "@/features/registration/service/registration.service"
import { AnnouncementsSection } from "./announcements-section"
import { OverviewSummary } from "./overview-summary"

const formatDate = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Ho_Chi_Minh",
      }).format(date)
    : "theo thông báo của Ban Tổ chức"

/**
 * "Bước tiếp theo của bạn" — decided by `event.status` and whether this person
 * registered, never by role (ADR-005).
 */
function NextStep({ event, registration }: { event: Event; registration: Registration | null }) {
  if (event.status === "registration_open") {
    return registration ? (
      <Step
        icon={CheckCircle2Icon}
        title="Bạn đã đăng ký"
        body={`Có thể sửa thông tin đến ${formatDate(event.registrationCloseAt)}.`}
        action={{ href: "/register", label: "Xem đăng ký" }}
      />
    ) : (
      <Step
        icon={ClipboardPenIcon}
        title="Bạn chưa đăng ký"
        body={`Hạn đăng ký: ${formatDate(event.registrationCloseAt)}.`}
        action={{ href: "/register", label: "Đăng ký ngay", primary: true }}
      />
    )
  }
  if (!isPublished(event.status)) {
    return registration ? (
      <Step
        icon={HourglassIcon}
        title="Chờ Ban Tổ chức công bố"
        body="Đăng ký đã được ghi nhận. Chuyến bay, xe và phòng sẽ hiện tại đây sau khi BTC phân bổ xong."
        action={{ href: "/register", label: "Xem đăng ký" }}
      />
    ) : (
      <Step
        icon={HourglassIcon}
        title="Đã hết hạn đăng ký"
        body="Bạn chưa đăng ký kỳ này. Liên hệ Ban Tổ chức nếu cần bổ sung."
      />
    )
  }
  return registration ? null : (
    <Step
      icon={MegaphoneIcon}
      title="Bạn chưa đăng ký kỳ này"
      body="Hành trình chỉ được tạo cho CBNV đã gửi đăng ký."
    />
  )
}

function Step({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof CheckCircle2Icon
  title: string
  body: string
  action?: { href: string; label: string; primary?: boolean }
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-primary" aria-hidden="true" />
          {title}
        </CardTitle>
        <CardDescription>{body}</CardDescription>
      </CardHeader>
      {action && (
        <CardContent>
          <Button asChild variant={action.primary ? "default" : "outline"} className="min-h-11">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export function OverviewNextStep({
  event,
  registration,
}: {
  event: Event
  registration: Registration | null
}) {
  const showJourney = isPublished(event.status) && Boolean(registration)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <EventStatusBadge status={event.status} />
          <span className="text-xs text-muted-foreground">Mã kỳ {event.code}</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{event.name}</h1>
      </div>
      <NextStep event={event} registration={registration} />
      {showJourney && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          }
        >
          <OverviewSummary eventId={event.id} />
          <AnnouncementsSection eventId={event.id} limit={3} />
        </Suspense>
      )}
    </div>
  )
}
