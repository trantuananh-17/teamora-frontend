"use client"
import { useState } from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import {
  BusIcon,
  CheckCircle2Icon,
  DownloadIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
  XCircleIcon,
} from "lucide-react"
import {
  EntityContainer,
  EntityDataTable,
  EntityEmptyView,
  EntityHeader,
} from "@/components/entity-components"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getPickupPoints } from "@/features/pickup-points/service/pickup-points.service"
import {
  useCommitVehicles,
  useCreateVehicle,
  useDeleteVehicle,
  useDiscardVehicles,
  usePreviewVehicles,
  useUpdateVehicle,
  useVehicleRuns,
  useVehicles,
} from "../hooks/logistics.hook"
import {
  transportLegs,
  vehiclesExportUrl,
  type TransportLeg,
  type Vehicle,
  type VehicleInput,
} from "../service/logistics.service"

const labels: Record<TransportLeg, string> = {
  origin_to_airport: "Nơi ở → sân bay",
  airport_to_hotel: "Sân bay → khách sạn",
  hotel_to_airport: "Khách sạn → sân bay",
  airport_to_origin: "Sân bay → nơi ở",
}
const local = (date: Date) =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(date)
    .replace(" ", "T")
const empty = (): VehicleInput => ({
  code: "",
  name: "",
  capacity: 45,
  leg: "origin_to_airport",
  gatherAt: "",
  departAt: "",
  pickupPointId: null,
  destination: "",
  leaderName: null,
  leaderPhone: null,
  note: null,
})
const fromVehicle = (v: Vehicle): VehicleInput => ({
  ...v,
  gatherAt: local(v.gatherAt),
  departAt: local(v.departAt),
})

