"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useEventContext } from "@/features/events/components/event-provider"

const GENDER: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
  undisclosed: "Không tiết lộ",
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

/** `employee_profile` as the layout already resolved it — no second request. */
export function ProfileCard() {
  const { employee, registration } = useEventContext()
  const rows = [
    ["Mã nhân viên", employee.employeeCode],
    ["Email", employee.email],
    ["Điện thoại", employee.phone],
    ["Giới tính", employee.gender ? (GENDER[employee.gender] ?? employee.gender) : null],
    ["Địa điểm làm việc", employee.workLocationName],
    ["Team / Bộ phận", registration?.team.name ?? employee.defaultTeamName],
    [
      "Trưởng Team",
      registration
        ? registration.isTeamLeader
          ? "Bạn"
          : (registration.teamLeaderName ?? "Chưa chỉ định")
        : null,
    ],
  ] as const

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback>{initials(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <CardTitle className="truncate">{employee.name}</CardTitle>
            <CardDescription>Dữ liệu đồng bộ từ danh sách nhân sự</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex min-w-0 flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="break-words font-medium">{value ?? "Chưa cập nhật"}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Thông tin chưa đúng? Liên hệ Ban Tổ chức để cập nhật hồ sơ nhân sự.
        </p>
      </CardContent>
    </Card>
  )
}
