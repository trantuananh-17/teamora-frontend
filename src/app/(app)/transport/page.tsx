import type { Metadata } from "next"

import { JourneyTab } from "@/features/journey/components/sections/journey-tab"
import { TransportSection } from "@/features/journey/components/sections/transport-section"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Xe đưa đón" }

export default async function TransportPage() {
  await requireAuth()
  return <JourneyTab render={(eventId) => <TransportSection eventId={eventId} />} />
}
