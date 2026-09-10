"use client"

import { useState } from "react"

import { EventStatusBadge, eventStatusLabel } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useAdvanceEventStatus,
  useEventSuspense,
  useRevertEventStatus,
} from "../hooks/events.hook"
import { eventStatuses, type EventStatus } from "../service/events.service"

/**
 * §12 walks forward one step at a time, so there is one button and it names the
 * step. A dropdown of every status would offer moves the backend refuses.
 */
function nextStatus(current: EventStatus): EventStatus | undefined {
  return eventStatuses[eventStatuses.indexOf(current) + 1]
}

function previousStatus(current: EventStatus): EventStatus | undefined {
  const index = eventStatuses.indexOf(current)
  return index > 0 ? eventStatuses[index - 1] : undefined
}

/**
 * What the next step actually does, said plainly. "Bạn có chắc không" is not a
 * sentence anybody can act on; naming the consequence is.
 */
const CONSEQUENCE: Partial<Record<EventStatus, string>> = {
  registration_closed: "CBNV sẽ không sửa được đăng ký nữa.",
  allocation_processing: "Bắt đầu phân bổ. CBNV vẫn chưa thấy kết quả.",
  information_published: "CBNV sẽ thấy chuyến bay, xe và phòng của mình.",
}

export function EventStatusControl({
  eventId,
  canRevert,
}: {
  eventId: string
  /**
   * From the session, resolved on the server. UX only — the backend puts revert
   * behind `super_admin` and would refuse it regardless of what this renders.
   */
  canRevert: boolean
}) {
  const { data: event } = useEventSuspense(eventId)
  const [revertOpen, setRevertOpen] = useState(false)
  const [reason, setReason] = useState("")

  const advance = useAdvanceEventStatus(eventId)
  const revert = useRevertEventStatus(eventId, () => {
    setReason("")
    setRevertOpen(false)
  })

  const next = nextStatus(event.status)
  const previous = previousStatus(event.status)

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">Trạng thái kỳ</span>
          <EventStatusBadge status={event.status} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canRevert && previous && (
            <Button variant="outline" size="sm" onClick={() => setRevertOpen(true)}>
              Lùi về “{eventStatusLabel(previous)}”
            </Button>
          )}
          {next ? (
            <Button size="sm" disabled={advance.isPending} onClick={() => advance.mutate(next)}>
              {advance.isPending ? "Đang chuyển…" : `Chuyển sang “${eventStatusLabel(next)}”`}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">Kỳ đã kết thúc.</span>
          )}
        </div>
      </div>

      {next && CONSEQUENCE[next] && (
        <p className="text-sm text-muted-foreground">{CONSEQUENCE[next]}</p>
      )}

      <Dialog open={revertOpen} onOpenChange={setRevertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lùi trạng thái kỳ</DialogTitle>
            <DialogDescription>
              Kỳ sẽ quay về “{previous ? eventStatusLabel(previous) : ""}”. Thao tác này được ghi
              vào nhật ký kèm tên bạn và lý do bên dưới.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <Label htmlFor="revert-reason">Lý do</Label>
            <Input
              id="revert-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mở lại cho 12 CBNV bổ sung đăng ký"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevertOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || revert.isPending || !previous}
              onClick={() => previous && revert.mutate({ status: previous, reason })}
            >
              {revert.isPending ? "Đang lùi…" : "Lùi trạng thái"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
