"use client"

import { useState } from "react"

import { EntityContainer, EntityHeader } from "@/components/entity-components"
import { CreateEventDialog } from "./create-event-dialog"

/**
 * Header, "new" dialog, and the slot the table renders into.
 *
 * `children` is JSX, not a render prop: this is a client component rendered by a
 * server one, and a function cannot cross that boundary. That is also why the
 * empty state below has no button of its own — it points at this header's
 * instead, which is on screen the whole time because the container sits outside
 * the Suspense boundary.
 */
export function EventsContainer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Kỳ Team Building"
          description="Mỗi kỳ có Team, địa điểm và danh sách phân bổ riêng."
          newButtonLabel="Tạo kỳ"
          onNew={() => setOpen(true)}
        />
      }
    >
      {children}
      <CreateEventDialog open={open} onOpenChange={setOpen} />
    </EntityContainer>
  )
}
