"use client"
import { useState } from "react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { BedDoubleIcon, Building2Icon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { EntityEmptyView } from "@/components/entity-components"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useAccommodations,
  useCreateHotel,
  useCreateRoom,
  useCreateRoomType,
  useDeleteHotel,
  useDeleteRoom,
  useDeleteRoomType,
  useUpdateHotel,
  useUpdateRoom,
  useUpdateRoomType,
} from "../hooks/logistics.hook"
import { type HotelItem, type RoomItem, type RoomType } from "../service/logistics.service"
import { RoomAssignmentsPanel } from "./room-assignments-panel"

type Hotel = HotelItem["hotel"]
type Editor =
  | { kind: "hotel"; value?: Hotel }
  | { kind: "type"; hotelId: string; value?: RoomType }
  | { kind: "room"; hotelId: string; value?: RoomItem }

const tabParam = parseAsStringLiteral(["rooms", "assignments"]).withDefault("rooms")

export function AccommodationsManager({ eventId }: { eventId: string }) {
  const { data } = useAccommodations(eventId)
  const [tab, setTab] = useQueryState("tab", tabParam)
  const [editor, setEditor] = useState<Editor | null>(null)
  const removeHotel = useDeleteHotel(eventId)
  const removeType = useDeleteRoomType(eventId)
  const removeRoom = useDeleteRoom(eventId)
  const capacity = data.rooms.reduce((sum, x) => sum + x.room.capacity, 0)
  const assigned = data.rooms.reduce((sum, x) => sum + x.assignedCount, 0)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <PageHeader
        title="Khách sạn & phòng"
        description="Kho phòng của kỳ và danh sách phân phòng BTC đã chốt. CBNV thấy phòng của mình sau khi công bố."
        actions={
          tab === "rooms" && (
            <Button size="sm" onClick={() => setEditor({ kind: "hotel" })}>
              <PlusIcon />
              Thêm khách sạn
            </Button>
          )
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Khách sạn" value={data.hotels.length} />
        <StatCard label="Số phòng" value={data.rooms.length} />
        <StatCard label="Tổng chỗ" value={capacity} />
        <StatCard
          label="Đã phân"
          value={assigned}
          hint={capacity ? `${Math.round((assigned / capacity) * 100)}% sức chứa` : undefined}
        />
      </div>
      <Tabs value={tab} onValueChange={(value) => setTab(tabParam.parse(value))} className="gap-4">
        <TabsList>
          <TabsTrigger value="rooms">
            <Building2Icon />
            Khách sạn & phòng
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BedDoubleIcon />
            Phân phòng ({assigned})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="rooms">
          {!data.hotels.length ? (
            <div className="flex min-h-64 rounded-md border bg-background">
              <EntityEmptyView
                icon={<Building2Icon />}
                title="Chưa có khách sạn"
                message="Thêm khách sạn, loại phòng và phòng trước khi import phân phòng."
                onNew={() => setEditor({ kind: "hotel" })}
                newLabel="Thêm khách sạn đầu tiên"
              />
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {data.hotels.map(({ hotel, roomCount }) => {
                const types = data.roomTypes.filter((x) => x.hotelId === hotel.id)
                const rooms = data.rooms.filter((x) => x.room.hotelId === hotel.id)
                return (
                  <Card key={hotel.id}>
                    <CardHeader className="flex-row items-start justify-between gap-3">
                      <div>
                        <CardTitle>{hotel.name}</CardTitle>
                        <CardDescription>
                          {hotel.address} · {roomCount} phòng
                        </CardDescription>
                      </div>
                      <div className="flex">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Sửa ${hotel.name}`}
                          onClick={() => setEditor({ kind: "hotel", value: hotel })}
                        >
                          <PencilIcon />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label={`Xóa ${hotel.name}`}
                          disabled={roomCount > 0}
                          onClick={() => removeHotel.mutate(hotel.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {types.map((x) => (
                          <Badge key={x.id} variant="secondary" className="gap-1">
                            {x.name} · {x.capacity} người{" "}
                            <button
                              aria-label={`Sửa ${x.name}`}
                              onClick={() =>
                                setEditor({ kind: "type", hotelId: hotel.id, value: x })
                              }
                            >
                              <PencilIcon className="size-3" />
                            </button>
                            <button
                              aria-label={`Xóa ${x.name}`}
                              onClick={() => removeType.mutate(x.id)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditor({ kind: "type", hotelId: hotel.id })}
                        >
                          <PlusIcon />
                          Loại phòng
                        </Button>
                      </div>
                      <div className="divide-y rounded-lg border">
                        {rooms.map((x) => {
                          const occupants = data.assignments.filter(
                            (item) => item.assignment?.roomId === x.room.id,
                          )
                          return (
                            <div key={x.room.id} className="flex items-start gap-3 p-3">
                              <BedDoubleIcon className="mt-1 size-4 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <div className="font-medium">Phòng {x.room.code}</div>
                                <div className="text-xs text-muted-foreground">
                                  {x.roomType.name} ·{" "}
                                  {occupants.length
                                    ? occupants.map((item) => item.name).join(", ")
                                    : "Chưa có người"}
                                </div>
                              </div>
                              <span
                                className={`text-sm tabular-nums ${x.assignedCount > x.room.capacity ? "text-destructive" : x.assignedCount === x.room.capacity ? "text-warning" : ""}`}
                              >
                                {x.assignedCount}/{x.room.capacity}
                              </span>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Sửa phòng ${x.room.code}`}
                                onClick={() =>
                                  setEditor({ kind: "room", hotelId: hotel.id, value: x })
                                }
                              >
                                <PencilIcon />
                              </Button>
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Xóa phòng ${x.room.code}`}
                                disabled={x.assignedCount > 0}
                                onClick={() => removeRoom.mutate(x.room.id)}
                              >
                                <Trash2Icon />
                              </Button>
                            </div>
                          )
                        })}
                        {!rooms.length && (
                          <div className="p-4 text-sm text-muted-foreground">Chưa có phòng.</div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setEditor({ kind: "room", hotelId: hotel.id })}
                      >
                        <PlusIcon />
                        Thêm phòng
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
        <TabsContent value="assignments">
          <RoomAssignmentsPanel eventId={eventId} />
        </TabsContent>
      </Tabs>
      <AccommodationDialog
        key={editorKey(editor)}
        eventId={eventId}
        editor={editor}
        roomTypes={data.roomTypes.filter(
          (x) => x.hotelId === (editor && "hotelId" in editor ? editor.hotelId : ""),
        )}
        close={() => setEditor(null)}
      />
    </div>
  )
}
function editorKey(editor: Editor | null) {
  if (!editor) return "closed"
  if (editor.kind === "hotel") return `hotel-${editor.value?.id ?? "new"}`
  if (editor.kind === "type") return `type-${editor.value?.id ?? "new"}-${editor.hotelId}`
  return `room-${editor.value?.room.id ?? "new"}-${editor.hotelId}`
}
function AccommodationDialog({
  eventId,
  editor,
  roomTypes,
  close,
}: {
  eventId: string
  editor: Editor | null
  roomTypes: RoomType[]
  close: () => void
}) {
  const hotelValue = editor?.kind === "hotel" ? editor.value : undefined
  const typeValue = editor?.kind === "type" ? editor.value : undefined
  const roomValue = editor?.kind === "room" ? editor.value : undefined
  const [name, setName] = useState(
    hotelValue?.name ?? typeValue?.name ?? roomValue?.room.code ?? "",
  )
  const [address, setAddress] = useState(hotelValue?.address ?? "")
  const [capacity, setCapacity] = useState(
    String(typeValue?.capacity ?? roomValue?.room.capacity ?? 2),
  )
  const [roomTypeId, setRoomTypeId] = useState(roomValue?.room.roomTypeId ?? "")
  const createHotel = useCreateHotel(eventId)
  const updateHotel = useUpdateHotel(eventId, hotelValue?.id ?? "")
  const createType = useCreateRoomType(eventId)
  const updateType = useUpdateRoomType(eventId, typeValue?.id ?? "")
  const createRoom = useCreateRoom(eventId)
  const updateRoom = useUpdateRoom(eventId, roomValue?.room.id ?? "")
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editor) return
    if (editor.kind === "hotel") {
      if (editor.value) updateHotel.mutate({ name, address }, { onSuccess: close })
      else createHotel.mutate({ name, address }, { onSuccess: close })
    }
    if (editor.kind === "type") {
      const input = { name, capacity: Number(capacity) }
      if (editor.value) updateType.mutate(input, { onSuccess: close })
      else createType.mutate({ ...input, hotelId: editor.hotelId }, { onSuccess: close })
    }
    if (editor.kind === "room") {
      const input = { roomTypeId, code: name, capacity: Number(capacity) }
      if (editor.value) updateRoom.mutate(input, { onSuccess: close })
      else createRoom.mutate({ ...input, hotelId: editor.hotelId }, { onSuccess: close })
    }
  }
  const title =
    editor?.kind === "hotel"
      ? `${editor.value ? "Sửa" : "Thêm"} khách sạn`
      : editor?.kind === "type"
        ? `${editor.value ? "Sửa" : "Thêm"} loại phòng`
        : `${editor?.value ? "Sửa" : "Thêm"} phòng`
  return (
    <Dialog open={Boolean(editor)} onOpenChange={(x) => !x && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Dữ liệu được giới hạn trong kỳ đang chọn.</DialogDescription>
        </DialogHeader>
        <form id="accommodation-form" onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel>{editor?.kind === "room" ? "Mã phòng" : "Tên"}</FieldLabel>
              <Input required value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            {editor?.kind === "hotel" && (
              <Field>
                <FieldLabel>Địa chỉ</FieldLabel>
                <Input required value={address} onChange={(e) => setAddress(e.target.value)} />
              </Field>
            )}
            {editor?.kind === "room" && (
              <Field>
                <FieldLabel>Loại phòng</FieldLabel>
                <Select required value={roomTypeId} onValueChange={setRoomTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((x) => (
                      <SelectItem key={x.id} value={x.id}>
                        {x.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            {editor?.kind !== "hotel" && (
              <Field>
                <FieldLabel>Sức chứa</FieldLabel>
                <Input
                  required
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </Field>
            )}
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Hủy
          </Button>
          <Button type="submit" form="accommodation-form">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
