import type { Metadata } from "next"

import { JourneyTab } from "@/features/journey/components/sections/journey-tab"
import { HotelSection } from "@/features/journey/components/sections/hotel-section"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Khách sạn" }

export default async function HotelPage() {
  await requireAuth()
  return <JourneyTab render={(eventId) => <HotelSection eventId={eventId} />} />
}
