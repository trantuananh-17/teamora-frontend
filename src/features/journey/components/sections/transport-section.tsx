"use client"

import { BusIcon, Clock3Icon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useJourney } from "../../hooks/journey.hook"
import { EmptyLine, NOT_PARTICIPATING, legLabels, legOrder, time } from "./shared"

export function TransportSection({ eventId }: { eventId: string }) {
  const { data: journey } = useJourney(eventId)
  const byLeg = new Map(journey.vehicles.map((item) => [item.assignment.leg, item]))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BusIcon className="size-5 text-primary" />
          Xe đưa đón
        </CardTitle>
        <CardDescription>Bốn chặng theo nhu cầu đã đăng ký.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {!journey.participant.participating ? (
          <EmptyLine>{NOT_PARTICIPATING}</EmptyLine>
        ) : (
          legOrder.map((leg) => {
            const item = byLeg.get(leg)
            if (!item)
              return (
                <EmptyLine key={leg}>
                  <span className="font-medium text-foreground">{legLabels[leg]}</span> — bạn không
                  đăng ký xe chặng này hoặc BTC chưa phân xe.
                </EmptyLine>
              )
            const { vehicle, pickupPoint } = item
            return (
              <div key={leg} className="rounded-lg border p-4">
                <strong>
                  {legLabels[leg]} · {vehicle.code}
                </strong>
                <p className="mt-2 text-sm">
                  <Clock3Icon className="mr-1 inline size-4" />
                  Tập trung {time(vehicle.gatherAt)}, khởi hành {time(vehicle.departAt)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <MapPinIcon className="mr-1 inline size-4" />
                  {pickupPoint?.name ?? "Điểm tập trung theo thông báo BTC"} → {vehicle.destination}
                </p>
                {vehicle.leaderName && (
                  <p className="mt-1 text-sm">
                    Trưởng xe: {vehicle.leaderName}
                    {vehicle.leaderPhone && (
                      <>
                        {" · "}
                        <a
                          href={`tel:${vehicle.leaderPhone}`}
                          className="inline-flex items-center gap-1 underline underline-offset-4"
                        >
                          <PhoneIcon className="size-3.5" />
                          {vehicle.leaderPhone}
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
