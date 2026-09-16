"use client"

import { PlaneIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJourney } from "../../hooks/journey.hook"
import { EmptyLine, NOT_PARTICIPATING, shiftLabel, time } from "./shared"

export function FlightsSection({ eventId }: { eventId: string }) {
  const { data: journey } = useJourney(eventId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlaneIcon className="size-5 text-primary" />
          Chuyến bay
        </CardTitle>
        <CardDescription>Giờ hiển thị theo múi giờ địa phương.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!journey.participant.participating ? (
          <EmptyLine>{NOT_PARTICIPATING}</EmptyLine>
        ) : journey.flights.length ? (
          journey.flights.map(({ flight }) => (
            <div key={flight.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <strong>
                  {flight.direction === "outbound" ? "Chiều đi" : "Chiều về"} · {flight.code}
                </strong>
                <Badge variant="outline">{shiftLabel(flight.shift)}</Badge>
              </div>
              <p className="mt-2 text-sm">
                {flight.fromAirport} → {flight.toAirport}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {time(flight.departAt)} – {time(flight.arriveAt)}
              </p>
            </div>
          ))
        ) : (
          <EmptyLine>BTC chưa phân chuyến bay cho bạn.</EmptyLine>
        )}
      </CardContent>
    </Card>
  )
}
