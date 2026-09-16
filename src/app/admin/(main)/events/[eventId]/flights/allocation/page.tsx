import type { Metadata } from "next"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { AllocationWorkbench } from "@/features/flights/components"
import { prefetchFlightAllocation } from "@/features/flights/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

export const metadata: Metadata = { title: "Phân chuyến bay" }

export default async function FlightAllocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireOrganizer()
  const { eventId } = await params
  const raw = await searchParams
  const rawPage = Array.isArray(raw.page) ? raw.page[0] : raw.page
  const rawPageSize = Array.isArray(raw.pageSize) ? raw.pageSize[0] : raw.pageSize
  const page = Number(rawPage)
  const pageSize = Number(rawPageSize)
  const pagination = {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: [10, 25, 50, 100].includes(pageSize) ? pageSize : 25,
  }
  await prefetchFlightAllocation(eventId, pagination)
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <AllocationWorkbench eventId={eventId} pagination={pagination} />
    </HydrationBoundary>
  )
}
