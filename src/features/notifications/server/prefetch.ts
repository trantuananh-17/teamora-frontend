import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { notificationsListOptions } from "../options/notifications.options"
import type { NotificationsQuery } from "../service/notifications.service"

export async function prefetchNotifications(eventId: string, query: NotificationsQuery) {
  await getQueryClient().prefetchQuery(notificationsListOptions(eventId, query))
}
