"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { ActiveBadge } from "@/components/status-badge"
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useWorkLocationsSuspense } from "@/features/work-locations/hooks/work-locations.hook"
import {
  useCreatePickupPoint,
  usePickupPointsSuspense,
  useSetPickupPointActive,
} from "../hooks/pickup-points.hook"
import type { PickupPoint } from "../service/pickup-points.service"

/** The sentinel the Select uses for "everyone", since a null value cannot be one. */
const ALL_OFFICES = "__all__"

function ActiveSwitch({ eventId, point }: { eventId: string; point: PickupPoint }) {
  const setActive = useSetPickupPointActive(eventId)
  return (
    <Switch
      checked={point.active}
      disabled={setActive.isPending}
      aria-label={`Bật/tắt ${point.name}`}
      onCheckedChange={(active) => setActive.mutate({ pickupPointId: point.id, active })}
    />
  )
}

function buildColumns(
  eventId: string,
  locationName: (id: string | null) => string,
): ColumnDef<PickupPoint>[] {
  return [
    {
      accessorKey: "name",
      header: "Điểm đón",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "location",
      header: "Dành cho",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {locationName(row.original.workLocationId)}
        </span>
      ),
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      meta: { priority: "secondary" },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.address ?? "—"}</span>
      ),
    },
    {
      accessorKey: "active",
      header: "Trạng thái",
      meta: { priority: "tertiary" },
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      id: "toggle",
      header: "Dùng trên form",
      cell: ({ row }) => <ActiveSwitch eventId={eventId} point={row.original} />,
    },
  ]
}

export function PickupPointsPanel({ eventId }: { eventId: string }) {
  const { data } = usePickupPointsSuspense(eventId)
  const { data: locations } = useWorkLocationsSuspense()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [workLocationId, setWorkLocationId] = useState(ALL_OFFICES)

  const create = useCreatePickupPoint(eventId, () => {
    setName("")
    setAddress("")
    setWorkLocationId(ALL_OFFICES)
    setOpen(false)
  })

  const locationName = (id: string | null) =>
    id ? (locations.find((l) => l.id === id)?.name ?? "—") : "Mọi địa điểm"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Điểm tập trung cho bốn chặng xe (§4.5). Gắn với một địa điểm làm việc để CBNV ở nơi khác
          không thấy nó trên form.
        </p>
        <Button size="sm" onClick={() => setOpen(true)}>
          Thêm điểm đón
        </Button>
      </div>

      <div className="overflow-auto rounded-md border">
        <EntityDataTable
          columns={buildColumns(eventId, locationName)}
          data={data}
          emptyView={
            <EntityEmptyView
              title="Chưa có điểm đón nào"
              message="Điểm đón thuộc riêng kỳ này — khách sạn và lịch trình đổi thì điểm đón cũng đổi."
            />
          }
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm điểm đón</DialogTitle>
            <DialogDescription>Chỉ áp dụng cho kỳ Team Building này.</DialogDescription>
          </DialogHeader>

          <form
            id="create-pickup-point"
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              create.mutate({
                name,
                address: address || null,
                workLocationId: workLocationId === ALL_OFFICES ? null : workLocationId,
              })
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="pickup-name">Tên điểm đón</Label>
              <Input
                id="pickup-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tòa nhà Keangnam"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pickup-address">Địa chỉ</Label>
              <Input
                id="pickup-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Phạm Hùng, Nam Từ Liêm, Hà Nội"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pickup-location">Dành cho địa điểm làm việc</Label>
              <Select value={workLocationId} onValueChange={setWorkLocationId}>
                <SelectTrigger id="pickup-location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OFFICES}>Mọi địa điểm</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="create-pickup-point" disabled={create.isPending}>
              {create.isPending ? "Đang thêm…" : "Thêm điểm đón"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
