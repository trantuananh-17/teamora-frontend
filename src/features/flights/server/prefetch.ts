import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { allocationRunsOptions, flightAssignmentsOptions, flightsListOptions } from "../options/flights.options"
import type { FlightFilters, PageParams } from "../service/flights.service"

export async function prefetchFlights(eventId: string, filters: FlightFilters = {}, pagination?: PageParams) {
  const client = getQueryClient()
  await Promise.all([
    client.prefetchQuery(flightsListOptions(eventId, filters, pagination)),
    client.prefetchQuery(flightsListOptions(eventId, {}, { page: 1, pageSize: 100 })),
  ])
}

export async function prefetchFlightAllocation(eventId: string, pagination?: PageParams) {
  const client = getQueryClient()
  await Promise.all([
    client.prefetchQuery(flightsListOptions(eventId, {}, { page: 1, pageSize: 100 })),
    client.prefetchQuery(flightAssignmentsOptions(eventId, pagination)),
    client.prefetchQuery(allocationRunsOptions(eventId)),
  ])
}
