"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useRef, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import {
  DownloadIcon,
  PencilIcon,
  PlaneIcon,
  SparklesIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"

import {
  EntityContainer,
  EntityDataTable,
  EntityEmptyView,
  EntityHeader,
  EntityPagination,
  EntitySearch,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDeleteFlight, useFlights, useImportFlights } from "../hooks/flights.hook"
import {
  flightExportUrl,
  type Flight,
  type FlightFilters,
  type PageParams,
} from "../service/flights.service"
import { FlightDialog } from "./flight-dialog"

function formatTime(value: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(value)
}

export function FlightsManager({
  eventId,
  filters,
  pagination,
}: {
  eventId: string
  filters: FlightFilters
  pagination: PageParams
}) {
  const { data } = useFlights(eventId, filters, pagination)
  const { data: allFlights } = useFlights(eventId, {}, { page: 1, pageSize: 100 })
  const [editing, setEditing] = useState<Flight | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<Flight | null>(null)
  const remove = useDeleteFlight(eventId)
  const importer = useImportFlights(eventId)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()

  function setParam(name: string, value: string, resetPage = true) {
    const next = new URLSearchParams(current.toString())
    if (value && value !== "all") next.set(name, value)
    else next.delete(name)
    if (resetPage) next.delete("page")
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`)
  }

  const columns: ColumnDef<Flight>[] = [
    {
      accessorKey: "code",
      header: "Chuyến",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.code}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.fromAirport} → {row.original.toAirport}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "direction",
      header: "Chiều",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.direction === "outbound" ? "Đi" : "Về"}</Badge>
      ),
    },
    {
      accessorKey: "departAt",
      header: "Khởi hành",
      cell: ({ row }) => formatTime(row.original.departAt),
      meta: { priority: "secondary" },
    },
    {
      accessorKey: "shift",
      header: "Ca",
      cell: ({ row }) =>
        row.original.shift ? (row.original.shift === "shift_1" ? "Ca 1" : "Ca 2") : "—",
      meta: { priority: "tertiary" },
    },
    {
      id: "capacity",
      header: "Đã xếp / Chỗ",
      cell: ({ row }) => (
        <span
          className={row.original.assignedCount > row.original.capacity ? "text-destructive" : ""}
        >
          {row.original.assignedCount} / {row.original.capacity}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Sửa ${row.original.code}`}
            onClick={() => {
              setEditing(row.original)
              setFormOpen(true)
            }}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Xóa ${row.original.code}`}
            disabled={row.original.assignedCount > 0}
            onClick={() => setDeleting(row.original)}
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
          title="Chuyến bay"
          description="Khai báo sức chứa và ca bay trước khi chạy phân bổ tự động."
          newButtonLabel="Thêm chuyến"
          onNew={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          actions={
            <Button asChild variant="outline">
              <Link href={`/admin/events/${eventId}/flights/allocation`}>
                <SparklesIcon data-icon="inline-start" />
                Bàn phân bổ
              </Link>
            </Button>
          }
        />
      }
      stats={
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Tổng chuyến" value={allFlights.total} />
          <Metric
            label="Tổng sức chứa"
            value={allFlights.items.reduce((sum, item) => sum + item.capacity, 0)}
          />
          <Metric
            label="Đã phân chỗ"
            value={allFlights.items.reduce((sum, item) => sum + item.assignedCount, 0)}
          />
        </div>
      }
      search={
        <div className="flex flex-col gap-3 lg:flex-row">
          <EntitySearch
            className="lg:flex-1"
            value={filters.search ?? ""}
            onChange={(value) => setParam("search", value)}
            placeholder="Tìm mã chuyến, sân bay…"
          />
          <Select
            value={filters.direction ?? "all"}
            onValueChange={(value) => setParam("direction", value)}
          >
            <SelectTrigger className="lg:w-44">
              <SelectValue placeholder="Tất cả chiều" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả chiều</SelectItem>
                <SelectItem value="outbound">Chiều đi</SelectItem>
                <SelectItem value="return">Chiều về</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            value={filters.shift ?? "all"}
            onValueChange={(value) => setParam("shift", value)}
          >
            <SelectTrigger className="lg:w-40">
              <SelectValue placeholder="Tất cả ca" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả ca</SelectItem>
                <SelectItem value="shift_1">Ca 1</SelectItem>
                <SelectItem value="shift_2">Ca 2</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <input
            ref={fileRef}
            className="hidden"
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) importer.mutate(file)
              event.target.value = ""
            }}
          />
          <Button
            variant="outline"
            disabled={importer.isPending}
            onClick={() => fileRef.current?.click()}
          >
            <UploadIcon data-icon="inline-start" />
            Import Excel
          </Button>
          <Button asChild variant="outline">
            <a href={flightExportUrl(eventId)}>
              <DownloadIcon data-icon="inline-start" />
              Xuất Excel
            </a>
          </Button>
        </div>
      }
      pagination={
        <EntityPagination
          total={data.total}
          page={pagination.page}
          pageSize={pagination.pageSize}
          onPageChange={(page) => setParam("page", String(page), false)}
          onPageSizeChange={(pageSize) => {
            const next = new URLSearchParams(current.toString())
            next.set("pageSize", String(pageSize))
            next.delete("page")
            router.replace(`${pathname}?${next}`)
          }}
        />
      }
    >
      <EntityDataTable
        columns={columns}
        data={data.items}
        hasFilters={Boolean(filters.search || filters.direction || filters.shift)}
        emptyView={
          <EntityEmptyView
            icon={<PlaneIcon />}
            title="Chưa có chuyến bay"
            message="Thêm thủ công hoặc import Excel để bắt đầu phân bổ."
            onNew={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            newLabel="Thêm chuyến đầu tiên"
          />
        }
      />
      <FlightDialog eventId={eventId} flight={editing} open={formOpen} onOpenChange={setFormOpen} />
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa chuyến {deleting?.code}?</DialogTitle>
            <DialogDescription>
              Chỉ xóa được chuyến chưa có người được phân bổ. Thao tác này được ghi vào nhật ký.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
              }
            >
              Xóa chuyến
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
