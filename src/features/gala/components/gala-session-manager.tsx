"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { TimerIcon } from "lucide-react"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { GalaQueueStatusBadge, GalaSessionStatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  useConfirmGalaSeats,
  useDeleteGalaAssignment,
  useGalaSeats,
  useGalaSession,
  useGalaSessionAction,
  useGalaTables,
  useHoldGalaSeats,
  useReleaseGalaSeats,
  useTurnCountdown,
  useUpsertGalaSession,
} from "../hooks/gala.hook"
import type { GalaQueueRow, SeatView } from "../service/gala.service"
import { SeatMap, type SeatMapSeat } from "./seat-map"

const DEFAULT_TURN_SECONDS = 120

const queueColumns: ColumnDef<GalaQueueRow>[] = [
  { accessorKey: "position", header: "#", cell: ({ row }) => row.original.position },
  {
    accessorKey: "teamName",
    header: "Team",
    cell: ({ row }) => <span className="font-medium">{row.original.teamName}</span>,
  },
  {
    accessorKey: "leaderName",
    header: "Trưởng Team",
    meta: { priority: "secondary" },
    cell: ({ row }) =>
      row.original.leaderName ?? <span className="text-muted-foreground">Chưa chỉ định</span>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <GalaQueueStatusBadge status={row.original.status} />,
  },
  {
    id: "seats",
    header: "Ghế / Thành viên",
    meta: { priority: "secondary" },
    cell: ({ row }) => `${row.original.seatCount} / ${row.original.memberCount}`,
  },
]

