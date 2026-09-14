import { CalendarClockIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { getCurrentEvent } from "@/features/events/service/events.service"
import { JourneyView } from "@/features/journey/components/journey-view"
import { getJourney } from "@/features/journey/service/journey.service"
import { getMyRegistration } from "@/features/registration/service/registration.service"

export default async function JourneyPage() {
  const event = await getCurrentEvent()

  if (
    event &&
    ["registration_open", "registration_closed", "allocation_processing"].includes(event.status)
  ) {
    redirect("/register")
  }

  if (!event) {
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon />
              </EmptyMedia>
              <EmptyTitle>Chưa có kỳ Team Building hiện hành</EmptyTitle>
              <EmptyDescription>
                Khi Ban Tổ chức tạo kỳ mới, thông tin đăng ký và hành trình của bạn sẽ xuất hiện tại
                đây.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  const registration = await getMyRegistration(event.id)
  if (!registration)
    return (
      <Card className="mx-auto w-full max-w-3xl">
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClockIcon />
              </EmptyMedia>
              <EmptyTitle>Bạn chưa đăng ký kỳ này</EmptyTitle>
              <EmptyDescription>Hành trình chỉ được tạo cho CBNV đã gửi đăng ký.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  return <JourneyView journey={await getJourney(event.id)} />
}
