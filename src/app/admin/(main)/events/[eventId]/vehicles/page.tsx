import type { Metadata } from "next"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"

import { VehiclesManager } from "@/features/logistics/components"
import { prefetchVehicles } from "@/features/logistics/server/prefetch"
import { prefetchPickupPoints } from "@/features/pickup-points/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

export const metadata: Metadata = { title: "Xe đưa đón" }

export default async function VehiclesPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireOrganizer()
  const { eventId } = await params
  // The vehicle form offers pickup points, so both are warmed together.
  await Promise.all([prefetchVehicles(eventId), prefetchPickupPoints(eventId)])
  return (
    <HydrationBoundary state={dehydrate(getQueryClient())}>
      <VehiclesManager eventId={eventId} />
    </HydrationBoundary>
  )
}
