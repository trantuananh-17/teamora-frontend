import type { Metadata } from "next"

import { JourneyTab } from "@/features/journey/components/sections/journey-tab"
import { AnnouncementsSection } from "@/features/journey/components/sections/announcements-section"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Thông báo" }

export default async function AnnouncementsPage() {
  await requireAuth()
  return <JourneyTab render={(eventId) => <AnnouncementsSection eventId={eventId} />} />
}