export function VehiclesManager({ eventId }: { eventId: string }) {
  const { data } = useVehicles(eventId)
  const { data: runs } = useVehicleRuns(eventId)
  const { data: pickupPoints = [] } = useQuery({
    queryKey: ["pickup-points", eventId],
    queryFn: () => getPickupPoints(eventId),
  })
  const [editing, setEditing] = useState<Vehicle | null | undefined>()
  const remove = useDeleteVehicle(eventId)
  const preview = usePreviewVehicles(eventId)
  const commit = useCommitVehicles(eventId)
  const discard = useDiscardVehicles(eventId)
  const pending = runs.find((run) => run.status === "preview")
  const latest = runs[0]
  const columns: ColumnDef<Vehicle>[] = [
    {
      accessorKey: "code",
      header: "Xe",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.code} · {row.original.name}
          </div>
          <div className="text-xs text-muted-foreground">{row.original.destination}</div>
        </div>
      ),
    },
    {
      accessorKey: "leg",
      header: "Chặng",
      cell: ({ row }) => <Badge variant="outline">{labels[row.original.leg]}</Badge>,
    },
    {
      accessorKey: "departAt",
      header: "Khởi hành",
      cell: ({ row }) => row.original.departAt.toLocaleString("vi-VN"),
    },
    {
      id: "capacity",
      header: "Đã xếp / Chỗ",
      cell: ({ row }) => `${row.original.assignedCount} / ${row.original.capacity}`,
    },
    {
      accessorKey: "leaderName",
      header: "Trưởng xe",
      cell: ({ row }) => row.original.leaderName || "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button size="icon-sm" variant="ghost" onClick={() => setEditing(row.original)}>
            <PencilIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            disabled={row.original.assignedCount > 0}
            onClick={() => remove.mutate(row.original.id)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
  ]
  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Xe đưa đón"
          description="Cấu hình xe cho bốn chặng và phân bổ dựa trên chuyến bay đã chốt."
          newButtonLabel="Thêm xe"
          onNew={() => setEditing(null)}
          actions={
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <a href={vehiclesExportUrl(eventId)}>
                  <DownloadIcon />
                  Xuất tổng hợp
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/admin/events/${eventId}/vehicles/allocation`}>Bàn phân xe</Link>
              </Button>
              {pending ? (
                <>
                  <Button
                    variant="outline"
                    disabled={discard.isPending}
                    onClick={() => discard.mutate(pending.id)}
                  >
                    <XCircleIcon />
                    Bỏ preview
                  </Button>
                  <Button disabled={commit.isPending} onClick={() => commit.mutate(pending.id)}>
                    <CheckCircle2Icon />
                    Commit
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  disabled={!data.items.length || preview.isPending}
                  onClick={() => preview.mutate()}
                >
                  <SparklesIcon />
                  Chạy preview
                </Button>
              )}
            </div>
          }
        />
      }
      stats={
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Tổng xe" value={data.total} />
          <Metric label="Tổng chỗ" value={data.items.reduce((s, x) => s + x.capacity, 0)} />
          <Metric
            label="Đã xếp gần nhất"
            value={latest?.stats.assigned ?? data.items.reduce((s, x) => s + x.assignedCount, 0)}
          />
          <Metric label="Chưa xếp" value={latest?.stats.unassigned ?? 0} />
        </div>
      }
    >
      <EntityDataTable
        columns={columns}
        data={data.items}
        emptyView={
          <EntityEmptyView
            icon={<BusIcon />}
            title="Chưa có xe"
            message="Thêm xe cho từng chặng trước khi chạy preview."
            onNew={() => setEditing(null)}
            newLabel="Thêm xe đầu tiên"
          />
        }
      />
      <VehicleDialog
        eventId={eventId}
        value={editing}
        pickupPoints={pickupPoints}
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
      />
    </EntityContainer>
  )
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}
function VehicleDialog({
  eventId,
  value,
  pickupPoints,
  open,
  onOpenChange,
}: {
  eventId: string
  value: Vehicle | null | undefined
  pickupPoints: { id: string; name: string }[]
  open: boolean
  onOpenChange: (x: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <VehicleForm
          key={value?.id ?? "new"}
          eventId={eventId}
          value={value ?? null}
          pickupPoints={pickupPoints}
          close={() => onOpenChange(false)}
        />
      )}
    </Dialog>
  )
}
function VehicleForm({
  eventId,
  value,
  pickupPoints,
  close,
}: {
  eventId: string
  value: Vehicle | null
  pickupPoints: { id: string; name: string }[]
  close: () => void
}) {
  const [form, setForm] = useState<VehicleInput>(() => (value ? fromVehicle(value) : empty()))
  const create = useCreateVehicle(eventId)
  const update = useUpdateVehicle(eventId, value?.id ?? "")
  const set = <K extends keyof VehicleInput>(key: K, next: VehicleInput[K]) =>
    setForm((old) => ({ ...old, [key]: next }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const input = {
      ...form,
      gatherAt: new Date(`${form.gatherAt}:00+07:00`).toISOString(),
      departAt: new Date(`${form.departAt}:00+07:00`).toISOString(),
    }
    ;(value ? update : create).mutate(input, { onSuccess: close })
  }
  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>{value ? "Sửa xe" : "Thêm xe"}</DialogTitle>
        <DialogDescription>
          Mỗi xe thuộc đúng một chặng. Có thể khai báo cùng mã xe ở chặng khác.
        </DialogDescription>
      </DialogHeader>
      <form id="vehicle-form" onSubmit={submit}>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel>Mã xe</FieldLabel>
            <Input required value={form.code} onChange={(e) => set("code", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Tên xe</FieldLabel>
            <Input required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field>
            <FieldLabel>Chặng</FieldLabel>
            <Select value={form.leg} onValueChange={(x) => set("leg", x as TransportLeg)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {transportLegs.map((x) => (
                  <SelectItem key={x} value={x}>
                    {labels[x]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Sức chứa</FieldLabel>
            <Input
              type="number"
              min={0}
              required
              value={form.capacity}
              onChange={(e) => set("capacity", Number(e.target.value))}
            />
          </Field>
          <Field>
            <FieldLabel>Giờ tập trung</FieldLabel>
            <Input
              type="datetime-local"
              required
              value={form.gatherAt}
              onChange={(e) => set("gatherAt", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Giờ khởi hành</FieldLabel>
            <Input
              type="datetime-local"
              required
              value={form.departAt}
              onChange={(e) => set("departAt", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Điểm đón/trả</FieldLabel>
            <Select
              value={form.pickupPointId ?? "all"}
              onValueChange={(x) => set("pickupPointId", x === "all" ? null : x)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Dùng chung mọi điểm</SelectItem>
                {pickupPoints.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Điểm đến</FieldLabel>
            <Input
              required
              value={form.destination}
              onChange={(e) => set("destination", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Trưởng xe</FieldLabel>
            <Input
              value={form.leaderName ?? ""}
              onChange={(e) => set("leaderName", e.target.value || null)}
            />
          </Field>
          <Field>
            <FieldLabel>Số điện thoại</FieldLabel>
            <Input
              value={form.leaderPhone ?? ""}
              onChange={(e) => set("leaderPhone", e.target.value || null)}
            />
          </Field>
          <Field className="sm:col-span-2">
            <FieldLabel>Ghi chú</FieldLabel>
            <Textarea
              value={form.note ?? ""}
              onChange={(e) => set("note", e.target.value || null)}
            />
          </Field>
        </FieldGroup>
      </form>
      <DialogFooter>
        <Button variant="outline" onClick={close}>
          Hủy
        </Button>
        <Button form="vehicle-form" type="submit" disabled={create.isPending || update.isPending}>
          Lưu xe
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
