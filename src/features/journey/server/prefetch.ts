import "server-only"
import { getQueryClient } from "@/lib/get-query-client"
import { contentOptions, dashboardOptions } from "../options/journey.options"
export const prefetchDashboard = (id: string) => getQueryClient().fetchQuery(dashboardOptions(id))
export const prefetchContent = (id: string) => getQueryClient().fetchQuery(contentOptions(id))
