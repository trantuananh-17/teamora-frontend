"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRegistrationStats } from "../hooks/registration-admin.hook"

interface RegistrationStatsProps {
  eventId: string
}

export function RegistrationStatsCards({ eventId }: RegistrationStatsProps) {
  const { data: stats } = useRegistrationStats(eventId)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Tổng đăng ký</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Tham gia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{stats.participating}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Không tham gia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-muted-foreground">{stats.notParticipating}</div>
        </CardContent>
      </Card>
    </div>
  )
}
