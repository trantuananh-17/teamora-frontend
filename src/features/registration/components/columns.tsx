"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Check, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { Registration } from "../service/registration.service"

export const columns: ColumnDef<Registration>[] = [
  {
    accessorKey: "user.name",
    header: "Họ tên",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.user.name}</div>
    ),
  },
  {
    accessorKey: "user.email",
    header: "Email",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.user.email}</div>
    ),
  },
  {
    accessorKey: "team.name",
    header: "Bộ phận",
  },
  {
    accessorKey: "participating",
    header: "Tham gia",
    cell: ({ row }) =>
      row.original.participating ? (
        <Badge variant="outline" className="gap-1">
          <Check className="size-3" />
          Có
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1">
          <X className="size-3" />
          Không
        </Badge>
      ),
  },
  {
    accessorKey: "shiftPreference",
    header: "Ca bay",
    cell: ({ row }) => {
      if (!row.original.participating) return <span className="text-muted-foreground">—</span>
      if (!row.original.shiftPreference) return <span className="text-muted-foreground">Chưa chọn</span>
      return (
        <Badge variant={row.original.shiftLocked ? "default" : "secondary"}>
          {row.original.shiftPreference === "shift_1" ? "Ca 1" : "Ca 2"}
          {row.original.shiftLocked && " (Khóa)"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "submittedAt",
    header: "Ngày đăng ký",
    cell: ({ row }) =>
      row.original.submittedAt ? (
        <span className="text-sm">
          {format(row.original.submittedAt, "dd/MM/yyyy HH:mm", { locale: vi })}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
]
