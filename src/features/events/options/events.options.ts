import { queryOptions } from "@tanstack/react-query"

import { getEvent, getEvents } from "../service/events.service"

/**
 * No directive in this file, deliberately. It is imported from `server/prefetch.ts`
 * on the server and from `hooks/events.hook.ts` in the browser; adding
 * `"use client"` here breaks the build.
 */
export const eventsKeys = {
  all: () => ["events"] as const,
  list: () => [...eventsKeys.all(), "list"] as const,
  detail: (eventId: string) => [...eventsKeys.all(), "detail", eventId] as const,
}

export const eventsListOptions = () =>
  queryOptions({ queryKey: eventsKeys.list(), queryFn: getEvents })

export const eventDetailOptions = (eventId: string) =>
  queryOptions({ queryKey: eventsKeys.detail(eventId), queryFn: () => getEvent(eventId) })
