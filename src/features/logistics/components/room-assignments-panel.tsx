"use client"
import { useRef, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"
import { z } from "zod"
import {
  BedDoubleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  LayoutGridIcon,
  LockIcon,
  PencilIcon,
  SparklesIcon,
  UnlockIcon,
  UploadIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react"
import { EntityDataTable, EntityEmptyView, EntitySearch } from "@/components/entity-components"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { apiErrorBody } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import {
  useAccommodations,
  useCommitRooms,
  useDiscardRooms,
  useImportRoomAssignments,
  usePreviewRooms,
  useRoomRuns,
  useSetRoomAssignmentLock,
  useUnassignRoom,
} from "../hooks/logistics.hook"
import {
  accommodationsExportUrl,
  roomAssignmentsExportUrl,
  type RoomAssignmentView,
} from "../service/logistics.service"
import { genderLabels, RoomAssignDialog, roomGender } from "./room-assign-dialog"

const viewParam = parseAsStringLiteral(["rooms", "people"]).withDefault("rooms")
const sourceLabels = { import: "Import", manual: "Thủ công", auto: "Tự động" }
type DisplayPerson = RoomAssignmentView & { preview: boolean }

export function RoomAssignmentsPanel({ eventId }: { eventId: string }) {
  const { data } = useAccommodations(eventId)
  const { data: runs } = useRoomRuns(eventId)
  const [view, setView] = useQueryState("view", viewParam)
  const [hotelId, setHotelId] = useQueryState("hotel", parseAsString)
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [removing, setRemoving] = useState<DisplayPerson | null>(null)
  const [importErrors, setImportErrors] = useState<
    { row: number; column?: string; message: string }[]
  >([])
  const fileRef = useRef<HTMLInputElement>(null)
  const importer = useImportRoomAssignments(eventId)
  const preview = usePreviewRooms(eventId)
  const commit = useCommitRooms(eventId)
  const discard = useDiscardRooms(eventId)
  const lock = useSetRoomAssignmentLock(eventId)
  const unassign = useUnassignRoom(eventId)
  const pending = runs.find((run) => run.status === "preview")
  const allocating = preview.isPending || commit.isPending || discard.isPending
  // Manual edits are frozen while a preview is on screen, same as the vehicle bench:
  // committing would silently overwrite whatever was just changed by hand.
  const frozen = Boolean(pending) || allocating || lock.isPending || unassign.isPending
  const roomById = new Map(data.rooms.map((x) => [x.room.id, x]))
  const people: DisplayPerson[] = data.assignments.map((row) => {
    if (!pending || row.assignment?.locked) return { ...row, preview: false }
    const planned = pending.plan.assignments.find((x) => x.registrationId === row.registrationId)
    const target = planned ? roomById.get(planned.roomId) : undefined
    if (target)
      return {
        ...row,
        preview: true,
        assignment: {
          id: `preview-${row.registrationId}`,
          roomId: target.room.id,
          source: "auto",
          locked: false,
          room: target.room,
          hotel: target.hotel,
        },
      }
    if (pending.plan.unassigned.some((x) => x.registrationId === row.registrationId))
      return { ...row, preview: true, assignment: null }
    return { ...row, preview: false }
  })
  // ponytail: client-side filter over the full list — the endpoint is not
  // paginated. Move to a server search when one edition outgrows a few hundred rows.
  const needle = search.trim().toLowerCase()
  const matches = (x: DisplayPerson) =>
    !needle ||
    [x.name, x.email, x.employeeCode ?? "", x.team?.name ?? "", x.assignment?.room.code ?? ""].some(
      (value) => value.toLowerCase().includes(needle),
    )
  // The hotel filter narrows placed people only; the unplaced are the work queue and stay visible.
  const inHotel = (x: DisplayPerson) =>
    !hotelId || !x.assignment || x.assignment.hotel.id === hotelId
  const visible = people.filter((x) => matches(x) && inHotel(x))
  const unassigned = visible.filter((x) => !x.assignment)
  const hotels = data.hotels.filter((x) => !hotelId || x.hotel.id === hotelId)
  const editing = data.assignments.find((x) => x.registrationId === editingId)

  const actions = (person: DisplayPerson) => (
    <div className="flex justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={person.assignment ? "Đổi phòng" : "Xếp phòng"}
            disabled={frozen}
            onClick={() => setEditingId(person.registrationId)}
          >
            {person.assignment ? <PencilIcon /> : <BedDoubleIcon />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{person.assignment ? "Đổi phòng" : "Xếp phòng"}</TooltipContent>
      </Tooltip>
      {person.assignment && !person.preview && (
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label={person.assignment.locked ? "Mở khóa" : "Khóa"}
                disabled={frozen}
                onClick={() =>
                  lock.mutate({
                    assignmentId: person.assignment!.id,
                    locked: !person.assignment!.locked,
                  })
                }
              >
                {person.assignment.locked ? <LockIcon /> : <UnlockIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {person.assignment.locked
                ? "Mở khóa để lần chạy sau được xếp lại"
                : "Khóa, giữ nguyên qua mọi lần chạy lại"}
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Bỏ khỏi phòng"
                disabled={frozen}
                onClick={() => setRemoving(person)}
              >
                <XIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bỏ khỏi phòng</TooltipContent>
          </Tooltip>
        </>
      )}
    </div>
  )

  const columns: ColumnDef<DisplayPerson>[] = [
    {
      accessorKey: "name",
      header: "CBNV",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.employeeCode ?? "—"} · {row.original.email}
          </div>
        </div>
      ),
    },
    {
      id: "team",
      header: "Team",
      cell: ({ row }) => row.original.team?.name ?? "—",
      meta: { priority: "secondary" },
    },
    {
      id: "gender",
      header: "Giới tính",
      cell: ({ row }) => genderLabels[row.original.gender],
      meta: { priority: "tertiary" },
    },
    {
      id: "hotel",
      header: "Khách sạn",
      cell: ({ row }) => row.original.assignment?.hotel.name ?? "—",
      meta: { priority: "secondary" },
    },
    {
      id: "room",
      header: "Phòng",
      cell: ({ row }) =>
        row.original.assignment ? (
          <span className="font-medium">{row.original.assignment.room.code}</span>
        ) : (
          <span className="text-destructive">Chưa xếp</span>
        ),
    },
    {
      id: "source",
      header: "Nguồn",
      cell: ({ row }) => <SourceBadge person={row.original} />,
      meta: { priority: "tertiary" },
    },
    { id: "actions", header: "", cell: ({ row }) => actions(row.original) },
  ]

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={fileRef}
        className="hidden"
        type="file"
        accept=".xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file)
            importer.mutate(file, {
              onSuccess: () => setImportErrors([]),
              onError: async (error) => {
                const body = await apiErrorBody(error)
                const parsed = z
                  .object({
                    totalErrors: z.number(),
                    errors: z.array(
                      z.object({
                        row: z.number(),
                        column: z.string().optional(),
                        message: z.string(),
                      }),
                    ),
                  })
                  .safeParse(body?.error?.details)
                if (parsed.success) setImportErrors(parsed.data.errors)
              },
            })
          e.target.value = ""
        }}
      />
      {pending && (
        <div className="flex flex-col gap-4 rounded-lg border border-info/25 bg-info/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 font-medium">
                Phương án phân phòng tự động
                <Badge variant="secondary">Chưa áp dụng</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Commit sẽ ghi các dòng chưa xếp vào bảng phân phòng; dòng đã khóa được giữ nguyên.
                Hủy thì không thay đổi gì.
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                disabled={allocating}
                onClick={() => discard.mutate(pending.id)}
              >
                <XCircleIcon />
                Hủy phương án
              </Button>
              <Button disabled={allocating} onClick={() => commit.mutate(pending.id)}>
                <CheckCircle2Icon />
                Commit phương án
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Đã xếp" value={pending.stats.assigned} />
            <StatCard
              label="Chưa xếp"
              value={
                <span className={pending.stats.unassigned ? "text-destructive" : undefined}>
                  {pending.stats.unassigned}
                </span>
              }
            />
            <StatCard label="Chỗ trống còn lại" value={pending.stats.remainingSlots} />
            <StatCard
              label="Team bị tách"
              value={
                <span className={pending.stats.teamsSplit ? "text-warning" : undefined}>
                  {pending.stats.teamsSplit}
                </span>
              }
            />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Tabs value={view} onValueChange={(value) => setView(viewParam.parse(value))}>
            <TabsList>
              <TabsTrigger value="rooms">
                <LayoutGridIcon />
                Theo phòng
              </TabsTrigger>
              <TabsTrigger value="people">
                <UsersIcon />
                Theo CBNV
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => preview.mutate()}
              disabled={frozen || !data.rooms.length}
            >
              <SparklesIcon />
              Phân phòng tự động
            </Button>
            <Button
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={frozen || importer.isPending}
            >
              <UploadIcon />
              Import
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={roomAssignmentsExportUrl(eventId)}>
                <DownloadIcon />
                Xuất phân phòng
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={accommodationsExportUrl(eventId)}>
                <DownloadIcon />
                Xuất tổng hợp
              </a>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EntitySearch
            className="min-w-56 flex-1"
            value={search}
            onChange={setSearch}
            placeholder="Tìm tên, email, mã NV, team, số phòng…"
          />
          {data.hotels.length > 1 && (
            <Select
              value={hotelId ?? "all"}
              onValueChange={(value) => setHotelId(value === "all" ? null : value)}
            >
              <SelectTrigger className="w-44" aria-label="Khách sạn">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khách sạn</SelectItem>
                {data.hotels.map((x) => (
                  <SelectItem key={x.hotel.id} value={x.hotel.id}>
                    {x.hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      {!data.assignments.length ? (
        <div className="flex min-h-64 rounded-md border bg-background">
          <EntityEmptyView
            icon={<BedDoubleIcon />}
            title="Chưa có CBNV tham gia"
            message="Danh sách phân phòng chỉ gồm CBNV đã đăng ký tham gia kỳ này."
          />
        </div>
      ) : view === "people" ? (
        <div className="flex min-h-64 flex-col overflow-hidden rounded-md border bg-background">
          <EntityDataTable
            columns={columns}
            data={[...unassigned, ...visible.filter((x) => x.assignment)]}
            hasFilters={Boolean(needle || hotelId)}
            noResultsText="Không có CBNV nào khớp bộ lọc."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {unassigned.length > 0 && (
            <section className="flex flex-col gap-2">
              <h3 className="text-base font-semibold">
                Chưa xếp <span className="text-destructive">({unassigned.length})</span>
              </h3>
              <div className="divide-y rounded-lg border bg-background">
                {unassigned.map((person) => (
                  <div key={person.registrationId} className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{person.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {person.employeeCode ?? "—"} · {person.team?.name ?? "Chưa có team"} ·{" "}
                        {genderLabels[person.gender]}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={frozen}
                      onClick={() => setEditingId(person.registrationId)}
                    >
                      <BedDoubleIcon />
                      Xếp phòng
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          )}
          {hotels.map(({ hotel }) => {
            const rooms = data.rooms
              .filter((x) => x.room.hotelId === hotel.id)
              .map((item) => ({
                ...item,
                occupants: people.filter((x) => x.assignment?.roomId === item.room.id),
              }))
            const shown = needle
              ? rooms.filter(
                  (x) => x.room.code.toLowerCase().includes(needle) || x.occupants.some(matches),
                )
              : rooms
            const capacity = rooms.reduce((sum, x) => sum + x.room.capacity, 0)
            const placed = rooms.reduce((sum, x) => sum + x.occupants.length, 0)
            return (
              <section key={hotel.id} className="flex flex-col gap-2">
                <h3 className="flex items-baseline gap-2 text-base font-semibold">
                  {hotel.name}
                  <span className="text-sm font-normal text-muted-foreground tabular-nums">
                    {placed}/{capacity}
                  </span>
                </h3>
                {shown.length ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {shown.map((item) => {
                      const full = item.occupants.length >= item.room.capacity
                      const gender = roomGender(item.occupants)
                      return (
                        <div
                          key={item.room.id}
                          className={cn(
                            "flex flex-col gap-2 rounded-lg border bg-card p-3",
                            full && "bg-muted/40",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0 truncate">
                              <span className="font-medium">{item.room.code}</span>
                              <span className="text-xs text-muted-foreground">
                                {" "}
                                · {item.roomType.name}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "text-sm tabular-nums",
                                item.occupants.length > item.room.capacity
                                  ? "text-destructive"
                                  : full && "text-muted-foreground",
                              )}
                            >
                              {item.occupants.length}/{item.room.capacity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            Giới tính:
                            {gender.mixed ? (
                              <Badge variant="destructive">{gender.label}</Badge>
                            ) : (
                              <span>{gender.label}</span>
                            )}
                          </div>
                          {item.occupants.length ? (
                            <div className="divide-y">
                              {item.occupants.map((person) => (
                                <div
                                  key={person.registrationId}
                                  className="flex items-center gap-2 py-1.5"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm">{person.name}</div>
                                    <div className="truncate text-xs text-muted-foreground">
                                      {person.team?.name ?? "Chưa có team"}
                                    </div>
                                  </div>
                                  <SourceBadge person={person} />
                                  {actions(person)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">Còn trống</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {rooms.length ? "Không có phòng nào khớp bộ lọc." : "Chưa có phòng."}
                  </p>
                )}
              </section>
            )
          })}
        </div>
      )}
      {editing && (
        <RoomAssignDialog
          key={editing.registrationId}
          eventId={eventId}
          person={editing}
          rooms={data.rooms}
          assignments={data.assignments}
          open
          onOpenChange={(open) => !open && setEditingId(null)}
        />
      )}
      <Dialog open={Boolean(removing)} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Bỏ {removing?.name} khỏi phòng {removing?.assignment?.room.code}
            </DialogTitle>
            <DialogDescription>
              CBNV này về danh sách chưa xếp và lần phân phòng tự động sau có thể xếp lại. Thao tác
              được ghi vào nhật ký.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={unassign.isPending}
              onClick={() =>
                removing?.assignment &&
                unassign.mutate(removing.assignment.id, { onSuccess: () => setRemoving(null) })
              }
            >
              Bỏ khỏi phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={importErrors.length > 0} onOpenChange={(open) => !open && setImportErrors([])}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>File phân phòng có lỗi</DialogTitle>
            <DialogDescription>
              Chưa có dòng nào được ghi. Sửa các ô dưới đây rồi import lại.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto rounded-lg border">
            <div className="divide-y">
              {importErrors.map((error, index) => (
                <div
                  key={`${error.row}-${error.column}-${index}`}
                  className="grid grid-cols-[5rem_9rem_1fr] gap-3 p-3 text-sm"
                >
                  <span>Dòng {error.row}</span>
                  <span className="text-muted-foreground">{error.column ?? "—"}</span>
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setImportErrors([])}>Đã hiểu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SourceBadge({ person }: { person: DisplayPerson }) {
  if (person.preview) return <Badge>Preview</Badge>
  if (!person.assignment) return <span className="text-muted-foreground">—</span>
  return (
    <span className="inline-flex items-center gap-1">
      <Badge variant="outline">{sourceLabels[person.assignment.source]}</Badge>
      {person.assignment.locked && (
        <LockIcon className="size-3 text-muted-foreground" aria-label="Đã khóa" />
      )}
    </span>
  )
}
