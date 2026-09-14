"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { InfoIcon, Loader2Icon, LockKeyholeIcon } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { EmployeeSelf } from "@/features/employees/service/employees.service"
import type { Event } from "@/features/events/service/events.service"
import { useCreateOrUpdateRegistration } from "../hooks/registration.hook"
import type { PickupPoint, Team } from "../service/master-data.service"
import type { Registration } from "../service/registration.service"

const TRANSPORT_LEGS = [
  {
    key: "origin_to_airport",
    label: "Từ điểm xuất phát → Sân bay",
    neededName: "transportNeeds.0.needed",
    pickupName: "transportNeeds.0.pickupPointId",
  },
  {
    key: "airport_to_hotel",
    label: "Từ Sân bay → Khách sạn",
    neededName: "transportNeeds.1.needed",
    pickupName: "transportNeeds.1.pickupPointId",
  },
  {
    key: "hotel_to_airport",
    label: "Từ Khách sạn → Sân bay",
    neededName: "transportNeeds.2.needed",
    pickupName: "transportNeeds.2.pickupPointId",
  },
  {
    key: "airport_to_origin",
    label: "Từ Sân bay → Điểm xuất phát",
    neededName: "transportNeeds.3.needed",
    pickupName: "transportNeeds.3.pickupPointId",
  },
] as const

const transportNeedSchema = z.object({
  leg: z.enum(TRANSPORT_LEGS.map((leg) => leg.key)),
  needed: z.boolean(),
  pickupPointId: z.string().nullable(),
})

const formSchema = z
  .object({
    participating: z.boolean(),
    teamId: z.string().min(1, "Vui lòng chọn bộ phận/Team"),
    agreedTerms: z.boolean(),
    shiftPreference: z.enum(["shift_1", "shift_2"]).optional(),
    transportNeeds: z.array(transportNeedSchema).length(4),
    wishNote: z.string().max(1000, "Mong muốn không được vượt quá 1000 ký tự"),
  })
  .superRefine((values, ctx) => {
    if (!values.participating) return

    if (!values.shiftPreference) {
      ctx.addIssue({
        code: "custom",
        path: ["shiftPreference"],
        message: "Vui lòng chọn ca bay",
      })
    }
    if (!values.agreedTerms) {
      ctx.addIssue({
        code: "custom",
        path: ["agreedTerms"],
        message: "Bạn cần đồng ý quy định",
      })
    }
    values.transportNeeds.forEach((need, index) => {
      if (need.needed && !need.pickupPointId) {
        ctx.addIssue({
          code: "custom",
          path: ["transportNeeds", index, "pickupPointId"],
          message: "Vui lòng chọn điểm đón/trả",
        })
      }
    })
  })

type FormValues = z.infer<typeof formSchema>

interface RegistrationFormProps {
  eventId: string
  event: Event
  employee: EmployeeSelf
  registration: Registration | null
  teams: Team[]
  pickupPoints: PickupPoint[]
  canEdit: boolean
}

function SectionHeading({
  step,
  title,
  description,
}: {
  step: string
  title: string
  description?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {step}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </div>
    </div>
  )
}

