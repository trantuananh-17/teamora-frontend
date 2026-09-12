"use client"
import { BedDoubleIcon, BusIcon, CircleUserRoundIcon, PlaneIcon, UserCheckIcon, UserMinusIcon, UsersIcon } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useDashboard } from "../hooks/journey.hook"

const legLabels: Record<string, string> = { origin_to_airport: "Nơi ở → sân bay", airport_to_hotel: "Sân bay → khách sạn", hotel_to_airport: "Khách sạn → sân bay", airport_to_origin: "Sân bay → nơi ở" }
function Utilization({ label, assigned, capacity }: { label: string; assigned: number; capacity: number }) { const percent = capacity ? Math.round(assigned / capacity * 100) : 0; return <div className="space-y-1"><div className="flex justify-between gap-3 text-sm"><span className="truncate">{label}</span><span className="tabular-nums text-muted-foreground">{assigned}/{capacity} · {percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${percent > 100 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${Math.min(100, percent)}%` }} /></div></div> }

export function DashboardOverview({ eventId }: { eventId: string }) { const { data } = useDashboard(eventId); return <div className="space-y-6">
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <StatCard icon={<UsersIcon className="size-4" />} label="Tổng CBNV" value={data.people.totalEmployees} hint={`${data.people.unregistered} chưa đăng ký`} />
    <StatCard icon={<UserCheckIcon className="size-4" />} label="Đã đăng ký" value={data.people.registered} hint={`${data.people.participating} tham gia · ${data.people.declined} từ chối`} />
    <StatCard icon={<CircleUserRoundIcon className="size-4" />} label="Ca nguyện vọng" value={`${data.people.shift1}/${data.people.shift2}`} hint="Ca 1 / Ca 2" />
    <StatCard icon={<UserMinusIcon className="size-4" />} label="Chưa đủ phân bổ" value={data.unassigned.outboundFlight + data.unassigned.returnFlight + data.unassigned.room} hint={`${data.unassigned.outboundFlight} đi · ${data.unassigned.returnFlight} về · ${data.unassigned.room} phòng`} />
  </div>
  <Card><CardHeader><CardTitle className="flex items-center gap-2"><BusIcon className="size-5" />Nhu cầu xe theo chặng</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{Object.entries(data.transportNeeds).map(([leg, total]) => <Badge key={leg} variant="outline" className="px-3 py-1.5">{legLabels[leg] ?? leg}: {total}</Badge>)}</CardContent></Card>
  <div className="grid gap-4 lg:grid-cols-3">
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><PlaneIcon className="size-4" />Chuyến bay</CardTitle></CardHeader><CardContent className="space-y-3">{data.capacity.flights.map((item) => <Utilization key={item.id} label={item.code} assigned={item.assigned} capacity={item.capacity} />)}</CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BusIcon className="size-4" />Xe</CardTitle></CardHeader><CardContent className="space-y-3">{data.capacity.vehicles.map((item) => <Utilization key={item.id} label={item.code} assigned={item.assigned} capacity={item.capacity} />)}</CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BedDoubleIcon className="size-4" />Phòng</CardTitle></CardHeader><CardContent className="space-y-3">{data.capacity.rooms.map((item) => <Utilization key={item.id} label={`${item.hotel} · ${item.code}`} assigned={item.assigned} capacity={item.capacity} />)}</CardContent></Card>
  </div>
</div> }
