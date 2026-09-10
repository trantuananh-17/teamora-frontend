"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { EventStatusBadge } from "@/components/status-badge"
import { useEventsSuspense } from "../hooks/events.hook"
import type { Event } from "../service/events.service"

/**
 * `priority` is what makes this readable on a phone (§13): the narrow layout
 * drops the window and the created date rather than scrolling sideways. Name and
 * status never drop — they are what identifies the row.
 */
const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "name",
    header: "Kỳ Team Building",
    cell: ({ row }) => (
      <Link
        href={`/admin/events/${row.original.id}`}
        className="font-medium hover:underline"
        prefetch
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "code",
    header: "Mã",
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.code}</span>,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <EventStatusBadge status={row.original.status} />,
  },
  {
    id: "window",
    header: "Cửa sổ đăng ký",
    meta: { priority: "secondary" },
    cell: ({ row }) => {
      const { registrationOpenAt: open, registrationCloseAt: close } = row.original
      if (!open && !close) return <span className="text-muted-foreground">—</span>
      return (
        <span className="text-sm text-muted-foreground">
          {open ? open.toLocaleDateString("vi-VN") : "—"} →{" "}
          {close ? close.toLocaleDateString("vi-VN") : "—"}
        </span>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Tạo lúc",
    meta: { priority: "tertiary" },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.createdAt.toLocaleDateString("vi-VN")}
      </span>
    ),
  },
]

export function EventsTable() {
  const { data } = useEventsSuspense()

  return (
    <EntityDataTable
      columns={columns}
      data={data.items}
      emptyView={
        <EntityEmptyView
          title="Chưa có kỳ Team Building nào"
          message="Bấm “Tạo kỳ” ở trên để bắt đầu cấu hình Team, địa điểm và danh sách CBNV."
        />
      }
    />
  )
}
