import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { VehiclesManager } from "@/features/logistics/components"
import { prefetchVehicles } from "@/features/logistics/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"
export default async function VehiclesPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireOrganizer(); const { eventId } = await params; await prefetchVehicles(eventId)
  return <HydrationBoundary state={dehydrate(getQueryClient())}><VehiclesManager eventId={eventId} /></HydrationBoundary>
}
