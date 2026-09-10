"use client"

import { useState } from "react"

import { EntityContainer, EntityHeader } from "@/components/entity-components"
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
import { useCreateWorkLocation } from "../hooks/work-locations.hook"

export function WorkLocationsContainer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const create = useCreateWorkLocation(() => {
    setName("")
    setOpen(false)
  })

  return (
    <EntityContainer
      width="medium"
      header={
        <EntityHeader
          title="Địa điểm làm việc"
          description="Dùng chung cho mọi kỳ — một người vẫn làm ở một nơi qua nhiều kỳ Team Building."
          newButtonLabel="Thêm địa điểm"
          onNew={() => setOpen(true)}
        />
      }
    >
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm địa điểm làm việc</DialogTitle>
            <DialogDescription>
              Tên này xuất hiện trong file import CBNV, nên phải khớp đúng chính tả với cột “Địa
              điểm làm việc” trong file.
            </DialogDescription>
          </DialogHeader>
          <form
            id="create-work-location"
            onSubmit={(event) => {
              event.preventDefault()
              create.mutate({ name })
            }}
            className="flex flex-col gap-2"
          >
            <Label htmlFor="work-location-name">Tên địa điểm</Label>
            <Input
              id="work-location-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Hà Nội"
            />
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="create-work-location" disabled={create.isPending}>
              {create.isPending ? "Đang thêm…" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EntityContainer>
  )
}
