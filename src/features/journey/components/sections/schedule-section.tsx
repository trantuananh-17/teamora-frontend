"use client"

import { CalendarDaysIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useJourney } from "../../hooks/journey.hook"
import type { ScheduleItem } from "../../service/journey.service"
import { clock, EmptyLine } from "./shared"

export function ScheduleSection({ eventId }: { eventId: string }) {
  const { data: journey } = useJourney(eventId)
  // Backend orders by day, then time — grouping keeps that order.
  const days = journey.schedule.reduce<Map<number, ScheduleItem[]>>((acc, item) => {
    acc.set(item.day, [...(acc.get(item.day) ?? []), item])
    return acc
  }, new Map())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDaysIcon className="size-5 text-primary" />
          Lịch trình chung
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {days.size ? (
          [...days].map(([day, items]) => (
            <section key={day} className="flex flex-col gap-4">
              <Badge variant="outline" className="w-fit">
                Ngày {day}
              </Badge>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 border-l-2 border-primary pl-4 sm:grid-cols-[8rem_1fr]"
                >
                  <p className="text-sm text-muted-foreground">
                    {clock(item.startAt)} – {clock(item.endAt)}
                  </p>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    {item.location && (
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    )}
                    {item.description && <p className="mt-1 text-sm">{item.description}</p>}
                  </div>
                </div>
              ))}
            </section>
          ))
        ) : (
          <EmptyLine>BTC chưa cập nhật lịch trình.</EmptyLine>
        )}
      </CardContent>
    </Card>
  )
}
