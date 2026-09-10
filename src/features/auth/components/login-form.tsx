"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      <CardHeader>
        <CardTitle>Đăng nhập Teamora</CardTitle>
        <CardDescription>
          Dùng email công ty của bạn. Chưa có tài khoản thì liên hệ Ban Tổ chức.
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Đang đăng nhập…" : "Đăng nhập"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
