import { queryOptions } from "@tanstack/react-query"

import { getNotifications, type NotificationsQuery } from "../service/notifications.service"

export const notificationsKeys = {
  all: () => ["notifications"] as const,
  list: (eventId: string, query: NotificationsQuery) =>
    [...notificationsKeys.all(), "list", eventId, query] as const,
}

export const notificationsListOptions = (eventId: string, query: NotificationsQuery) =>
  queryOptions({
    queryKey: notificationsKeys.list(eventId, query),
    queryFn: () => getNotifications(eventId, query),
  })
