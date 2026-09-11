"use client"

import {
  Building2Icon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  MailIcon,
  MapPinIcon,
  PlaneTakeoffIcon,
  UserRoundIcon,
} from "lucide-react"

import { EventStatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useMyRegistration } from "../hooks/registration.hook"
import { RegistrationForm } from "./registration-form"
import type { EmployeeSelf } from "@/features/employees/service/employees.service"
import type { Event } from "@/features/events/service/events.service"
import type { Team, PickupPoint } from "../service/master-data.service"

interface RegistrationContainerProps {
  eventId: string
  event: Event
  employee: EmployeeSelf
  teams: Team[]
  pickupPoints: PickupPoint[]
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("vi")
}

function formatDate(date: Date | null) {
  if (!date) return "Chưa ấn định"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date)
}

export function RegistrationContainer({
  eventId,
  event,
  employee,
  teams,
  pickupPoints,
}: RegistrationContainerProps) {
  const { data: registration } = useMyRegistration(eventId)

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <RegistrationForm
        eventId={eventId}
        event={event}
        employee={employee}
        registration={registration}
        teams={teams}
        pickupPoints={pickupPoints}
        canEdit={event.status === "registration_open"}
      />

      <aside className="flex flex-col gap-4 lg:sticky lg:top-6" aria-label="Tóm tắt đăng ký">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>Hồ sơ của bạn</CardTitle>
              <CardDescription>Dữ liệu đồng bộ từ danh sách nhân sự</CardDescription>
            </div>
            {registration && <Badge variant="outline">Đã ghi nhận</Badge>}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials(employee.name)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{employee.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {employee.employeeCode ?? "Chưa có mã nhân viên"}
                </span>
              </div>
            </div>
            <Separator />
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Building2Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">Bộ phận/Team</dt>
                  <dd className="truncate font-medium">
                    {registration?.team.name ?? employee.defaultTeamName ?? "Chưa cập nhật"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">Địa điểm làm việc</dt>
                  <dd className="truncate font-medium">
                    {employee.workLocationName ?? "Chưa cập nhật"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <dt className="text-xs text-muted-foreground">Email nhận xác nhận</dt>
                  <dd className="break-all font-medium">{employee.email}</dd>
                </div>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Trạng thái kỳ</CardTitle>
              <EventStatusBadge status={event.status} />
            </div>
            <CardDescription>{event.name}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-2 text-sm">
              <CalendarClockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Đóng đăng ký</span>
                <span className="font-medium">{formatDate(event.registrationCloseAt)}</span>
              </div>
            </div>
            <Separator />
            <ol className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
                <span>Thông tin nhân sự đã sẵn sàng</span>
              </li>
              <li className="flex items-start gap-2">
                {registration ? (
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <CircleDashedIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                )}
                <span>{registration ? "Đăng ký đã được ghi nhận" : "Hoàn tất biểu mẫu đăng ký"}</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <PlaneTakeoffIcon className="mt-0.5 size-4 shrink-0" />
                <span>Chờ BTC phân bổ và công bố hành trình</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <UserRoundIcon className="mt-0.5 size-4 shrink-0" />
          <p>Thông tin chưa đúng? Liên hệ Ban Tổ chức để cập nhật hồ sơ nhân sự trước khi gửi.</p>
        </div>
      </aside>
    </div>
  )
}
