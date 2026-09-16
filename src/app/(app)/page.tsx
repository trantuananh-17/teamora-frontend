import type { Metadata } from "next"

import { NoEventTab } from "@/components/locked-tab"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { OverviewNextStep } from "@/features/journey/components/sections/overview-next-step"
import { getMyRegistration } from "@/features/registration/service/registration.service"
import { requireAuth } from "@/lib/auth"

export const metadata: Metadata = { title: "Tổng quan" }

export default async function OverviewPage() {
  await requireAuth()
  const event = await getCurrentEvent()
  if (!event) return <NoEventTab />
  const registration = await getMyRegistration(event.id)
  return <OverviewNextStep event={event} registration={registration} />
}
