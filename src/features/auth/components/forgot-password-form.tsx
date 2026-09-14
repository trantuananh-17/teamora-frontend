"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeftIcon, MailCheckIcon } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRequestPasswordReset } from "../hooks/auth.hook"

const schema = z.object({ email: z.email("Email không đúng định dạng") })
type Values = z.infer<typeof schema>

export function ForgotPasswordForm() {
  const mutation = useRequestPasswordReset()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } })

  if (mutation.isSuccess) {
    return (
      <Card>
        <CardHeader>
          <MailCheckIcon className="size-8 text-success" aria-hidden="true" />
          <CardTitle>Kiểm tra email của bạn</CardTitle>
          <CardDescription>
            Nếu email có trong danh sách nhân sự, Teamora đã gửi một liên kết có hiệu lực trong 60
            phút. Thông báo này giống nhau dù tài khoản có tồn tại hay không.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="lg" className="min-h-11 w-full">
            <Link href="/login">
              <ArrowLeftIcon data-icon="inline-start" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Thiết lập hoặc quên mật khẩu
        </CardTitle>
        <CardDescription>
          Dùng email công ty đã được BTC import. Luồng này dùng được cả lần kích hoạt đầu tiên và
          khi bạn quên mật khẩu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values.email))}
        >
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.email)}>
              <FieldLabel htmlFor="reset-email">Email công ty</FieldLabel>
              <Input
                id="reset-email"
                type="email"
                autoComplete="email"
                placeholder="tenban@congty.vn"
                aria-invalid={Boolean(form.formState.errors.email)}
                {...form.register("email")}
              />
              <FieldDescription>
                Teamora không tiết lộ email này có tài khoản hay chưa.
              </FieldDescription>
              <FieldError errors={[form.formState.errors.email]} />
            </Field>
          </FieldGroup>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Không gửi được hướng dẫn lúc này. Vui lòng thử lại hoặc liên hệ Ban Tổ chức.
            </p>
          )}
          <Button type="submit" size="lg" className="min-h-11 w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Đang gửi…" : "Gửi liên kết thiết lập mật khẩu"}
          </Button>
          <Button asChild variant="ghost" size="lg" className="min-h-11 w-full">
            <Link href="/login">
              <ArrowLeftIcon data-icon="inline-start" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
