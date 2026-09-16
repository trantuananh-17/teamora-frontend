"use client"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { BusIcon, DownloadIcon, PencilIcon, Trash2Icon } from "lucide-react"
import {
  EntityContainer,
  EntityDataTable,
  EntityEmptyView,
  EntityHeader,
} from "@/components/entity-components"
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
import { usePickupPointsSuspense } from "@/features/pickup-points/hooks/pickup-points.hook"
import {
  useCreateVehicle,
  useDeleteVehicle,
  useUpdateVehicle,
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
  const { data: pickupPoints } = usePickupPointsSuspense(eventId)
  const [editing, setEditing] = useState<Vehicle | null | undefined>()
  const remove = useDeleteVehicle(eventId)
  const capacity = data.items.reduce((s, x) => s + x.capacity, 0)
  const assigned = data.items.reduce((s, x) => s + x.assignedCount, 0)
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
      meta: { priority: "secondary" },
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
      meta: { priority: "tertiary" },
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
          description="Khai báo xe cho bốn chặng: sức chứa, giờ tập trung, điểm đón và trưởng xe."
          newButtonLabel="Thêm xe"
          onNew={() => setEditing(null)}
          actions={
            <Button asChild variant="outline" size="sm">
              <a href={vehiclesExportUrl(eventId)}>
                <DownloadIcon />
                Xuất tổng hợp
              </a>
            </Button>
          }
        />
      }
      stats={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Tổng xe" value={data.total} />
          <StatCard
            label="Chặng có xe"
            value={`${new Set(data.items.map((x) => x.leg)).size} / ${transportLegs.length}`}
          />
          <StatCard label="Tổng chỗ" value={capacity} />
          <StatCard
            label="Đã xếp"
            value={assigned}
            hint={capacity ? `${Math.round((assigned / capacity) * 100)}% sức chứa` : undefined}
          />
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
