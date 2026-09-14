"use client"
import { useRef, useState } from "react"
import { z } from "zod"
import {
  BedDoubleIcon,
  Building2Icon,
  DownloadIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react"
import { EntityContainer, EntityEmptyView, EntityHeader } from "@/components/entity-components"
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
import { apiErrorBody } from "@/lib/api-error"
import {
  useAccommodations,
  useCreateHotel,
  useCreateRoom,
  useCreateRoomType,
  useDeleteHotel,
  useDeleteRoom,
  useDeleteRoomType,
  useImportRoomAssignments,
  useUpdateHotel,
  useUpdateRoom,
  useUpdateRoomType,
} from "../hooks/logistics.hook"
import {
  accommodationsExportUrl,
  type HotelItem,
  type RoomItem,
  type RoomType,
} from "../service/logistics.service"

type Hotel = HotelItem["hotel"]
type Editor =
  | { kind: "hotel"; value?: Hotel }
  | { kind: "type"; hotelId: string; value?: RoomType }
  | { kind: "room"; hotelId: string; value?: RoomItem }

export function AccommodationsManager({ eventId }: { eventId: string }) {
  const { data } = useAccommodations(eventId)
  const [editor, setEditor] = useState<Editor | null>(null)
  const [importErrors, setImportErrors] = useState<
    { row: number; column?: string; message: string }[]
  >([])
  const fileRef = useRef<HTMLInputElement>(null)
  const importer = useImportRoomAssignments(eventId)
  const removeHotel = useDeleteHotel(eventId)
  const removeType = useDeleteRoomType(eventId)
  const removeRoom = useDeleteRoom(eventId)
  const capacity = data.rooms.reduce((sum, x) => sum + x.room.capacity, 0)
  const assigned = data.rooms.reduce((sum, x) => sum + x.assignedCount, 0)
  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Khách sạn & phân phòng"
          description="Quản lý kho phòng và import danh sách phân phòng đã được BTC chốt."
          newButtonLabel="Thêm khách sạn"
          onNew={() => setEditor({ kind: "hotel" })}
          actions={
            <div className="flex gap-2">
              <input
                ref={fileRef}
                className="hidden"
                type="file"
                accept=".xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file)
                    importer.mutate(file, {
                      onSuccess: () => setImportErrors([]),
                      onError: async (error) => {
                        const body = await apiErrorBody(error)
                        const parsed = z
                          .object({
                            totalErrors: z.number(),
                            errors: z.array(
                              z.object({
                                row: z.number(),
                                column: z.string().optional(),
                                message: z.string(),
                              }),
                            ),
                          })
                          .safeParse(body?.error?.details)
                        if (parsed.success) setImportErrors(parsed.data.errors)
                      },
                    })
                  e.target.value = ""
                }}
              />
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={importer.isPending}
              >
                <UploadIcon />
                Import phân phòng
              </Button>
              <Button variant="outline" asChild>
                <a href={accommodationsExportUrl(eventId)}>
                  <DownloadIcon />
                  Xuất tổng hợp
                </a>
              </Button>
            </div>
          }
        />
      }
      stats={
        <div className="grid gap-3 sm:grid-cols-4">
          <Metric label="Khách sạn" value={data.hotels.length} />
          <Metric label="Số phòng" value={data.rooms.length} />
          <Metric label="Tổng chỗ" value={capacity} />
          <Metric label="Đã phân" value={assigned} />
        </div>
      }
    >
      {!data.hotels.length ? (
        <EntityEmptyView
          icon={<Building2Icon />}
          title="Chưa có khách sạn"
          message="Thêm khách sạn, loại phòng và phòng trước khi import phân phòng."
          onNew={() => setEditor({ kind: "hotel" })}
          newLabel="Thêm khách sạn đầu tiên"
        />
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
                      onClick={() => setEditor({ kind: "hotel", value: hotel })}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
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
                          onClick={() => setEditor({ kind: "type", hotelId: hotel.id, value: x })}
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
                        (item) => item.room.id === x.room.id,
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
                          <span className="text-sm tabular-nums">
                            {x.assignedCount}/{x.room.capacity}
                          </span>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setEditor({ kind: "room", hotelId: hotel.id, value: x })}
                          >
                            <PencilIcon />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
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
                  <Button size="sm" onClick={() => setEditor({ kind: "room", hotelId: hotel.id })}>
                    <PlusIcon />
                    Thêm phòng
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      <AccommodationDialog
        key={editorKey(editor)}
        eventId={eventId}
        editor={editor}
        roomTypes={data.roomTypes.filter(
          (x) => x.hotelId === (editor && "hotelId" in editor ? editor.hotelId : ""),
        )}
        close={() => setEditor(null)}
      />
      <Dialog open={importErrors.length > 0} onOpenChange={(open) => !open && setImportErrors([])}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>File phân phòng có lỗi</DialogTitle>
            <DialogDescription>
              Chưa có dòng nào được ghi. Sửa các ô dưới đây rồi import lại.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto rounded-lg border">
            <div className="divide-y">
              {importErrors.map((error, index) => (
                <div
                  key={`${error.row}-${error.column}-${index}`}
                  className="grid grid-cols-[5rem_9rem_1fr] gap-3 p-3 text-sm"
                >
                  <span>Dòng {error.row}</span>
                  <span className="text-muted-foreground">{error.column ?? "—"}</span>
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setImportErrors([])}>Đã hiểu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </EntityContainer>
  )
}
function editorKey(editor: Editor | null) {
  if (!editor) return "closed"
  if (editor.kind === "hotel") return `hotel-${editor.value?.id ?? "new"}`
  if (editor.kind === "type") return `type-${editor.value?.id ?? "new"}-${editor.hotelId}`
  return `room-${editor.value?.room.id ?? "new"}-${editor.hotelId}`
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
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
