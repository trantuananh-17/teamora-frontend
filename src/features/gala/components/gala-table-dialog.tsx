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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCreateGalaTable, useUpdateGalaTable } from "../hooks/gala.hook"
import type { GalaTable } from "../service/gala.service"

interface FormState {
  name: string
  capacity: string
  gridCol: string
  gridRow: string
  active: boolean
}

function fromTable(table: GalaTable | null): FormState {
  if (!table) return { name: "", capacity: "10", gridCol: "0", gridRow: "0", active: true }
  return {
    name: table.name,
    capacity: String(table.capacity),
    gridCol: String(table.gridCol),
    gridRow: String(table.gridRow),
    active: table.active,
  }
}

export function GalaTableDialog({
  eventId,
  table,
  open,
  onOpenChange,
}: {
  eventId: string
  table: GalaTable | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <GalaTableDialogContent
          key={table?.id ?? "new"}
          eventId={eventId}
          table={table}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  )
}

function GalaTableDialogContent({
  eventId,
  table,
  onOpenChange,
}: {
  eventId: string
  table: GalaTable | null
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<FormState>(() => fromTable(table))
  const close = () => onOpenChange(false)
  const create = useCreateGalaTable(eventId, close)
  const update = useUpdateGalaTable(eventId, close)
  const pending = create.isPending || update.isPending

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const input = {
      name: form.name.trim(),
      capacity: Number(form.capacity),
      gridCol: Number(form.gridCol),
      gridRow: Number(form.gridRow),
    }
    if (table) update.mutate({ tableId: table.id, input: { ...input, active: form.active } })
    else create.mutate(input)
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{table ? "Sửa bàn" : "Thêm bàn"}</DialogTitle>
        <DialogDescription>
          Ghế được sinh theo số ghế. Số ghế chỉ đổi được khi bàn chưa có Team nào ngồi.
        </DialogDescription>
      </DialogHeader>
      <form id="gala-table-form" onSubmit={submit}>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="gala-table-name">Tên bàn</FieldLabel>
            <Input
              id="gala-table-name"
              required
              maxLength={60}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="A1"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gala-table-capacity">Số ghế</FieldLabel>
            <Input
              id="gala-table-capacity"
              required
              type="number"
              min={1}
              max={20}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gala-table-col">Cột · Hàng</FieldLabel>
            <div className="flex gap-2">
              <Input
                id="gala-table-col"
                required
                type="number"
                min={0}
                max={100}
                aria-label="Cột"
                value={form.gridCol}
                onChange={(e) => set("gridCol", e.target.value)}
              />
              <Input
                required
                type="number"
                min={0}
                max={100}
                aria-label="Hàng"
                value={form.gridRow}
                onChange={(e) => set("gridRow", e.target.value)}
              />
            </div>
          </Field>
          {table && (
            <div className="flex items-center gap-3 rounded-md border p-3 sm:col-span-2">
              <Switch
                id="gala-table-active"
                checked={form.active}
                onCheckedChange={(active) => set("active", active)}
              />
              <Label htmlFor="gala-table-active">Dùng trong sơ đồ</Label>
            </div>
          )}
        </FieldGroup>
      </form>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={close}>
          Hủy
        </Button>
        <Button type="submit" form="gala-table-form" disabled={pending}>
          {pending ? "Đang lưu…" : "Lưu bàn"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
