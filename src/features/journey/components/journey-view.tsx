"use client"

import { AnnouncementsSection } from "./sections/announcements-section"
import { FlightsSection } from "./sections/flights-section"
import { HotelSection } from "./sections/hotel-section"
import { ScheduleSection } from "./sections/schedule-section"
import { TransportSection } from "./sections/transport-section"

/** The whole journey on one page. Each employee tab renders one section instead (S7-SPEC §B1). */
export function JourneyView({ eventId }: { eventId: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <FlightsSection eventId={eventId} />
        <TransportSection eventId={eventId} />
        <HotelSection eventId={eventId} />
      </div>
      <ScheduleSection eventId={eventId} />
      <AnnouncementsSection eventId={eventId} />
    </div>
  )
}
