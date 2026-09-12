"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { AlertTriangleIcon, ArrowLeftIcon, CheckCircle2Icon, LockIcon, RefreshCwIcon, UnlockIcon, UserRoundCogIcon, XIcon } from "lucide-react"

import { EntityContainer, EntityDataTable, EntityEmptyView, EntityPagination } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  useAllocationRuns, useCommitAllocation, useDiscardAllocation, useFlightAssignments,
  useFlights, useManualAssignFlight, usePreviewAllocation, useSetAssignmentLock,
} from "../hooks/flights.hook"
import type { FlightDirection, PageParams, RegistrationFlight } from "../service/flights.service"

const flagLabels: Record<string, string> = {
  team_split: "Tách team", shift_unmet: "Lệch ca", shift_locked_unmet: "Lệch ca bắt buộc",
  unassigned: "Chưa xếp", over_capacity: "Vượt chỗ",
}

export function AllocationWorkbench({ eventId, pagination }: { eventId: string; pagination: PageParams }) {
  const { data: flightsPage } = useFlights(eventId, {}, { page: 1, pageSize: 100 })
  const { data: registrations } = useFlightAssignments(eventId, pagination)
  const { data: runs } = useAllocationRuns(eventId)
  const preview = usePreviewAllocation(eventId)
  const commit = useCommitAllocation(eventId)
  const discard = useDiscardAllocation(eventId)
  const locker = useSetAssignmentLock(eventId)
  const [manual, setManual] = useState<{ row: RegistrationFlight; direction: FlightDirection } | null>(null)
  const [confirmAction, setConfirmAction] = useState<"commit" | "discard" | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const latest = runs[0]
  const pendingRun = runs.find((run) => run.status === "preview")
  const canPreview = flightsPage.items.length > 0 && registrations.total > 0
  const displayedRegistrations = useMemo(() => {
    if (!pendingRun) return registrations.items
    const flightById = new Map(flightsPage.items.map((flight) => [flight.id, flight]))
    return registrations.items.map((registration) => {
      const assignments = { ...registration.assignments }
      for (const direction of ["outbound", "return"] as const) {
        const current = assignments[direction]
        if (current?.locked) continue
        const planned = pendingRun.plan.assignments.find(
          (item) => item.registrationId === registration.registrationId && item.direction === direction,
        )
        const target = planned ? flightById.get(planned.flightId) : undefined
        assignments[direction] = planned && target ? {
          id: `preview:${registration.registrationId}:${direction}`,
          flight: target,
          source: "auto",
          locked: false,
          flags: planned.flags,
          assignedAt: pendingRun.createdAt,
        } : null
      }
      return { ...registration, assignments }
    })
  }, [flightsPage.items, pendingRun, registrations.items])

  const columns = useMemo<ColumnDef<RegistrationFlight>[]>(() => [
    { accessorKey: "user.name", header: "CBNV", cell: ({ row }) => <div><div className="font-medium">{row.original.user.name}</div><div className="text-xs text-muted-foreground">{row.original.team.name}</div></div> },
    { accessorKey: "shiftPreference", header: "Ca đăng ký", cell: ({ row }) => <div className="flex items-center gap-1"><span>{row.original.shiftPreference === "shift_1" ? "Ca 1" : row.original.shiftPreference === "shift_2" ? "Ca 2" : "—"}</span>{row.original.shiftLocked && <LockIcon className="size-3.5 text-muted-foreground" />}</div>, meta: { priority: "secondary" } },
    { id: "outbound", header: "Chiều đi", cell: ({ row }) => <AssignmentCell assignment={row.original.assignments.outbound} onEdit={() => setManual({ row: row.original, direction: "outbound" })} onLock={() => { const item = row.original.assignments.outbound; if (item) locker.mutate({ assignmentId: item.id, locked: !item.locked }) }} /> },
    { id: "return", header: "Chiều về", cell: ({ row }) => <AssignmentCell assignment={row.original.assignments.return} onEdit={() => setManual({ row: row.original, direction: "return" })} onLock={() => { const item = row.original.assignments.return; if (item) locker.mutate({ assignmentId: item.id, locked: !item.locked }) }} /> },
    { id: "flags", header: "Cảnh báo", cell: ({ row }) => { const flags = [...new Set([...row.original.assignments.outbound?.flags ?? [], ...row.original.assignments.return?.flags ?? []])]; return <div className="flex flex-wrap gap-1">{flags.length ? flags.map((flag) => <Badge key={flag} variant={flag.includes("locked") || flag === "over_capacity" ? "destructive" : "secondary"}>{flagLabels[flag]}</Badge>) : <span className="text-muted-foreground">—</span>}</div> }, meta: { priority: "tertiary" } },
  ], [locker])

  return (
    <EntityContainer
      width="full"
      header={<PageHeader back={{ href: `/admin/events/${eventId}/flights`, label: "Quản lý chuyến bay" }} title="Bàn phân bổ chuyến bay" description="Tạo phương án nháp, kiểm tra cảnh báo rồi mới áp dụng vào danh sách chính thức." actions={<Button variant="outline" asChild><Link href={`/admin/events/${eventId}/flights`}><ArrowLeftIcon data-icon="inline-start" />Danh sách chuyến</Link></Button>} />}
      stats={<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Lượt đã xếp" value={latest?.stats.assigned ?? 0} />
        <Metric label="Chưa xếp" value={latest?.stats.unassigned ?? 0} warn={Boolean(latest?.stats.unassigned)} />
        <Metric label="Chỗ còn lại" value={latest?.stats.remainingSlots ?? flightsPage.items.reduce((sum, item) => sum + item.capacity, 0)} />
        <Metric label="Team bị tách" value={latest?.stats.teamsSplit ?? 0} warn={Boolean(latest?.stats.teamsSplit)} />
        <Metric label="Lệch ca" value={latest?.stats.shiftUnmet ?? 0} warn={Boolean(latest?.stats.shiftUnmet)} />
      </div>}
      actions={<div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 font-medium">{pendingRun ? "Đang xem phương án preview" : "Sẵn sàng tạo phương án mới"}{pendingRun && <Badge variant="secondary">Chưa áp dụng</Badge>}</div><div className="text-sm text-muted-foreground">Preview không thay đổi phân bổ hiện tại; các dòng đã khóa luôn được giữ nguyên.</div></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={!canPreview || preview.isPending} onClick={() => preview.mutate()}><RefreshCwIcon data-icon="inline-start" />Chạy preview</Button>
          {pendingRun && <><Button variant="outline" onClick={() => setConfirmAction("discard")}><XIcon data-icon="inline-start" />Bỏ phương án</Button><Button onClick={() => setConfirmAction("commit")}><CheckCircle2Icon data-icon="inline-start" />Áp dụng</Button></>}
        </div>
      </div>}
      pagination={<EntityPagination
        total={registrations.total}
        page={pagination.page}
        pageSize={pagination.pageSize}
        onPageChange={(page) => {
          const next = new URLSearchParams(searchParams.toString())
          if (page === 1) next.delete("page")
          else next.set("page", String(page))
          router.replace(`${pathname}${next.size ? `?${next}` : ""}`)
        }}
        onPageSizeChange={(pageSize) => {
          const next = new URLSearchParams(searchParams.toString())
          next.set("pageSize", String(pageSize))
          next.delete("page")
          router.replace(`${pathname}?${next}`)
        }}
      />}
    >
      {!canPreview && <Alert className="m-4"><AlertTriangleIcon /><AlertTitle>Chưa thể phân bổ</AlertTitle><AlertDescription>Cần có ít nhất một chuyến bay và một CBNV đăng ký tham gia.</AlertDescription></Alert>}
      <EntityDataTable columns={columns} data={displayedRegistrations} emptyView={<EntityEmptyView title="Chưa có người tham gia" message="Danh sách chỉ gồm CBNV đã chọn tham gia trong kỳ này." />} />
      <ManualAssignmentDialog eventId={eventId} selection={manual} registrations={registrations.items} flights={flightsPage.items} onOpenChange={(open) => !open && setManual(null)} />
      <Dialog open={Boolean(confirmAction)} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent><DialogHeader><DialogTitle>{confirmAction === "commit" ? "Áp dụng phương án này?" : "Bỏ phương án preview?"}</DialogTitle><DialogDescription>{confirmAction === "commit" ? "Hệ thống sẽ kiểm tra lại sức chứa và dữ liệu đăng ký, sau đó thay các phân bổ chưa khóa." : "Phương án nháp sẽ được đánh dấu đã bỏ; phân bổ hiện tại không thay đổi."}</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setConfirmAction(null)}>Hủy</Button><Button variant={confirmAction === "discard" ? "destructive" : "default"} disabled={commit.isPending || discard.isPending} onClick={() => { if (!pendingRun) return; const mutation = confirmAction === "commit" ? commit : discard; mutation.mutate(pendingRun.id, { onSuccess: () => setConfirmAction(null) }) }}>{confirmAction === "commit" ? "Áp dụng phương án" : "Bỏ phương án"}</Button></DialogFooter></DialogContent>
      </Dialog>
    </EntityContainer>
  )
}

