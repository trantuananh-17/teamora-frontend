import { redirect } from "next/navigation"

import { requireOrganizer } from "@/lib/auth"

export default async function RegistrationsAdminPage() {
  await requireOrganizer()
  redirect("/admin")
}
