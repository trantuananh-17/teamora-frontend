import type { Metadata } from "next"

import { JourneyTab } from "@/features/journey/components/sections/journey-tab"
import { FlightsSection } from "@/features/journey/components/sections/flights-section"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Chuyến bay" }

export default async function FlightsPage() {
  await requireAuth()
  return <JourneyTab render={(eventId) => <FlightsSection eventId={eventId} />} />
}
