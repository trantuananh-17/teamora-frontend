"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRoundIcon } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useResetPassword } from "../hooks/auth.hook"

const schema = z
  .object({
    password: z.string().min(12, "Mật khẩu cần ít nhất 12 ký tự").max(128),
    confirmation: z.string(),
  })
  .refine((value) => value.password === value.confirmation, {
    path: ["confirmation"],
    message: "Hai mật khẩu chưa khớp",
  })
type Values = z.infer<typeof schema>

export function ResetPasswordForm({ token }: { token?: string }) {
  const mutation = useResetPassword()
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmation: "" },
  })

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <KeyRoundIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          <CardTitle>Liên kết không hợp lệ</CardTitle>
          <CardDescription>
            Liên kết đã thiếu token hoặc không còn sử dụng được. Hãy yêu cầu một email mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="min-h-11 w-full">
            <Link href="/forgot-password">Yêu cầu liên kết mới</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">Tạo mật khẩu mới</CardTitle>
        <CardDescription>
          Mật khẩu phải có ít nhất 12 ký tự. Sau khi hoàn tất, các phiên đăng nhập cũ sẽ bị thu hồi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) =>
            mutation.mutate({ token, newPassword: values.password }),
          )}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.password)}>
              <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.password)}
                {...form.register("password")}
              />
              <FieldDescription>Từ 12 đến 128 ký tự.</FieldDescription>
              <FieldError errors={[form.formState.errors.password]} />
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.confirmation)}>
              <FieldLabel htmlFor="confirm-password">Nhập lại mật khẩu</FieldLabel>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(form.formState.errors.confirmation)}
                {...form.register("confirmation")}
              />
              <FieldError errors={[form.formState.errors.confirmation]} />
            </Field>
          </FieldGroup>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Liên kết không hợp lệ hoặc đã hết hạn. Hãy yêu cầu một email mới.
            </p>
          )}
          <Button type="submit" size="lg" className="min-h-11 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang lưu…" : "Lưu mật khẩu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
