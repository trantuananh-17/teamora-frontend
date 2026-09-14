"use client"

import { useState } from "react"

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
import { useCreateEvent } from "../hooks/events.hook"

/**
 * The code cannot be changed afterwards — it travels in exports and in emails
 * that have already been sent — so the form says so rather than letting the
 * organiser find out later.
 */
export function CreateEventDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [openAt, setOpenAt] = useState("")
  const [closeAt, setCloseAt] = useState("")

  const create = useCreateEvent(() => {
    setName("")
    setCode("")
    setOpenAt("")
    setCloseAt("")
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo kỳ Team Building</DialogTitle>
          <DialogDescription>Kỳ mới bắt đầu ở trạng thái “Đang mở đăng ký”.</DialogDescription>
        </DialogHeader>

        <form
          id="create-event"
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            create.mutate({
              name,
              code,
              // The date inputs give a local date; empty means "not set", which
              // the backend stores as null rather than as the epoch.
              registrationOpenAt: openAt ? new Date(openAt).toISOString() : null,
              registrationCloseAt: closeAt ? new Date(closeAt).toISOString() : null,
            })
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-name">Tên kỳ</Label>
            <Input
              id="event-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Team Building 2026"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-code">Mã kỳ</Label>
            <Input
              id="event-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="TB2026"
            />
            <p className="text-xs text-muted-foreground">
              Chữ, số, gạch ngang và gạch dưới. <strong>Không đổi được sau khi tạo</strong> — mã này
              đi vào file export và email đã gửi.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="event-open">Mở đăng ký</Label>
              <Input
                id="event-open"
                type="date"
                value={openAt}
                onChange={(e) => setOpenAt(e.target.value)}
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="event-close">Đóng đăng ký</Label>
              <Input
                id="event-close"
                type="date"
                value={closeAt}
                onChange={(e) => setCloseAt(e.target.value)}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" form="create-event" disabled={create.isPending}>
            {create.isPending ? "Đang tạo…" : "Tạo kỳ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
