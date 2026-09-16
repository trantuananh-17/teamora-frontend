"use client"
import Link from "next/link"
import {
  BedDoubleIcon,
  BusIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CircleUserRoundIcon,
  ListTodoIcon,
  PlaneIcon,
  UserCheckIcon,
  UserMinusIcon,
  UsersIcon,
} from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotificationsSuspense } from "@/features/notifications/hooks/notifications.hook"
import { useDashboard } from "../hooks/journey.hook"

// Only `total` is read, so one row is enough. The overview page prefetches the
// same literal query; keep both in sync or the count fetches twice.
const FAILED_EMAILS_QUERY = { status: "failed", limit: 1 } as const

const legLabels: Record<string, string> = {
  origin_to_airport: "Nơi ở → sân bay",
  airport_to_hotel: "Sân bay → khách sạn",
  hotel_to_airport: "Khách sạn → sân bay",
  airport_to_origin: "Sân bay → nơi ở",
}

function Utilization({
  label,
  assigned,
  capacity,
}: {
  label: string
  assigned: number
  capacity: number
}) {
  const percent = capacity ? Math.round((assigned / capacity) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between gap-3 text-sm">
        <span className="truncate">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {assigned}/{capacity} · {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${percent > 100 ? "bg-destructive" : percent === 100 ? "bg-warning" : "bg-primary"}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  )
}

function CapacityCard({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: React.ReactNode
  title: string
  items: { id: string; label: string; assigned: number; capacity: number }[]
  emptyText: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length ? (
          items.map((item) => <Utilization key={item.id} {...item} />)
        ) : (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        )}
      </CardContent>
    </Card>
  )
}

function PendingItem({ count, label, href }: { count: number; label: string; href: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-muted"
      >
        <span>
          <span className="font-semibold tabular-nums text-destructive">{count}</span> {label}
        </span>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
      </Link>
    </li>
  )
}

export function DashboardOverview({ eventId }: { eventId: string }) {
  const { data } = useDashboard(eventId)
  const { data: failedEmails } = useNotificationsSuspense(eventId, FAILED_EMAILS_QUERY)
  const base = `/admin/events/${eventId}`
  const pending = [
    {
      count: data.unassigned.outboundFlight,
      label: "CBNV chưa có chuyến bay đi",
      href: `${base}/flights/allocation`,
    },
    {
      count: data.unassigned.returnFlight,
      label: "CBNV chưa có chuyến bay về",
      href: `${base}/flights/allocation`,
    },
    { count: data.unassigned.room, label: "CBNV chưa có phòng", href: `${base}/accommodations` },
    {
      count: failedEmails.total,
      label: "email gửi lỗi",
      href: `${base}/notifications?status=failed`,
    },
  ].filter((item) => item.count > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<UsersIcon className="size-4" />}
          label="Tổng CBNV"
          value={data.people.totalEmployees}
          hint={`${data.people.unregistered} chưa đăng ký`}
        />
        <StatCard
          icon={<UserCheckIcon className="size-4" />}
          label="Đã đăng ký"
          value={data.people.registered}
          hint={`${data.people.participating} tham gia · ${data.people.declined} từ chối`}
        />
        <StatCard
          icon={<CircleUserRoundIcon className="size-4" />}
          label="Ca nguyện vọng"
          value={`${data.people.shift1}/${data.people.shift2}`}
          hint="Ca 1 / Ca 2"
        />
        <StatCard
          icon={<UserMinusIcon className="size-4" />}
          label="Chưa đủ phân bổ"
          value={
            data.unassigned.outboundFlight + data.unassigned.returnFlight + data.unassigned.room
          }
          hint={`${data.unassigned.outboundFlight} đi · ${data.unassigned.returnFlight} về · ${data.unassigned.room} phòng`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CapacityCard
          icon={<PlaneIcon className="size-4" />}
          title="Chuyến bay"
          items={data.capacity.flights.map((item) => ({ ...item, label: item.code }))}
          emptyText="Chưa khai báo chuyến bay."
        />
        <CapacityCard
          icon={<BusIcon className="size-4" />}
          title="Xe"
          items={data.capacity.vehicles.map((item) => ({ ...item, label: item.code }))}
          emptyText="Chưa khai báo xe."
        />
        <CapacityCard
          icon={<BedDoubleIcon className="size-4" />}
          title="Phòng"
          items={data.capacity.rooms.map((item) => ({
            ...item,
            label: `${item.hotel} · ${item.code}`,
          }))}
          emptyText="Chưa khai báo phòng."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTodoIcon className="size-4" />
              Việc chưa xong
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length ? (
              <ul className="flex flex-col">
                {pending.map((item) => (
                  <PendingItem key={item.label} {...item} />
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-success" />
                Không còn việc tồn đọng.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BusIcon className="size-4" />
              Nhu cầu xe theo chặng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {Object.entries(data.transportNeeds).map(([leg, total]) => (
                <li key={leg} className="flex justify-between gap-3 text-sm">
                  <span>{legLabels[leg] ?? leg}</span>
                  <span className="tabular-nums text-muted-foreground">{total} người</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
