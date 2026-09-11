"use client"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { useNotificationsSuspense } from "../hooks/notifications.hook"
import type { NotificationsQuery } from "../service/notifications.service"
import { notificationColumns } from "./columns"

export function NotificationsTable({
  eventId,
  query,
}: {
  eventId: string
  query: NotificationsQuery
}) {
  const { data } = useNotificationsSuspense(eventId, query)

  return (
    <EntityDataTable
      columns={notificationColumns(eventId)}
      data={data.items}
      hasFilters={Boolean(query.status)}
      noResultsText="Không có email nào ở trạng thái đã chọn."
      emptyView={
        <EntityEmptyView
          title="Chưa có email nào"
          message="Email xác nhận sẽ xuất hiện sau khi CBNV gửi đăng ký."
        />
      }
    />
  )
}
