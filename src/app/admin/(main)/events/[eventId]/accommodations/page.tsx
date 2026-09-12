import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { AccommodationsManager } from "@/features/logistics/components"
import { prefetchAccommodations } from "@/features/logistics/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"
export default async function AccommodationsPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireOrganizer(); const { eventId } = await params; await prefetchAccommodations(eventId)
  return <HydrationBoundary state={dehydrate(getQueryClient())}><AccommodationsManager eventId={eventId} /></HydrationBoundary>
}
