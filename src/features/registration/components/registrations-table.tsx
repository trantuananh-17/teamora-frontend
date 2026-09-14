"use client"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { useRegistrationsList } from "../hooks/registration-admin.hook"
import type { ListRegistrationsParams } from "../service/registration-admin.service"
import { columns } from "./columns"

interface RegistrationsTableProps {
  eventId: string
  params: ListRegistrationsParams
}

export function RegistrationsTable({ eventId, params }: RegistrationsTableProps) {
  const { data } = useRegistrationsList(eventId, params)

  return (
    <EntityDataTable
      columns={columns}
      data={data.items}
      hasFilters={Boolean(
        params.search ||
        params.teamId ||
        params.participating !== undefined ||
        params.shiftPreference ||
        params.shiftLocked !== undefined,
      )}
      emptyView={
        <EntityEmptyView
          title="Chưa có đăng ký"
          message="Khi CBNV gửi form, danh sách sẽ xuất hiện ở đây."
        />
      }
    />
  )
}
