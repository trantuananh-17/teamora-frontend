"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  LockIcon,
  PencilIcon,
  SparklesIcon,
  UnlockIcon,
  XCircleIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import {
  EntityContainer,
  EntityDataTable,
  EntityHeader,
  EntityPagination,
} from "@/components/entity-components"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCommitVehicles,
  useDiscardVehicles,
  useManualAssignVehicle,
  usePreviewVehicles,
  useSetVehicleLock,
  useVehicleAssignments,
  useVehicleRuns,
  useVehicles,
} from "../hooks/logistics.hook"
import { transportLegs, type VehicleAssignmentView } from "../service/logistics.service"

const labels = {
  origin_to_airport: "Nơi ở → sân bay",
  airport_to_hotel: "Sân bay → khách sạn",
  hotel_to_airport: "Khách sạn → sân bay",
  airport_to_origin: "Sân bay → nơi ở",
}
type DisplayAssignment = VehicleAssignmentView & { preview: boolean }

export function VehicleAllocationWorkbench({
  eventId,
  page,
  pageSize,
}: {
  eventId: string
  page: number
  pageSize: number
}) {
  const { data: assignments } = useVehicleAssignments(eventId, page, pageSize)
  const { data: vehicles } = useVehicles(eventId)
  const { data: runs } = useVehicleRuns(eventId)
  const [editing, setEditing] = useState<VehicleAssignmentView | null>(null)
  const lock = useSetVehicleLock(eventId)
  const preview = usePreviewVehicles(eventId)
  const commit = useCommitVehicles(eventId)
  const discard = useDiscardVehicles(eventId)
  const pending = runs.find((run) => run.status === "preview")
  const vehicleById = new Map(vehicles.items.map((vehicle) => [vehicle.id, vehicle]))
  const displayRows: DisplayAssignment[] = assignments.items.map((row) => {
    if (!pending || row.assignment?.locked) return { ...row, preview: false }
    const planned = pending.plan.assignments.find(
      (item) => item.registrationId === row.registrationId && item.leg === row.leg,
    )
    const target = planned ? vehicleById.get(planned.vehicleId) : undefined
    return {
      ...row,
      preview: true,
      assignment:
        planned && target
          ? {
              id: `preview-${row.registrationId}-${row.leg}`,
              vehicleId: target.id,
              source: "auto",
              locked: false,
              flags: planned.flags,
              vehicle: target,
            }
          : null,
    }
  })
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const setPage = (nextPage: number, nextSize = pageSize) => {
    const params = new URLSearchParams(search.toString())
    params.set("page", String(nextPage))
    params.set("pageSize", String(nextSize))
    router.replace(`${pathname}?${params}`)
  }
  const columns: ColumnDef<DisplayAssignment>[] = [
    {
      accessorKey: "user.name",
      header: "CBNV",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.user.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.team.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "leg",
      header: "Chặng",
      cell: ({ row }) => <Badge variant="outline">{labels[row.original.leg]}</Badge>,
    },
    {
      id: "vehicle",
      header: "Xe",
      cell: ({ row }) =>
        row.original.assignment ? (
          <div>
            <div className="font-medium">{row.original.assignment.vehicle.code}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.assignment.vehicle.name}
            </div>
          </div>
        ) : (
          <span className="text-destructive">Chưa xếp</span>
        ),
    },
    {
      id: "source",
      header: "Nguồn",
      cell: ({ row }) =>
        row.original.preview ? (
          <Badge>Preview</Badge>
        ) : row.original.assignment?.source === "manual" ? (
          "Thủ công"
        ) : row.original.assignment ? (
          "Tự động"
        ) : (
          "—"
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Điều chỉnh xe"
                disabled={row.original.preview}
                onClick={() => setEditing(row.original)}
              >
                <PencilIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Điều chỉnh xe</TooltipContent>
          </Tooltip>
          {row.original.assignment && !row.original.preview && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={row.original.assignment.locked ? "Mở khóa" : "Khóa"}
                  onClick={() =>
                    lock.mutate({
                      assignmentId: row.original.assignment!.id,
                      locked: !row.original.assignment!.locked,
                    })
                  }
                >
                  {row.original.assignment.locked ? <LockIcon /> : <UnlockIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {row.original.assignment.locked
                  ? "Mở khóa để lần chạy sau được xếp lại"
                  : "Khóa, giữ nguyên qua mọi lần chạy lại"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ]
  const actions = (
    <div className="flex gap-2">
      <Button asChild variant="outline">
        <Link href={`/admin/events/${eventId}/vehicles`}>
          <ArrowLeftIcon />
          Danh sách xe
        </Link>
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
        <Button disabled={preview.isPending} onClick={() => preview.mutate()}>
          <SparklesIcon />
          Chạy preview
        </Button>
      )}
    </div>
  )
  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Bàn phân xe"
          description="Preview được chiếu trực tiếp lên bảng; chỉ commit sau khi đã kiểm tra đủ bốn chặng."
          actions={actions}
        />
      }
      stats={
        pending && (
          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label="Đang preview" value={pending.stats.assigned} />
            <Metric label="Chưa xếp" value={pending.stats.unassigned} />
            <Metric label="Chỗ còn" value={pending.stats.remainingSlots} />
            <Metric label="Team bị tách" value={pending.stats.teamsSplit} />
          </div>
        )
      }
      pagination={
        <EntityPagination
          total={assignments.total}
          page={page}
          pageSize={pageSize}
          onPageChange={(x) => setPage(x)}
          onPageSizeChange={(x) => setPage(1, x)}
        />
      }
    >
      <EntityDataTable columns={columns} data={displayRows} />
      <ManualDialog
        key={editing?.registrationId ?? "closed"}
        eventId={eventId}
        row={editing}
        vehicles={vehicles.items}
        close={() => setEditing(null)}
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

function ManualDialog({
  eventId,
  row,
  vehicles,
  close,
}: {
  eventId: string
  row: VehicleAssignmentView | null
  vehicles: {
    id: string
    code: string
    name: string
    leg: (typeof transportLegs)[number]
    capacity: number
    assignedCount: number
  }[]
  close: () => void
}) {
  const [vehicleId, setVehicleId] = useState("")
  const assign = useManualAssignVehicle(eventId)
  const candidates = vehicles.filter((vehicle) => vehicle.leg === row?.leg)
  return (
    <Dialog open={Boolean(row)} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Đổi xe cho {row?.user.name}</DialogTitle>
          <DialogDescription>
            Điều chỉnh thủ công sẽ tự khóa vị trí khi chạy preview lại.
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel>Xe mới</FieldLabel>
          <Select value={vehicleId} onValueChange={setVehicleId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn xe" />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.code} · {vehicle.name} ({vehicle.assignedCount}/{vehicle.capacity})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Hủy
          </Button>
          <Button
            disabled={!vehicleId || assign.isPending}
            onClick={() =>
              row &&
              assign.mutate({ registrationId: row.registrationId, vehicleId }, { onSuccess: close })
            }
          >
            Lưu điều chỉnh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
