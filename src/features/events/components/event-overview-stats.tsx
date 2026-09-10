"use client"

import { MapPinIcon, UsersIcon, UsersRoundIcon } from "lucide-react"

import { StatCard } from "@/components/stat-card"
import { useEmployeesSuspense } from "@/features/employees/hooks/employees.hook"
import { usePickupPointsSuspense } from "@/features/pickup-points/hooks/pickup-points.hook"
import { useTeamsSuspense } from "@/features/teams/hooks/teams.hook"

/**
 * What is configured so far, which is the question this screen exists to answer
 * during S1: an organiser setting up an edition needs to know whether the master
 * data is ready before importing anyone.
 *
 * The registration and allocation figures §10 asks for arrive with the tables
 * that hold them, in S2 and S5.
 */
export function EventOverviewStats({ eventId }: { eventId: string }) {
  const { data: teams } = useTeamsSuspense(eventId)
  const { data: pickupPoints } = usePickupPointsSuspense(eventId)
  const { data: employees } = useEmployeesSuspense()

  const activeTeams = teams.filter((team) => team.active)
  const sharedTeams = activeTeams.filter((team) => team.eventId === null)
  const activePoints = pickupPoints.filter((point) => point.active)
  const withTeam = employees.filter((employee) => employee.defaultTeamId)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={<UsersRoundIcon className="size-4" />}
        label="Team đang dùng"
        value={activeTeams.length}
        hint={`${sharedTeams.length} dùng chung mọi kỳ, ${activeTeams.length - sharedTeams.length} riêng kỳ này`}
      />
      <StatCard
        icon={<MapPinIcon className="size-4" />}
        label="Điểm đón đang dùng"
        value={activePoints.length}
        hint={
          activePoints.length === 0
            ? "CBNV chưa chọn được điểm đón nào khi đăng ký"
            : "Dùng cho cả bốn chặng xe"
        }
      />
      <StatCard
        icon={<UsersIcon className="size-4" />}
        label="CBNV đã import"
        value={employees.length}
        hint={
          employees.length === 0
            ? "Import danh sách trước khi mở đăng ký"
            : `${withTeam.length} người đã có Team mặc định`
        }
      />
    </div>
  )
}
