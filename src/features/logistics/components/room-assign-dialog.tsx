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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useManualAssignRoom } from "../hooks/logistics.hook"
import type { Gender, RoomAssignmentView, RoomItem } from "../service/logistics.service"

export const genderLabels: Record<Gender, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
  undisclosed: "Chưa rõ",
}

/**
 * A room's gender as read from its occupants. Gender is an exact match, same as
 * the backend's manual-assign check: `other` and `undisclosed` are groups of
 * their own, not wildcards, so any two different values make the room "mixed".
 */
export function roomGender(occupants: { gender: Gender }[]) {
  const [only, ...rest] = new Set(occupants.map((x) => x.gender))
  if (rest.length) return { mixed: true as const, label: "Khác giới" }
  return { mixed: false as const, label: only ? genderLabels[only] : "—" }
}

export function RoomAssignDialog({
  eventId,
  person,
  rooms,
  assignments,
  open,
  onOpenChange,
}: {
  eventId: string
  person: RoomAssignmentView
  rooms: RoomItem[]
  assignments: RoomAssignmentView[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [hotelId, setHotelId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [reason, setReason] = useState("")
  const assign = useManualAssignRoom(eventId)
  // Eligibility is computed from committed rows only — a preview is not a fact yet.
  const candidates = rooms.flatMap((item) => {
    if (item.room.id === person.assignment?.roomId) return []
    const occupants = assignments.filter((x) => x.assignment?.roomId === item.room.id)
    if (occupants.length >= item.room.capacity) return []
    if (occupants.some((x) => x.gender !== person.gender)) return []
    return [{ ...item, occupants: occupants.length, genderLabel: roomGender(occupants).label }]
  })
  // Every hotel stays listed so an empty one explains itself instead of vanishing.
  const hotels = [...new Map(rooms.map((x) => [x.hotel.id, x.hotel])).values()]
  const selectedHotelId =
    hotelId ||
    hotels.find((x) => x.id === person.assignment?.hotel.id)?.id ||
    (hotels.length === 1 ? hotels[0].id : "")
  const roomOptions = candidates.filter((x) => x.hotel.id === selectedHotelId)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {person.assignment ? "Đổi phòng" : "Xếp phòng"} cho {person.name}
          </DialogTitle>
          <DialogDescription>
            {person.team?.name ?? "Chưa có team"} · {genderLabels[person.gender]}. Điều chỉnh thủ
            công sẽ tự khóa để lần chạy sau không ghi đè.
          </DialogDescription>
        </DialogHeader>
        {candidates.length ? (
          <FieldGroup>
            <Field>
              <FieldLabel>Khách sạn</FieldLabel>
              <Select
                value={selectedHotelId}
                onValueChange={(value) => {
                  setHotelId(value)
                  setRoomId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khách sạn" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.id} value={hotel.id}>
                      {hotel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Phòng</FieldLabel>
              <Select value={roomId} onValueChange={setRoomId} disabled={!selectedHotelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng còn chỗ" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.map((x) => (
                    <SelectItem key={x.room.id} value={x.room.id}>
                      {x.room.code} · {x.roomType.name} · {x.occupants}/{x.room.capacity} ·{" "}
                      {x.genderLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedHotelId && !roomOptions.length && (
                <p className="text-sm text-muted-foreground">
                  Khách sạn này không còn phòng trống hoặc phòng cùng giới tính.
                </p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="room-reason">Lý do điều chỉnh</FieldLabel>
              <Textarea
                id="room-reason"
                required
                maxLength={500}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: yêu cầu nghiệp vụ từ BTC"
              />
            </Field>
          </FieldGroup>
        ) : (
          <p className="text-sm text-muted-foreground">Không có phòng còn chỗ phù hợp giới tính.</p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            disabled={!roomId || !reason.trim() || assign.isPending}
            onClick={() =>
              assign.mutate(
                { registrationIds: [person.registrationId], roomId, reason: reason.trim() },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