type Assignment = RegistrationFlight["assignments"]["outbound"]

function AssignmentCell({ assignment, onEdit, onLock }: { assignment: Assignment; onEdit: () => void; onLock: () => void }) {
  return <div className="flex min-w-40 items-center justify-between gap-2"><div>{assignment ? <><div className="font-medium">{assignment.flight.code}</div><div className="text-xs text-muted-foreground">{assignment.source === "manual" ? "Thủ công" : "Tự động"}{assignment.locked ? " · Đã khóa" : ""}</div></> : <span className="text-sm text-muted-foreground">Chưa xếp</span>}</div><div className="flex"><Button size="icon-sm" variant="ghost" aria-label="Điều chỉnh chuyến" onClick={onEdit}><UserRoundCogIcon /></Button>{assignment && <Button size="icon-sm" variant="ghost" aria-label={assignment.locked ? "Mở khóa" : "Khóa"} onClick={onLock}>{assignment.locked ? <UnlockIcon /> : <LockIcon />}</Button>}</div></div>
}

function ManualAssignmentDialog({ eventId, selection, registrations, flights, onOpenChange }: { eventId: string; selection: { row: RegistrationFlight; direction: FlightDirection } | null; registrations: RegistrationFlight[]; flights: { id: string; code: string; direction: FlightDirection; capacity: number; assignedCount: number }[]; onOpenChange: (open: boolean) => void }) {
  const [flightId, setFlightId] = useState("")
  const [wholeTeam, setWholeTeam] = useState(false)
  const [reason, setReason] = useState("")
  const mutation = useManualAssignFlight(eventId, () => { setFlightId(""); setWholeTeam(false); setReason(""); onOpenChange(false) })
  const candidates = flights.filter((flight) => flight.direction === selection?.direction)
  const ids = selection ? (wholeTeam ? registrations.filter((row) => row.team.id === selection.row.team.id).map((row) => row.registrationId) : [selection.row.registrationId]) : []
  const target = candidates.find((flight) => flight.id === flightId)
  const alreadyOnTarget = selection && target
    ? registrations.filter((row) => ids.includes(row.registrationId) && row.assignments[selection.direction]?.flight.id === target.id).length
    : 0
  const finalOccupancy = target ? target.assignedCount - alreadyOnTarget + ids.length : 0
  const overCapacity = Boolean(!wholeTeam && target && finalOccupancy > target.capacity)

  return <Dialog open={Boolean(selection)} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>Điều chỉnh chuyến {selection?.direction === "outbound" ? "đi" : "về"}</DialogTitle><DialogDescription>{selection?.row.user.name} · {selection?.row.team.name}. Điều chỉnh thủ công sẽ tự khóa để lần chạy sau không ghi đè.</DialogDescription></DialogHeader><FieldGroup>
    <Field><FieldLabel>Chuyến đích</FieldLabel><Select value={flightId} onValueChange={setFlightId}><SelectTrigger><SelectValue placeholder="Chọn chuyến bay" /></SelectTrigger><SelectContent><SelectGroup>{candidates.map((flight) => <SelectItem key={flight.id} value={flight.id}>{flight.code} · {flight.assignedCount}/{flight.capacity} chỗ</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
    <Field orientation="horizontal"><div className="flex-1"><FieldLabel htmlFor="whole-team">Chuyển cả team</FieldLabel><FieldDescription>{wholeTeam ? "Toàn bộ thành viên Team sẽ được chuyển, kể cả người ở trang khác." : "Chỉ điều chỉnh CBNV đang chọn."}</FieldDescription></div><Switch id="whole-team" checked={wholeTeam} onCheckedChange={setWholeTeam} /></Field>
    {overCapacity && <Alert variant="destructive"><AlertTriangleIcon /><AlertTitle>Vượt sức chứa {finalOccupancy - target!.capacity} chỗ</AlertTitle><AlertDescription>Bạn vẫn có thể xác nhận theo §5.5. Hệ thống sẽ lưu cảnh báo và lý do vào nhật ký.</AlertDescription></Alert>}
    <Field><FieldLabel htmlFor="manual-reason">Lý do điều chỉnh</FieldLabel><Textarea id="manual-reason" required maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ví dụ: yêu cầu nghiệp vụ từ BTC" /></Field>
  </FieldGroup><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button><Button disabled={!flightId || !reason.trim() || mutation.isPending} onClick={() => mutation.mutate({ registrationIds: wholeTeam ? undefined : ids, teamId: wholeTeam ? selection?.row.team.id : undefined, flightId, reason: reason.trim() })}>Xác nhận điều chỉnh</Button></DialogFooter></DialogContent></Dialog>
}

function Metric({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return <Card><CardHeader className="pb-2"><CardDescription>{label}</CardDescription><CardTitle className={warn ? "text-destructive" : undefined}>{value}</CardTitle></CardHeader><CardContent className="pt-0 text-xs text-muted-foreground">{warn ? "Cần kiểm tra" : "Trong phương án gần nhất"}</CardContent></Card>
}
