import "server-only"
import { getQueryClient } from "@/lib/get-query-client"
import { contentOptions, dashboardOptions, journeyOptions } from "../options/journey.options"
export const prefetchDashboard = (id: string) => getQueryClient().fetchQuery(dashboardOptions(id))
export const prefetchContent = (id: string) => getQueryClient().fetchQuery(contentOptions(id))
// `prefetchQuery`, not `fetchQuery`: the employee layout warms this for every
// tab, and a failure there must not take the whole shell down.
export const prefetchJourney = (eventId: string) =>
  getQueryClient().prefetchQuery(journeyOptions(eventId))
