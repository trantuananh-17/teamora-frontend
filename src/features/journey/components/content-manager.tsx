"use client"
import { useState } from "react"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { BellRingIcon, CalendarDaysIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EntityEmptyView } from "@/components/entity-components"
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
import { Textarea } from "@/components/ui/textarea"
import {
  useContent,
  useCreateAnnouncement,
  useCreateSchedule,
  useDeleteAnnouncement,
  useDeleteSchedule,
  useUpdateAnnouncement,
  useUpdateSchedule,
} from "../hooks/journey.hook"
import type {
  Announcement,
  AnnouncementInput,
  ScheduleInput,
  ScheduleItem,
} from "../service/journey.service"

type Editor =
  { kind: "schedule"; item?: ScheduleItem } | { kind: "announcement"; item?: Announcement }
const tabParam = parseAsStringLiteral(["schedule", "announcements"]).withDefault("schedule")
const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}
const hourMinute = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" })
const shortDate = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "numeric" })

export function ContentManager({ eventId }: { eventId: string }) {
  const { data } = useContent(eventId)
  const [tab, setTab] = useQueryState("tab", tabParam)
  const [editor, setEditor] = useState<Editor | null>(null)
  const removeSchedule = useDeleteSchedule(eventId)
  const removeAnnouncement = useDeleteAnnouncement(eventId)
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(tabParam.parse(value))} className="gap-4">
      <TabsList>
        <TabsTrigger value="schedule">
          <CalendarDaysIcon />
          Lịch trình ({data.schedule.length})
        </TabsTrigger>
        <TabsTrigger value="announcements">
          <BellRingIcon />
          Thông báo ({data.announcements.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="schedule" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Hiển thị theo thứ tự ngày và giờ bắt đầu trong Hành trình của CBNV.
          </p>
          <Button onClick={() => setEditor({ kind: "schedule" })}>
            <PlusIcon data-icon="inline-start" />
            Thêm hoạt động
          </Button>
        </div>
        {data.schedule.length ? (
          <div className="flex flex-col divide-y rounded-lg border bg-card">
            {data.schedule.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 p-4 sm:grid-cols-[7rem_1fr_auto] sm:items-start"
              >
                <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                  <Badge>Ngày {item.day}</Badge>
                  <p className="text-sm tabular-nums text-muted-foreground">
                    {hourMinute.format(item.startAt)} – {hourMinute.format(item.endAt)}
                    <span className="block text-xs">{shortDate.format(item.startAt)}</span>
                  </p>
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium">{item.title}</h3>
                  {item.location && (
                    <p className="text-sm text-muted-foreground">{item.location}</p>
                  )}
                  {item.description && (
                    <p className="mt-1 whitespace-pre-wrap text-sm">{item.description}</p>
                  )}
                </div>
                <div className="flex gap-1 sm:justify-end">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Sửa"
                    onClick={() => setEditor({ kind: "schedule", item })}
                  >
                    <PencilIcon />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    aria-label="Xóa"
                    onClick={() => confirm("Xóa hoạt động này?") && removeSchedule.mutate(item.id)}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EntityEmptyView
            title="Chưa có hoạt động nào"
            message="Thêm hoạt động đầu tiên để lịch trình xuất hiện trong Hành trình của CBNV."
          />
        )}
      </TabsContent>
      <TabsContent value="announcements" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Bản nháp chỉ BTC thấy; công bố để CBNV nhận được trong Hành trình.
          </p>
          <Button onClick={() => setEditor({ kind: "announcement" })}>
            <PlusIcon data-icon="inline-start" />
            Thêm thông báo
          </Button>
        </div>
        {data.announcements.length ? (
          <div className="flex flex-col divide-y rounded-lg border bg-card">
            {data.announcements.map((item) => (
              <article key={item.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={item.publishedAt ? "default" : "secondary"}>
                        {item.publishedAt ? "Đã công bố" : "Bản nháp"}
                      </Badge>
                      <Badge variant="outline">
                        {item.audience === "organizers"
                          ? "BTC"
                          : item.audience === "all"
                            ? "Tất cả"
                            : "Người tham gia"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Sửa"
                      onClick={() => setEditor({ kind: "announcement", item })}
                    >
                      <PencilIcon />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      aria-label="Xóa"
                      onClick={() =>
                        confirm("Xóa thông báo này?") && removeAnnouncement.mutate(item.id)
                      }
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm">{item.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <EntityEmptyView
            title="Chưa có thông báo nào"
            message="Thêm thông báo để gửi lưu ý chung tới CBNV."
          />
        )}
      </TabsContent>
      {editor?.kind === "schedule" && (
        <ScheduleDialog eventId={eventId} item={editor.item} onClose={() => setEditor(null)} />
      )}
      {editor?.kind === "announcement" && (
        <AnnouncementDialog eventId={eventId} item={editor.item} onClose={() => setEditor(null)} />
      )}
    </Tabs>
  )
}

function ScheduleDialog({
  eventId,
  item,
  onClose,
}: {
  eventId: string
  item?: ScheduleItem
  onClose: () => void
}) {
  const [value, setValue] = useState({
    day: String(item?.day ?? 1),
    startAt: item ? localDateTime(item.startAt) : "",
    endAt: item ? localDateTime(item.endAt) : "",
    title: item?.title ?? "",
    location: item?.location ?? "",
    description: item?.description ?? "",
  })
  const create = useCreateSchedule(eventId),
    update = useUpdateSchedule(eventId, item?.id ?? "")
  const submit = () => {
    const input: ScheduleInput = {
      day: Number(value.day),
      startAt: new Date(value.startAt).toISOString(),
      endAt: new Date(value.endAt).toISOString(),
      title: value.title,
      location: value.location || null,
      description: value.description || null,
    }
    ;(item ? update : create).mutate(input, { onSuccess: onClose })
  }
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa hoạt động" : "Thêm hoạt động"}</DialogTitle>
          <DialogDescription>
            Lịch trình này sẽ xuất hiện trong Journey sau khi kỳ được công bố.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Ngày thứ</FieldLabel>
            <Input
              type="number"
              min={1}
              value={value.day}
              onChange={(e) => setValue({ ...value, day: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Tiêu đề</FieldLabel>
            <Input
              value={value.title}
              onChange={(e) => setValue({ ...value, title: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Bắt đầu</FieldLabel>
              <Input
                type="datetime-local"
                value={value.startAt}
                onChange={(e) => setValue({ ...value, startAt: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel>Kết thúc</FieldLabel>
              <Input
                type="datetime-local"
                value={value.endAt}
                onChange={(e) => setValue({ ...value, endAt: e.target.value })}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>Địa điểm</FieldLabel>
            <Input
              value={value.location}
              onChange={(e) => setValue({ ...value, location: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Mô tả</FieldLabel>
            <Textarea
              value={value.description}
              onChange={(e) => setValue({ ...value, description: e.target.value })}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={
              !value.title || !value.startAt || !value.endAt || create.isPending || update.isPending
            }
            onClick={submit}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AnnouncementDialog({
  eventId,
  item,
  onClose,
}: {
  eventId: string
  item?: Announcement
  onClose: () => void
}) {
  const [value, setValue] = useState<AnnouncementInput>({
    title: item?.title ?? "",
    body: item?.body ?? "",
    audience: item?.audience ?? "participants",
    published: Boolean(item?.publishedAt),
  })
  const create = useCreateAnnouncement(eventId),
    update = useUpdateAnnouncement(eventId, item?.id ?? "")
  const submit = () => (item ? update : create).mutate(value, { onSuccess: onClose })
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Sửa thông báo" : "Thêm thông báo"}</DialogTitle>
          <DialogDescription>
            Công bố sau khi kỳ đã publish sẽ tạo email cho người tham gia.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel>Tiêu đề</FieldLabel>
            <Input
              value={value.title}
              onChange={(e) => setValue({ ...value, title: e.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Nội dung</FieldLabel>
            <Textarea
              className="min-h-32"
              value={value.body}
              onChange={(e) => setValue({ ...value, body: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Đối tượng</FieldLabel>
              <Select
                value={value.audience}
                onValueChange={(audience: AnnouncementInput["audience"]) =>
                  setValue({ ...value, audience })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participants">Người tham gia</SelectItem>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="organizers">Chỉ BTC</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Trạng thái</FieldLabel>
              <Select
                value={value.published ? "published" : "draft"}
                onValueChange={(state) => setValue({ ...value, published: state === "published" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bản nháp</SelectItem>
                  <SelectItem value="published">Công bố</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={!value.title || !value.body || create.isPending || update.isPending}
            onClick={submit}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
