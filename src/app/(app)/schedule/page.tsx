import type { Metadata } from "next"

import { JourneyTab } from "@/features/journey/components/sections/journey-tab"
import { ScheduleSection } from "@/features/journey/components/sections/schedule-section"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Lịch trình" }

export default async function SchedulePage() {
  await requireAuth()
  return <JourneyTab render={(eventId) => <ScheduleSection eventId={eventId} />} />
}
