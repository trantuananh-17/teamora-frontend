"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateFlight, useUpdateFlight } from "../hooks/flights.hook"
import type { Flight, FlightDirection, FlightInput, FlightShift } from "../service/flights.service"

type FormState = Omit<FlightInput, "capacity"> & { capacity: string }

const emptyForm: FormState = {
  code: "", direction: "outbound", departAt: "", arriveAt: "",
  fromAirport: "", toAirport: "", capacity: "", shift: null, note: null,
}

function localDateTime(value: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(value).map((part) => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`
}

function fromFlight(flight: Flight | null): FormState {
  if (!flight) return emptyForm
  return {
    code: flight.code,
    direction: flight.direction,
    departAt: localDateTime(flight.departAt),
    arriveAt: localDateTime(flight.arriveAt),
    fromAirport: flight.fromAirport,
    toAirport: flight.toAirport,
    capacity: String(flight.capacity),
    shift: flight.shift,
    note: flight.note,
  }
}

export function FlightDialog({
  eventId, flight, open, onOpenChange,
}: {
  eventId: string
  flight: Flight | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <FlightDialogContent key={flight?.id ?? "new"} eventId={eventId} flight={flight} onOpenChange={onOpenChange} />}
    </Dialog>
  )
}

function FlightDialogContent({ eventId, flight, onOpenChange }: {
  eventId: string
  flight: Flight | null
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<FormState>(() => fromFlight(flight))
  const close = () => onOpenChange(false)
  const create = useCreateFlight(eventId, close)
  const update = useUpdateFlight(eventId, flight?.id ?? "", close)
  const pending = create.isPending || update.isPending

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const input: FlightInput = {
      ...form,
      code: form.code.trim(),
      capacity: Number(form.capacity),
      // datetime-local has no zone. Flight schedules are company-local data, so
      // treat the typed wall clock as Vietnam time even if an organiser travels.
      departAt: new Date(`${form.departAt}:00+07:00`).toISOString(),
      arriveAt: new Date(`${form.arriveAt}:00+07:00`).toISOString(),
      note: form.note?.trim() || null,
    }
    if (flight) update.mutate(input)
    else create.mutate(input)
  }

  return (
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{flight ? "Sửa chuyến bay" : "Thêm chuyến bay"}</DialogTitle>
          <DialogDescription>
            Mã chuyến là duy nhất trong từng chiều. Thời gian được nhập theo múi giờ Việt Nam.
          </DialogDescription>
        </DialogHeader>
        <form id="flight-form" onSubmit={submit}>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="flight-code">Mã chuyến</FieldLabel>
              <Input id="flight-code" required maxLength={32} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="VN123" />
            </Field>
            <Field>
              <FieldLabel>Chiều</FieldLabel>
              <Select value={form.direction} onValueChange={(value) => set("direction", value as FlightDirection)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="outbound">Chiều đi</SelectItem>
                  <SelectItem value="return">Chiều về</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="flight-from">Điểm đi</FieldLabel>
              <Input id="flight-from" required value={form.fromAirport} onChange={(e) => set("fromAirport", e.target.value)} placeholder="HAN" />
            </Field>
            <Field>
              <FieldLabel htmlFor="flight-to">Điểm đến</FieldLabel>
              <Input id="flight-to" required value={form.toAirport} onChange={(e) => set("toAirport", e.target.value)} placeholder="DAD" />
            </Field>
            <Field>
              <FieldLabel htmlFor="flight-depart">Khởi hành</FieldLabel>
              <Input id="flight-depart" required type="datetime-local" value={form.departAt} onChange={(e) => set("departAt", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="flight-arrive">Đến nơi</FieldLabel>
              <Input id="flight-arrive" required type="datetime-local" value={form.arriveAt} onChange={(e) => set("arriveAt", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="flight-capacity">Sức chứa</FieldLabel>
              <Input id="flight-capacity" required type="number" min={0} max={10000} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Ca bay</FieldLabel>
              <Select value={form.shift ?? "none"} onValueChange={(value) => set("shift", value === "none" ? null : value as FlightShift)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>
                  <SelectItem value="none">Không gắn ca</SelectItem>
                  <SelectItem value="shift_1">Ca 1</SelectItem>
                  <SelectItem value="shift_2">Ca 2</SelectItem>
                </SelectGroup></SelectContent>
              </Select>
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="flight-note">Ghi chú</FieldLabel>
              <Textarea id="flight-note" maxLength={500} value={form.note ?? ""} onChange={(e) => set("note", e.target.value)} placeholder="Thông tin hỗ trợ BTC…" />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>Hủy</Button>
          <Button type="submit" form="flight-form" disabled={pending}>{pending ? "Đang lưu…" : "Lưu chuyến bay"}</Button>
        </DialogFooter>
      </DialogContent>
  )
}
