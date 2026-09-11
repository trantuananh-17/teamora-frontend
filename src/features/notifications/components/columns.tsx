"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { NotificationStatusBadge } from "@/components/status-badge"
import type { Notification } from "../service/notifications.service"
import { NotificationRetryButton } from "./notification-retry-button"

const TEMPLATE_LABELS: Record<string, string> = {
  registration_confirmed: "Xác nhận đăng ký",
  information_published: "Công bố hành trình",
  assignment_changed: "Thay đổi phân bổ",
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function notificationColumns(eventId: string): ColumnDef<Notification>[] {
  return [
    {
      id: "recipient",
      header: "Người nhận",
      cell: ({ row }) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-medium">{row.original.recipient?.name ?? "Không xác định"}</span>
          <span className="truncate text-xs text-muted-foreground">
            {row.original.recipient?.email ?? "Không có email"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "template",
      header: "Loại email",
      cell: ({ row }) => TEMPLATE_LABELS[row.original.template] ?? row.original.template,
      meta: { priority: "secondary" },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => <NotificationStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "attempts",
      header: "Số lần thử",
      meta: { priority: "tertiary" },
    },
    {
      accessorKey: "scheduledAt",
      header: "Thời điểm",
      cell: ({ row }) => formatDate(row.original.sentAt ?? row.original.scheduledAt),
      meta: { priority: "secondary" },
    },
    {
      accessorKey: "lastError",
      header: "Lỗi gần nhất",
      cell: ({ row }) => (
        <span className="line-clamp-2 max-w-64 text-xs text-muted-foreground">
          {row.original.lastError ?? "—"}
        </span>
      ),
      meta: { priority: "tertiary" },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        row.original.status === "failed" ? (
          <NotificationRetryButton eventId={eventId} id={row.original.id} />
        ) : null,
    },
  ]
}
