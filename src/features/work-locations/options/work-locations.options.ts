import { queryOptions } from "@tanstack/react-query"

import { getWorkLocations } from "../service/work-locations.service"

export const workLocationsKeys = {
  all: () => ["work-locations"] as const,
  list: () => [...workLocationsKeys.all(), "list"] as const,
}

export const workLocationsListOptions = () =>
  queryOptions({ queryKey: workLocationsKeys.list(), queryFn: getWorkLocations })
