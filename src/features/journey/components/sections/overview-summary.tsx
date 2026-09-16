"use client"

import Link from "next/link"
import { BedDoubleIcon, BusIcon, ChevronRightIcon, PartyPopperIcon, PlaneIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEventContext } from "@/features/events/components/event-provider"
import { useJourney } from "../../hooks/journey.hook"
import { EmptyLine, NOT_PARTICIPATING, legLabels, time } from "./shared"

/** "Bàn A · ghế 3, 4" — one entry per table, seats already ordered by the backend. */
function galaSummary(seats: { tableName: string; seatNo: number }[]) {
  const byTable = new Map<string, number[]>()
  for (const seat of seats)
    byTable.set(seat.tableName, [...(byTable.get(seat.tableName) ?? []), seat.seatNo])
  return [...byTable]
    .map(([table, numbers]) => `Bàn ${table} · ghế ${numbers.join(", ")}`)
    .join(" — ")
}

/** One line per allocation, each linking to its tab (S7-SPEC §B1 Tổng quan). */
export function OverviewSummary({ eventId }: { eventId: string }) {
  const { data: journey } = useJourney(eventId)
  const { registration } = useEventContext()
  const leader = registration?.isTeamLeader ? "bạn" : registration?.teamLeaderName
  const outbound = journey.flights.find(({ flight }) => flight.direction === "outbound")?.flight
  const firstLeg = journey.vehicles[0]

  const lines = [
    {
      icon: PlaneIcon,
      title: "Chuyến bay",
      url: "/flights",
      text: outbound
        ? `Chiều đi ${outbound.code} · ${time(outbound.departAt)}`
        : "BTC chưa phân chuyến bay",
    },
    {
      icon: BusIcon,
      title: "Xe đưa đón",
      url: "/transport",
      text: firstLeg
        ? `${journey.vehicles.length} chặng · ${legLabels[firstLeg.assignment.leg] ?? firstLeg.assignment.leg} tập trung ${time(firstLeg.vehicle.gatherAt)}`
        : "Không đăng ký xe hoặc BTC chưa phân xe",
    },
    {
      icon: BedDoubleIcon,
      title: "Khách sạn",
      url: "/hotel",
      text: journey.accommodation
        ? `${journey.accommodation.hotel.name} · Phòng ${journey.accommodation.room.code}`
        : "BTC chưa phân phòng",
    },
    {
      icon: PartyPopperIcon,
      title: "Gala Dinner",
      url: "/gala",
      text: journey.gala ? galaSummary(journey.gala.seats) : "Team chưa chọn ghế",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hành trình của bạn</CardTitle>
        <CardDescription>
          {journey.event.name} · Team {journey.participant.team.name}
          {leader ? ` · Trưởng Team: ${leader}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {!journey.participant.participating ? (
          <EmptyLine>{NOT_PARTICIPATING}</EmptyLine>
        ) : (
          lines.map((line) => (
            <Link
              key={line.url}
              href={line.url}
              className="flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              <line.icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{line.title}</span>
                <span className="truncate text-xs text-muted-foreground">{line.text}</span>
              </span>
              <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
