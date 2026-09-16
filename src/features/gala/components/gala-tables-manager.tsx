"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { LayoutGridIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
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
import { useDeleteGalaTable, useGalaTables, useUpdateGalaSeat } from "../hooks/gala.hook"
import type { GalaTable } from "../service/gala.service"
import { GalaTableDialog } from "./gala-table-dialog"
import { SeatMap, type SeatMapSeat } from "./seat-map"

export function GalaTablesManager({ eventId }: { eventId: string }) {
  const { data: tables } = useGalaTables(eventId)
  const [editing, setEditing] = useState<GalaTable | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<GalaTable | null>(null)
  const remove = useDeleteGalaTable(eventId, () => setDeleting(null))
  const updateSeat = useUpdateGalaSeat(eventId)

  const seats = tables.flatMap((table) => table.seats)
  const available = seats.filter((seat) => seat.status === "available").length
  const activeTables = tables.filter((table) => table.active)
  const mapSeats: SeatMapSeat[] = activeTables.flatMap((table) =>
    table.seats.map((seat) => ({ ...seat, title: `${table.name} · ghế ${seat.seatNo}` })),
  )

  function openForm(table: GalaTable | null) {
    setEditing(table)
    setFormOpen(true)
  }

  const columns: ColumnDef<GalaTable>[] = [
    {
      accessorKey: "name",
      header: "Bàn",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "seats",
      header: "Ghế khả dụng / Số ghế",
      cell: ({ row }) => {
        const usable = row.original.seats.filter((seat) => seat.status === "available").length
        return (
          <span className={usable < row.original.capacity ? "text-warning" : undefined}>
            {usable} / {row.original.capacity}
          </span>
        )
      },
    },
    {
      id: "grid",
      header: "Cột · Hàng",
      meta: { priority: "secondary" },
      cell: ({ row }) => `${row.original.gridCol} · ${row.original.gridRow}`,
    },
    {
      accessorKey: "active",
      header: "Trạng thái",
      meta: { priority: "secondary" },
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Sửa bàn ${row.original.name}`}
            onClick={() => openForm(row.original)}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Xóa bàn ${row.original.name}`}
            onClick={() => setDeleting(row.original)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sơ đồ bàn Gala Dinner"
        description="Khai báo bàn, số ghế và vị trí trên lưới. Bấm một ghế trên sơ đồ để khóa/mở ghế đó."
        actions={
          <Button size="sm" onClick={() => openForm(null)}>
            Thêm bàn
          </Button>
        }
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Số bàn" value={tables.length} />
        <StatCard label="Số ghế" value={seats.length} />
        <StatCard label="Ghế khả dụng" value={available} />
      </div>
      <div className="overflow-auto rounded-md border bg-background">
        <EntityDataTable
          columns={columns}
          data={tables}
          emptyView={
            <EntityEmptyView
              icon={<LayoutGridIcon />}
              title="Chưa có bàn nào"
              message="Thêm bàn với số ghế và vị trí cột/hàng để dựng sơ đồ."
              onNew={() => openForm(null)}
              newLabel="Thêm bàn đầu tiên"
            />
          }
        />
      </div>
      {activeTables.length > 0 && (
        <SeatMap
          tables={activeTables}
          seats={mapSeats}
          selectable={() => !updateSeat.isPending}
          onToggleSeat={(seat) =>
            updateSeat.mutate({
              seatId: seat.id,
              status: seat.status === "unavailable" ? "available" : "unavailable",
            })
          }
        />
      )}
      <GalaTableDialog
        eventId={eventId}
        table={editing}
        open={formOpen}
        onOpenChange={setFormOpen}
      />
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa bàn {deleting?.name}?</DialogTitle>
            <DialogDescription>
              Xóa bàn sẽ xóa toàn bộ {deleting?.capacity} ghế của nó. Chỉ xóa được bàn chưa có Team
              nào ngồi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              Xóa bàn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
