"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { ActiveBadge } from "@/components/status-badge"
import { Switch } from "@/components/ui/switch"
import { useSetWorkLocationActive, useWorkLocationsSuspense } from "../hooks/work-locations.hook"
import type { WorkLocation } from "../service/work-locations.service"

function ActiveSwitch({ location }: { location: WorkLocation }) {
  const setActive = useSetWorkLocationActive()
  return (
    <Switch
      checked={location.active}
      disabled={setActive.isPending}
      aria-label={`Bật/tắt ${location.name}`}
      onCheckedChange={(active) => setActive.mutate({ id: location.id, active })}
    />
  )
}

const columns: ColumnDef<WorkLocation>[] = [
  {
    accessorKey: "name",
    header: "Địa điểm",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    accessorKey: "active",
    header: "Trạng thái",
    cell: ({ row }) => <ActiveBadge active={row.original.active} />,
  },
  {
    id: "toggle",
    header: "Dùng trên form",
    cell: ({ row }) => <ActiveSwitch location={row.original} />,
  },
]

export function WorkLocationsTable() {
  const { data } = useWorkLocationsSuspense()

  return (
    <EntityDataTable
      columns={columns}
      data={data}
      emptyView={
        <EntityEmptyView
          title="Chưa có địa điểm làm việc nào"
          message="Thêm Hà Nội, TP.HCM hoặc các văn phòng khác. Import CBNV cần danh sách này trước."
        />
      }
    />
  )
}
