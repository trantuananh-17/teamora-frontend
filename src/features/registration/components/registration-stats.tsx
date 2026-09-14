"use client"

import { StatCard } from "@/components/stat-card"
import { useRegistrationStats } from "../hooks/registration-admin.hook"

export function RegistrationStatsCards({ eventId }: { eventId: string }) {
  const { data: stats } = useRegistrationStats(eventId)

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard label="Tổng đăng ký" value={stats.total} />
      <StatCard
        label="Tham gia"
        value={<span className="text-success">{stats.participating}</span>}
      />
      <StatCard
        label="Không tham gia"
        value={<span className="text-muted-foreground">{stats.notParticipating}</span>}
      />
    </div>
  )
}
