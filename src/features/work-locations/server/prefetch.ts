import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { workLocationsListOptions } from "../options/work-locations.options"

export async function prefetchWorkLocations() {
  await getQueryClient().prefetchQuery(workLocationsListOptions())
}
