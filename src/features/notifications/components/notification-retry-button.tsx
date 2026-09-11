"use client"

import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useRetryNotification } from "../hooks/notifications.hook"

export function NotificationRetryButton({ eventId, id }: { eventId: string; id: string }) {
  const retry = useRetryNotification(eventId)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={retry.isPending}
      onClick={() => retry.mutate(id)}
    >
      <RefreshCwIcon data-icon="inline-start" className={retry.isPending ? "animate-spin" : undefined} />
      Gửi lại
    </Button>
  )
}
