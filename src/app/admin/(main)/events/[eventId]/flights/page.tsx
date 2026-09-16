import type { Metadata } from "next"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { FlightsManager } from "@/features/flights/components"
import { prefetchFlights } from "@/features/flights/server/prefetch"
import type {
  FlightDirection,
  FlightFilters,
  FlightShift,
} from "@/features/flights/service/flights.service"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

type SearchParams = Record<string, string | string[] | undefined>

export const metadata: Metadata = { title: "Chuyến bay" }

export default async function FlightsPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<SearchParams>
}) {
  await requireOrganizer()
  const { eventId } = await params
  const raw = await searchParams
  const filters: FlightFilters = {
    search: single(raw.search),
    direction: direction(single(raw.direction)),
    shift: shift(single(raw.shift)),
  }
  const pagination = paginationFrom(raw)
  await prefetchFlights(eventId, filters, pagination)
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <FlightsManager eventId={eventId} filters={filters} pagination={pagination} />
    </HydrationBoundary>
  )
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || undefined
}

function direction(value?: string): FlightDirection | undefined {
  return value === "outbound" || value === "return" ? value : undefined
}

function shift(value?: string): FlightShift | undefined {
  return value === "shift_1" || value === "shift_2" ? value : undefined
}

function paginationFrom(raw: SearchParams) {
  const page = Number(single(raw.page))
  const pageSize = Number(single(raw.pageSize))
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: [10, 25, 50, 100].includes(pageSize) ? pageSize : 25,
  }
}
