import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { pickupPointsListOptions } from "../options/pickup-points.options"

export async function prefetchPickupPoints(eventId: string) {
  await getQueryClient().prefetchQuery(pickupPointsListOptions(eventId))
}
