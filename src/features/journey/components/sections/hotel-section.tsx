"use client"

import { BedDoubleIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useJourney } from "../../hooks/journey.hook"
import { EmptyLine, NOT_PARTICIPATING } from "./shared"

export function HotelSection({ eventId }: { eventId: string }) {
  const { data: journey } = useJourney(eventId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BedDoubleIcon className="size-5 text-primary" />
          Khách sạn & phòng
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!journey.participant.participating ? (
          <EmptyLine>{NOT_PARTICIPATING}</EmptyLine>
        ) : journey.accommodation ? (
          <div className="rounded-lg border p-4">
            <strong>
              {journey.accommodation.hotel.name} · Phòng {journey.accommodation.room.code}
            </strong>
            <p className="mt-2 text-sm">
              Loại phòng: {journey.accommodation.roomType.name} ·{" "}
              {journey.accommodation.room.capacity} người
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              <MapPinIcon className="mr-1 inline size-4" />
              {journey.accommodation.hotel.address}
            </p>
            <p className="mt-2 text-sm">
              <UsersIcon className="mr-1 inline size-4 text-muted-foreground" />
              {journey.roommates.length
                ? `Cùng phòng: ${journey.roommates.join(", ")}`
                : "Chưa có ai khác trong phòng."}
            </p>
          </div>
        ) : (
          <EmptyLine>BTC chưa phân phòng cho bạn.</EmptyLine>
        )}
      </CardContent>
    </Card>
  )
}
