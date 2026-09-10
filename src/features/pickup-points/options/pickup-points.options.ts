import { queryOptions } from "@tanstack/react-query"

import { getPickupPoints } from "../service/pickup-points.service"

export const pickupPointsKeys = {
  all: () => ["pickup-points"] as const,
  list: (eventId: string) => [...pickupPointsKeys.all(), "list", eventId] as const,
}

export const pickupPointsListOptions = (eventId: string) =>
  queryOptions({
    queryKey: pickupPointsKeys.list(eventId),
    queryFn: () => getPickupPoints(eventId),
  })
