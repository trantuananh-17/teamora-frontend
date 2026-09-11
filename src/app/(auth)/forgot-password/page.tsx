import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/features/auth/components"
import { requireUnAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Thiết lập mật khẩu" }

export default async function ForgotPasswordPage() {
  await requireUnAuth()
  return <ForgotPasswordForm />
}
