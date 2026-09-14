import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { VehicleAllocationWorkbench } from "@/features/logistics/components"
import { prefetchVehicleAllocation } from "@/features/logistics/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"
export default async function VehicleAllocationPage({
  params,
  searchParams,
}: {
  params: Promise<{ eventId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireOrganizer()
  const { eventId } = await params
  const search = await searchParams
  const rawPage = Number(Array.isArray(search.page) ? search.page[0] : search.page)
  const rawSize = Number(Array.isArray(search.pageSize) ? search.pageSize[0] : search.pageSize)
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1
  const pageSize = [10, 25, 50, 100].includes(rawSize) ? rawSize : 25
  await prefetchVehicleAllocation(eventId, page, pageSize)
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <VehicleAllocationWorkbench eventId={eventId} page={page} pageSize={pageSize} />
    </HydrationBoundary>
  )
}
