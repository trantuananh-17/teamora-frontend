"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { useEmployeesSuspense } from "../hooks/employees.hook"
import type { Employee } from "../service/employees.service"

const ROLE_LABEL: Record<string, string> = {
  employee: "CBNV",
  team_leader: "Trưởng Team",
  organizer: "Ban Tổ chức",
  super_admin: "Quản trị",
}

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "name",
    header: "Họ và tên",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "employeeCode",
    header: "Mã NV",
    meta: { priority: "secondary" },
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.employeeCode ?? "—"}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Điện thoại",
    meta: { priority: "tertiary" },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.phone ?? "—"}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    meta: { priority: "tertiary" },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {ROLE_LABEL[row.original.role ?? ""] ?? row.original.role ?? "—"}
      </span>
    ),
  },
]

export function EmployeesTable() {
  const { data } = useEmployeesSuspense()

  return (
    <EntityDataTable
      columns={columns}
      data={data}
      emptyView={
        <EntityEmptyView
          title="Chưa có CBNV nào"
          message="Bấm “Import Excel” ở trên. File cần các cột: Mã nhân viên, Họ và tên, Email, Bộ phận/Team, Địa điểm làm việc, Số điện thoại, Giới tính. Một dòng sai là cả file bị từ chối."
        />
      }
    />
  )
}
