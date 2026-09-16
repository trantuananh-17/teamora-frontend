import { cn } from "@/lib/utils"

/** Journey (`transport_leg`) vocabulary → Vietnamese, in one place. */
export const legLabels: Record<string, string> = {
  origin_to_airport: "Nơi ở → sân bay",
  airport_to_hotel: "Sân bay → khách sạn",
  hotel_to_airport: "Khách sạn → sân bay",
  airport_to_origin: "Sân bay → nơi ở",
}
/** §4.5 — legs render in journey order, never in table order. */
export const legOrder = Object.keys(legLabels)

export const shiftLabel = (shift: string | null) =>
  shift === "shift_1" ? "Ca 1" : shift === "shift_2" ? "Ca 2" : "Không ca"

export const time = (value: Date) =>
  new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(value)

export const clock = (value: Date) =>
  new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(value)

export const NOT_PARTICIPATING = "Bạn đã đăng ký không tham gia kỳ này nên không có phân bổ cá nhân."

/** "BTC sẽ cập nhật" — the not-yet state. Not an error, so no warning tone. */
export function EmptyLine({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn("rounded-md border border-dashed p-4 text-sm text-muted-foreground", className)}
    >
      {children}
    </p>
  )
}
