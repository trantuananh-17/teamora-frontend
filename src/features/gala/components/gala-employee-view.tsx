"use client"

import { PartyPopperIcon, TimerIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  useConfirmGalaSeats,
  useGalaSeats,
  useGalaSession,
  useGalaTables,
  useHoldGalaSeats,
  useReleaseGalaSeats,
  useTurnCountdown,
} from "../hooks/gala.hook"
import { SeatMap, type SeatMapSeat } from "./seat-map"

/**
 * The employee's Gala tab. Everyone sees the map and their team's seats; the
 * team leader gets the hold/confirm controls only during their team's turn.
 * The backend checks the turn again on every call — this is UX, not the guard.
 */
export function GalaEmployeeView({ eventId }: { eventId: string }) {
  const { data: view, dataUpdatedAt } = useGalaSession(eventId)
  const { data: allTables } = useGalaTables(eventId)
  const session = view.session
  const status = session?.status ?? null
  const { data: seats } = useGalaSeats(eventId, status === "in_progress")
  const remaining = useTurnCountdown({
    turnEndsAt: session?.turnEndsAt ?? null,
    serverNow: view.serverNow,
    dataUpdatedAt,
  })
  const hold = useHoldGalaSeats(eventId)
  const release = useReleaseGalaSeats(eventId)
  const confirm = useConfirmGalaSeats(eventId)

  const tables = allTables.filter((table) => table.active)
  const myTeam = view.queue.find((row) => row.teamId === view.me.teamId)
  const mySeats = seats.filter((seat) => seat.status === "mine")
  const myTurn =
    status === "in_progress" &&
    view.me.isTeamLeader &&
    view.me.teamId !== null &&
    session?.currentTeamId === view.me.teamId
  const busy = hold.isPending || release.isPending || confirm.isPending

  if (!session || status === "draft" || status === "drawn") {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <PartyPopperIcon />
              </EmptyMedia>
              <EmptyTitle>Ban Tổ chức chưa mở phiên chọn ghế</EmptyTitle>
              <EmptyDescription>
                {status === "drawn" && myTeam
                  ? `Team ${myTeam.teamName} bốc được thứ tự ${myTeam.position}. Quay lại khi phiên bắt đầu.`
                  : "Sơ đồ bàn và ghế Gala Dinner của Team bạn sẽ hiện tại đây khi phiên bắt đầu."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const mapSeats: SeatMapSeat[] = seats.map((seat) => ({
    ...seat,
    title: seat.teamName
      ? `${seat.tableName} · ghế ${seat.seatNo} — ${seat.teamName}`
      : `${seat.tableName} · ghế ${seat.seatNo}`,
  }))

  return (
    <div className="flex flex-col gap-6">
      {myTurn && myTeam && (
        <Alert>
          <TimerIcon />
          <AlertTitle>
            Đến lượt Team bạn — còn <span className="tabular-nums">{remaining ?? 0}</span> giây
          </AlertTitle>
          <AlertDescription>
            Bấm ghế trống để giữ, bấm lại để nhả. Chốt khi đủ {myTeam.memberCount} ghế cho{" "}
            {myTeam.memberCount} thành viên.
          </AlertDescription>
          <div className="col-start-2 mt-2 flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              disabled={busy || mySeats.length !== myTeam.memberCount}
              onClick={() => confirm.mutate(undefined)}
            >
              Xác nhận {mySeats.length}/{myTeam.memberCount}
            </Button>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Ghế của Team {myTeam?.teamName ?? "bạn"}</CardTitle>
          <CardDescription>
            {status === "completed"
              ? "Phiên chọn ghế đã kết thúc."
              : myTeam
                ? `Thứ tự ${myTeam.position} · ${myTeam.seatCount}/${myTeam.memberCount} ghế · Trưởng Team: ${
                    view.me.isTeamLeader ? "bạn" : (myTeam.leaderName ?? "chưa chỉ định")
                  }`
                : "Team bạn không có trong phiên này."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mySeats.length > 0 ? (
            <ul className="flex flex-wrap gap-2 text-sm">
              {mySeats.map((seat) => (
                <li
                  key={seat.id}
                  className={
                    seat.held
                      ? "rounded-sm border border-dashed border-primary px-2 py-0.5"
                      : "rounded-sm border border-primary/25 bg-primary/10 px-2 py-0.5 text-primary"
                  }
                >
                  Bàn {seat.tableName} · ghế {seat.seatNo}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {status === "completed" ? "Team chưa được xếp ghế." : "Team chưa chọn ghế."}
            </p>
          )}
        </CardContent>
      </Card>

      {tables.length > 0 && (
        <SeatMap
          tables={tables}
          seats={mapSeats}
          selectable={(seat) =>
            Boolean(myTurn) &&
            !busy &&
            (seat.status === "available" || (seat.status === "mine" && Boolean(seat.held)))
          }
          onToggleSeat={(seat) => {
            if (seat.status === "available") hold.mutate({ seatIds: [seat.id] })
            else release.mutate({ seatIds: [seat.id] })
          }}
        />
      )}
    </div>
  )
}
