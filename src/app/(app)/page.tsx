import { getCurrentUser } from "@/lib/auth"

export default async function JourneyPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Hành trình của tôi</h1>
      <p className="text-sm text-muted-foreground">
        Xin chào {user?.name || user?.email}. Chuyến bay, xe, phòng và lịch trình sẽ hiện ở đây
        sau khi Ban Tổ chức công bố thông tin.
      </p>
    </div>
  )
}
