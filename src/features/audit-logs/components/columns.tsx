"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from "../constants"
import type { AuditLog } from "../service/audit-logs.service"
import { AuditLogDetails } from "./audit-log-details"

export const auditLogColumns: ColumnDef<AuditLog>[] = [
  {
    id: "actor",
    header: "Người thao tác",
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-medium">{row.original.actorName ?? "Hệ thống"}</span>
        <span className="truncate text-xs text-muted-foreground">
          {row.original.actorEmail ?? "Tác vụ nền"}
        </span>
      </div>
    ),
  },
  {
    id: "change",
    header: "Thay đổi",
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium">
          {AUDIT_ACTION_LABELS[row.original.action] ?? row.original.action}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {AUDIT_ENTITY_LABELS[row.original.entity] ?? row.original.entity}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "entityId",
    header: "ID đối tượng",
    cell: ({ row }) => (
      <span className="block max-w-48 truncate font-mono text-xs">{row.original.entityId}</span>
    ),
    meta: { priority: "tertiary" },
  },
  {
    accessorKey: "reason",
    header: "Lý do",
    cell: ({ row }) => (
      <span className="line-clamp-2 max-w-64 text-sm text-muted-foreground">
        {row.original.reason ?? "—"}
      </span>
    ),
    meta: { priority: "tertiary" },
  },
  {
    accessorKey: "createdAt",
    header: "Thời điểm",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.createdAt.toLocaleString("vi-VN")}
      </span>
    ),
    meta: { priority: "secondary" },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <AuditLogDetails entry={row.original} />,
  },
]