export function RegistrationForm({
  eventId,
  event,
  employee,
  registration,
  teams,
  pickupPoints,
  canEdit,
}: RegistrationFormProps) {
  const mutation = useCreateOrUpdateRegistration(eventId)
  const activeTeams = teams.filter((team) => team.active)
  const activePickupPoints = pickupPoints.filter((point) => point.active)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participating: registration?.participating ?? true,
      teamId: registration?.teamId ?? employee.defaultTeamId ?? activeTeams[0]?.id ?? "",
      agreedTerms: Boolean(registration?.agreedTermsAt),
      shiftPreference: registration?.shiftPreference ?? undefined,
      transportNeeds: TRANSPORT_LEGS.map((leg) => {
        const existing = registration?.transportNeeds.find((need) => need.leg === leg.key)
        return existing ?? { leg: leg.key, needed: false, pickupPointId: null }
      }),
      wishNote: registration?.wishNote ?? "",
    },
  })

  const [participating, transportNeeds] = useWatch({
    control: form.control,
    name: ["participating", "transportNeeds"],
  })

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="flex min-w-0 flex-col gap-5"
    >
      {!canEdit && (
        <Alert>
          <LockKeyholeIcon />
          <AlertTitle>Đăng ký đang ở chế độ chỉ đọc</AlertTitle>
          <AlertDescription>
            Kỳ đăng ký đã đóng. Liên hệ Ban Tổ chức nếu thông tin của bạn cần được điều chỉnh.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <SectionHeading
            step="01"
            title="Kiểm tra thông tin CBNV"
            description="Dữ liệu được lấy từ danh sách nhân sự của công ty và không sửa trực tiếp tại đây."
          />
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="employee-name">Họ và tên</FieldLabel>
              <Input id="employee-name" value={employee.name} readOnly />
            </Field>
            <Field>
              <FieldLabel htmlFor="employee-email">Email</FieldLabel>
              <Input id="employee-email" value={employee.email} readOnly />
            </Field>
            <Field>
              <FieldLabel htmlFor="employee-code">Mã nhân viên</FieldLabel>
              <Input id="employee-code" value={employee.employeeCode ?? "Chưa cập nhật"} readOnly />
            </Field>
            <Field>
              <FieldLabel htmlFor="employee-location">Địa điểm làm việc</FieldLabel>
              <Input
                id="employee-location"
                value={employee.workLocationName ?? "Chưa cập nhật"}
                readOnly
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <SectionHeading
            step="02"
            title="Xác nhận tham gia"
            description={`Bạn có tham gia ${event.name} không?`}
          />
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="participating"
            render={({ field, fieldState }) => (
              <FieldSet data-invalid={fieldState.invalid}>
                <RadioGroup
                  disabled={!canEdit}
                  value={field.value ? "yes" : "no"}
                  onValueChange={(value) => field.onChange(value === "yes")}
                  aria-invalid={fieldState.invalid}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <Field
                    orientation="horizontal"
                    data-disabled={!canEdit}
                    className="min-h-16 rounded-lg border p-4"
                  >
                    <RadioGroupItem value="yes" id="participating-yes" />
                    <FieldContent>
                      <FieldLabel htmlFor="participating-yes">Có, tôi tham gia</FieldLabel>
                      <FieldDescription>Tiếp tục chọn ca bay và nhu cầu xe.</FieldDescription>
                    </FieldContent>
                  </Field>
                  <Field
                    orientation="horizontal"
                    data-disabled={!canEdit}
                    className="min-h-16 rounded-lg border p-4"
                  >
                    <RadioGroupItem value="no" id="participating-no" />
                    <FieldContent>
                      <FieldLabel htmlFor="participating-no">Không tham gia</FieldLabel>
                      <FieldDescription>BTC vẫn ghi nhận phản hồi của bạn.</FieldDescription>
                    </FieldContent>
                  </Field>
                </RadioGroup>
                <FieldError errors={[fieldState.error]} />
              </FieldSet>
            )}
          />
        </CardContent>
      </Card>

      {participating && (
        <>
          <Card>
            <CardHeader>
              <SectionHeading
                step="03"
                title="Team và ca bay nguyện vọng"
                description="Xác nhận đơn vị tham gia và chọn khung giờ phù hợp với bạn."
              />
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="teamId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Bộ phận/Team</FieldLabel>
                      <Select
                        disabled={!canEdit}
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger aria-invalid={fieldState.invalid}>
                          <SelectValue placeholder="Chọn bộ phận" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {activeTeams.map((team) => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="shiftPreference"
                  render={({ field, fieldState }) => (
                    <FieldSet data-invalid={fieldState.invalid}>
                      <FieldLegend variant="label">Ca bay nguyện vọng</FieldLegend>
                      <FieldDescription>
                        Đây là nguyện vọng đăng ký; BTC phân bổ theo nguồn lực và không cam kết đáp
                        ứng 100%.
                      </FieldDescription>
                      <RadioGroup
                        disabled={!canEdit || Boolean(registration?.shiftLocked)}
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      >
                        <Field orientation="horizontal">
                          <RadioGroupItem value="shift_1" id="shift-1" />
                          <FieldLabel htmlFor="shift-1">Ca 1 (giờ hành chính)</FieldLabel>
                        </Field>
                        <Field orientation="horizontal">
                          <RadioGroupItem value="shift_2" id="shift-2" />
                          <FieldLabel htmlFor="shift-2">Ca 2 (sau 17h00)</FieldLabel>
                        </Field>
                      </RadioGroup>
                      {registration?.shiftLocked && (
                        <FieldDescription className="text-warning">
                          Ban Tổ chức đã khóa ca bay này, không thể thay đổi.
                        </FieldDescription>
                      )}
                      <FieldError errors={[fieldState.error]} />
                    </FieldSet>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionHeading
                step="04"
                title="Nhu cầu xe đưa đón"
                description="Bật những chặng bạn cần BTC sắp xếp xe và chọn điểm đón/trả tương ứng."
              />
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-4 xl:grid-cols-2">
                {TRANSPORT_LEGS.map((leg, index) => {
                  const needed = transportNeeds[index]?.needed ?? false
                  const controlId = "transport-" + leg.key

                  return (
                    <FieldSet key={leg.key} className="rounded-lg border bg-muted/20 p-4">
                      <Controller
                        control={form.control}
                        name={leg.neededName}
                        render={({ field }) => (
                          <Field orientation="horizontal" data-disabled={!canEdit}>
                            <Checkbox
                              id={controlId}
                              disabled={!canEdit}
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                const value = checked === true
                                field.onChange(value)
                                if (!value) form.setValue(leg.pickupName, null)
                              }}
                            />
                            <FieldLabel htmlFor={controlId}>{leg.label}</FieldLabel>
                          </Field>
                        )}
                      />
                      {needed && (
                        <Controller
                          control={form.control}
                          name={leg.pickupName}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Điểm đón/trả</FieldLabel>
                              <Select
                                disabled={!canEdit}
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger aria-invalid={fieldState.invalid}>
                                  <SelectValue placeholder="Chọn điểm đón/trả" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {activePickupPoints.map((point) => (
                                      <SelectItem key={point.id} value={point.id}>
                                        {point.name}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              {activePickupPoints.length === 0 && (
                                <FieldDescription>
                                  Ban Tổ chức chưa cấu hình điểm đón cho kỳ này.
                                </FieldDescription>
                              )}
                              <FieldError errors={[fieldState.error]} />
                            </Field>
                          )}
                        />
                      )}
                    </FieldSet>
                  )
                })}
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionHeading
                step="05"
                title="Mong muốn khác"
                description="Chia sẻ nhu cầu đặc biệt để Ban Tổ chức xem xét và hỗ trợ thủ công."
              />
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="wishNote"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Textarea
                      {...field}
                      disabled={!canEdit}
                      aria-invalid={fieldState.invalid}
                      placeholder="Nhập mong muốn của bạn..."
                      className="min-h-24"
                    />
                    <FieldDescription>Tối đa 1000 ký tự.</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionHeading
                step="06"
                title="Xác nhận quy định"
                description="Đây là bước bắt buộc trước khi gửi đăng ký tham gia."
              />
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="agreedTerms"
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <Checkbox
                      id="agreed-terms"
                      disabled={!canEdit}
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="agreed-terms">
                        Tôi đã đọc và đồng ý với quy định của chương trình, gồm chính sách và phí
                        phạt khi hủy đăng ký không đúng quy định.
                      </FieldLabel>
                      <FieldDescription>
                        {event.settings.terms?.body ?? "Quy định chi tiết do Ban Tổ chức công bố."}
                      </FieldDescription>
                      <FieldError errors={[fieldState.error]} />
                    </FieldContent>
                  </Field>
                )}
              />
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <CardTitle>{registration ? "Lưu thay đổi đăng ký" : "Hoàn tất đăng ký"}</CardTitle>
              <CardDescription>
                {participating
                  ? "Sau khi gửi, hệ thống sẽ lưu thông tin và gửi email xác nhận tới địa chỉ công ty của bạn."
                  : "Phản hồi không tham gia giúp Ban Tổ chức chốt danh sách chính xác."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="justify-end">
          {canEdit ? (
            <Button
              type="submit"
              size="lg"
              className="min-h-11 w-full sm:w-auto"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2Icon data-icon="inline-start" className="animate-spin" />
              )}
              {registration ? "Cập nhật đăng ký" : "Gửi đăng ký"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Thông tin hiện chỉ có thể xem.</p>
          )}
        </CardFooter>
      </Card>
    </form>
  )
}
