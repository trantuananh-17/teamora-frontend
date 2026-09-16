"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useChangePassword } from "../hooks/employees.hook"

const schema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z.string().min(12, "Mật khẩu cần ít nhất 12 ký tự").max(128),
    confirmation: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmation, {
    path: ["confirmation"],
    message: "Hai mật khẩu chưa khớp",
  })
type Values = z.infer<typeof schema>

export function ChangePasswordForm() {
  const mutation = useChangePassword()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmation: "" },
  })
  const errors = form.formState.errors

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Mật khẩu mới phải có ít nhất 12 ký tự. Các phiên đăng nhập khác sẽ bị thu hồi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            mutation.mutate(
              { currentPassword: values.currentPassword, newPassword: values.newPassword },
              { onSuccess: () => form.reset() },
            ),
          )}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(errors.currentPassword)}>
              <FieldLabel htmlFor="current-password">Mật khẩu hiện tại</FieldLabel>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.currentPassword)}
                {...form.register("currentPassword")}
              />
              <FieldError errors={[errors.currentPassword]} />
            </Field>
            <Field data-invalid={Boolean(errors.newPassword)}>
              <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.newPassword)}
                {...form.register("newPassword")}
              />
              <FieldDescription>Từ 12 đến 128 ký tự.</FieldDescription>
              <FieldError errors={[errors.newPassword]} />
            </Field>
            <Field data-invalid={Boolean(errors.confirmation)}>
              <FieldLabel htmlFor="confirm-password">Nhập lại mật khẩu mới</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmation)}
                {...form.register("confirmation")}
              />
              <FieldError errors={[errors.confirmation]} />
            </Field>
          </FieldGroup>
          <Button type="submit" className="min-h-11 sm:self-start" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu…" : "Lưu mật khẩu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
