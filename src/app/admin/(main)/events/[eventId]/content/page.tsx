import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { PageHeader } from "@/components/page-header"
import { ContentManager } from "@/features/journey/components/content-manager"
import { prefetchContent } from "@/features/journey/server/prefetch"
import { requireOrganizer } from "@/lib/auth"
import { getQueryClient } from "@/lib/get-query-client"

export const metadata: Metadata = { title: "Lịch trình & nội dung" }

export default async function ContentPage({ params }: { params: Promise<{ eventId: string }> }) {
  await requireOrganizer()
  const { eventId } = await params
  await prefetchContent(eventId)
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader
        title="Lịch trình & nội dung"
        description="Lịch chung theo ngày và thông báo chính thức. CBNV thấy cả hai trong Hành trình sau khi công bố."
      />
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ContentManager eventId={eventId} />
      </HydrationBoundary>
    </div>
  )
}