export function GalaSessionManager({ eventId }: { eventId: string }) {
  const { data: view, dataUpdatedAt } = useGalaSession(eventId)
  const { data: allTables } = useGalaTables(eventId)
  const tables = allTables.filter((table) => table.active)
  const session = view.session
  const status = session?.status ?? null
  const { data: seats } = useGalaSeats(eventId, status === "in_progress")
  const remaining = useTurnCountdown({
    turnEndsAt: session?.turnEndsAt ?? null,
    serverNow: view.serverNow,
    dataUpdatedAt,
  })

  const [turnSeconds, setTurnSeconds] = useState(
    String(session?.turnSeconds ?? DEFAULT_TURN_SECONDS),
  )
  const [assistTeamId, setAssistTeamId] = useState<string>("")
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [removing, setRemoving] = useState<SeatView | null>(null)
  const [reason, setReason] = useState("")

  const upsert = useUpsertGalaSession(eventId)
  const draw = useGalaSessionAction(eventId, "draw")
  const start = useGalaSessionAction(eventId, "start")
  const skip = useGalaSessionAction(eventId, "skip")
  const complete = useGalaSessionAction(eventId, "complete")
  const hold = useHoldGalaSeats(eventId, () => setSelectedIds(new Set()))
  const release = useReleaseGalaSeats(eventId)
  const confirm = useConfirmGalaSeats(eventId, () => setSelectedIds(new Set()))
  const remove = useDeleteGalaAssignment(eventId, () => {
    setRemoving(null)
    setReason("")
  })

  const done = view.queue.filter((row) => row.status === "done").length
  const pending = view.queue.filter(
    (row) => row.status === "waiting" || row.status === "active",
  ).length
  const current = view.queue.find((row) => row.teamId === session?.currentTeamId)
  const assistTeam = view.queue.find((row) => row.teamId === assistTeamId)
  const assistSeats = seats.filter((seat) => seat.teamId === assistTeamId)
  const configLocked = status === "in_progress" || status === "completed"

  // The backend computes `mine` for the organiser's own registration, which is
  // meaningless here: on this screen "mine" is whichever team is being seated.
  const mapSeats: SeatMapSeat[] = seats.map((seat) => ({
    ...seat,
    status: seat.teamId ? (seat.teamId === assistTeamId ? "mine" : "taken") : seat.status,
    title: seat.teamName
      ? `${seat.tableName} · ghế ${seat.seatNo} — ${seat.teamName}${seat.held ? " (đang giữ)" : ""}`
      : `${seat.tableName} · ghế ${seat.seatNo}`,
  }))

  function onToggleSeat(mapSeat: SeatMapSeat) {
    const seat = seats.find((item) => item.id === mapSeat.id)
    if (!seat) return
    if (seat.status === "available" && assistTeamId) {
      setSelectedIds((current) => {
        const next = new Set(current)
        if (next.has(seat.id)) next.delete(seat.id)
        else next.add(seat.id)
        return next
      })
    } else if (seat.teamId === assistTeamId && seat.held) {
      release.mutate({ seatIds: [seat.id], teamId: assistTeamId })
    } else if (seat.assignmentId && !seat.held) {
      setRemoving(seat)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Phiên chọn ghế Gala Dinner"
        description="Bốc thăm thứ tự, mở phiên, theo dõi lượt của từng Team và xếp hộ khi cần."
        badges={<GalaSessionStatusBadge status={status ?? "draft"} />}
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Teams" value={view.queue.length} />
        <StatCard label="Đã chốt" value={done} />
        <StatCard
          label="Còn chờ"
          value={pending}
          hint={
            view.queue.some((row) => row.status === "skipped")
              ? `${view.queue.filter((row) => row.status === "skipped").length} Team bỏ lượt — cần xếp hộ`
              : undefined
          }
        />
      </div>

      <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            upsert.mutate(Number(turnSeconds))
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="gala-turn-seconds">Giây mỗi lượt (30–900)</Label>
            <Input
              id="gala-turn-seconds"
              type="number"
              min={30}
              max={900}
              required
              className="w-32"
              value={turnSeconds}
              disabled={configLocked}
              onChange={(e) => setTurnSeconds(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" disabled={configLocked || upsert.isPending}>
            Lưu
          </Button>
        </form>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!session || !(status === "draft" || status === "drawn") || draw.isPending}
            onClick={() => draw.mutate()}
          >
            {status === "drawn" ? "Bốc thăm lại" : "Bốc thăm"}
          </Button>
          <Button disabled={status !== "drawn" || start.isPending} onClick={() => start.mutate()}>
            Bắt đầu
          </Button>
          <Button
            variant="outline"
            disabled={status !== "in_progress" || skip.isPending}
            onClick={() => skip.mutate()}
          >
            Bỏ qua lượt
          </Button>
          <Button
            variant="outline"
            disabled={status !== "in_progress" || pending > 0 || complete.isPending}
            onClick={() => complete.mutate()}
          >
            Kết thúc
          </Button>
        </div>
        {!session && (
          <p className="text-xs text-muted-foreground">
            Lưu giây mỗi lượt để tạo phiên, rồi bốc thăm thứ tự các Team có người tham gia.
          </p>
        )}
        {status === "in_progress" && current && (
          <p className="flex items-center gap-2 text-sm">
            <TimerIcon className="size-4 text-info" aria-hidden="true" />
            Lượt của <span className="font-medium">{current.teamName}</span> — còn{" "}
            <span className="font-semibold tabular-nums">{remaining ?? 0}</span> giây
          </p>
        )}
      </div>

      <div className="overflow-auto rounded-md border bg-background">
        <EntityDataTable
          columns={queueColumns}
          data={view.queue}
          emptyView={
            <EntityEmptyView
              title="Chưa có thứ tự"
              message="Bốc thăm để xếp thứ tự các Team có CBNV tham gia."
            />
          }
        />
      </div>

      {tables.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-2">
              <Label>Xếp hộ Team</Label>
              <Select value={assistTeamId} onValueChange={setAssistTeamId}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Chọn Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {/* A skipped team has a fresh row at the end of the queue, so the
                        skipped one is history — listing it would show the team twice. */}
                    {view.queue
                      .filter((row) => row.status !== "skipped")
                      .map((row) => (
                        <SelectItem key={row.id} value={row.teamId}>
                          {row.position}. {row.teamName}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={!assistTeamId || selectedIds.size === 0 || hold.isPending}
              onClick={() => hold.mutate({ seatIds: [...selectedIds], teamId: assistTeamId })}
            >
              Giữ ghế ({selectedIds.size})
            </Button>
            <Button
              disabled={!assistTeam || assistSeats.length === 0 || confirm.isPending}
              onClick={() => confirm.mutate(assistTeamId)}
            >
              Xác nhận {assistTeam ? `${assistSeats.length}/${assistTeam.memberCount}` : ""}
            </Button>
            <p className="basis-full text-xs text-muted-foreground">
              Bấm ghế trống để chọn, bấm ghế đang giữ để nhả, bấm ghế đã chốt để gỡ.
            </p>
          </div>
          <SeatMap
            tables={tables}
            seats={mapSeats}
            selectedIds={selectedIds}
            selectable={(seat) =>
              seat.status === "available"
                ? Boolean(assistTeamId)
                : seat.status === "mine" || (seat.status === "taken" && !seat.held)
            }
            onToggleSeat={onToggleSeat}
          />
        </div>
      )}

      <Dialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Gỡ ghế {removing?.seatNo} bàn {removing?.tableName}?
            </DialogTitle>
            <DialogDescription>
              Ghế này đã chốt cho Team {removing?.teamName}. Gỡ sẽ được ghi vào nhật ký kèm lý do,
              và Team sẽ nhận email thay đổi.
            </DialogDescription>
          </DialogHeader>
          <form
            id="gala-remove-form"
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              if (removing?.assignmentId)
                remove.mutate({ assignmentId: removing.assignmentId, reason: reason.trim() })
            }}
          >
            <Label htmlFor="gala-remove-reason">Lý do</Label>
            <Textarea
              id="gala-remove-reason"
              required
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Hủy
            </Button>
            <Button
              type="submit"
              form="gala-remove-form"
              variant="destructive"
              disabled={remove.isPending}
            >
              Gỡ ghế
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
