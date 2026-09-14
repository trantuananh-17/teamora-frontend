import { queryOptions } from "@tanstack/react-query"

import {
  listAllocationRuns,
  listFlightAssignments,
  listFlights,
  type FlightFilters,
  type PageParams,
} from "../service/flights.service"

export const flightsKeys = {
  event: (eventId: string) => ["flights", eventId] as const,
  list: (eventId: string, filters: FlightFilters, pagination: PageParams) =>
    [...flightsKeys.event(eventId), "list", filters, pagination] as const,
  assignments: (eventId: string, pagination: PageParams) =>
    [...flightsKeys.event(eventId), "assignments", pagination] as const,
  runs: (eventId: string) => [...flightsKeys.event(eventId), "allocation-runs"] as const,
}

export const flightsListOptions = (
  eventId: string,
  filters: FlightFilters = {},
  pagination: PageParams = { page: 1, pageSize: 25 },
) =>
  queryOptions({
    queryKey: flightsKeys.list(eventId, filters, pagination),
    queryFn: () => listFlights(eventId, filters, pagination),
  })

export const flightAssignmentsOptions = (
  eventId: string,
  pagination: PageParams = { page: 1, pageSize: 25 },
) =>
  queryOptions({
    queryKey: flightsKeys.assignments(eventId, pagination),
    queryFn: () => listFlightAssignments(eventId, pagination),
  })

export const allocationRunsOptions = (eventId: string) =>
  queryOptions({
    queryKey: flightsKeys.runs(eventId),
    queryFn: () => listAllocationRuns(eventId),
  })
