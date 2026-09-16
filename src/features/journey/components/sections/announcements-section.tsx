"use client"

import { BellRingIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useJourney } from "../../hooks/journey.hook"
import { EmptyLine, time } from "./shared"

/** Backend already orders by `publishedAt desc`; `limit` is for the overview. */
export function AnnouncementsSection({ eventId, limit }: { eventId: string; limit?: number }) {
  const { data: journey } = useJourney(eventId)
  const items = limit ? journey.announcements.slice(0, limit) : journey.announcements

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRingIcon className="size-5 text-primary" />
          {limit ? "Thông báo mới nhất" : "Thông báo"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium">{item.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {item.publishedAt ? time(item.publishedAt) : ""}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm">{item.body}</p>
            </article>
          ))
        ) : (
          <EmptyLine>Chưa có thông báo mới.</EmptyLine>
        )}
      </CardContent>
    </Card>
  )
}
