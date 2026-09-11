import type { Metadata } from "next"

import { ResetPasswordForm } from "@/features/auth/components"

export const metadata: Metadata = { title: "Tạo mật khẩu mới" }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  return <ResetPasswordForm token={token} />
}
