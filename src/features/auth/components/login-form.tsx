"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { useLogin } from "../hooks/auth.hook"

/**
 * There is no "create an account" link and no password field to confirm:
 * accounts come from the organisers' employee import (ADR-016). Someone without
 * one has to be added by the BTC, which the copy below says plainly rather than
 * leaving them hunting for a sign-up button that does not exist.
 */
export function LoginForm() {
  const redirectTo = useSearchParams().get("redirect")
  const login = useLogin(redirectTo)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Chào mừng bạn trở lại
        </CardTitle>
        <CardDescription>
          Đăng nhập bằng email công ty để xem đăng ký và hành trình của bạn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            login.mutate({ email, password })
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email công ty</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tenban@congty.vn"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </FieldGroup>

          <Button type="submit" size="lg" className="min-h-11 w-full" disabled={login.isPending}>
            {login.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
          <Button asChild variant="link" className="min-h-11 w-full">
            <Link href="/forgot-password">Thiết lập lần đầu hoặc quên mật khẩu</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
