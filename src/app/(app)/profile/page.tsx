import type { Metadata } from "next"

import { ChangePasswordForm, ProfileCard } from "@/features/employees/components"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Hồ sơ" }

export default async function ProfilePage() {
  await requireAuth()
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <ProfileCard />
      <ChangePasswordForm />
    </div>
  )
}
