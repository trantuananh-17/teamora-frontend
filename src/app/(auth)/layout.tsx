import { BedDoubleIcon, BusFrontIcon, MapPinnedIcon, PlaneTakeoffIcon, RouteIcon } from "lucide-react"

/** The signed-out shell: public brand surface on the left, secure entry on the right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh bg-muted/30 lg:grid-cols-[minmax(0,1.05fr)_minmax(28rem,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-primary-foreground/15">
            <RouteIcon className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-xl font-semibold tracking-tight">Teamora</span>
            <span className="text-sm text-primary-foreground/75">Cổng thông tin Team Building</span>
          </div>
        </div>

        <div className="flex max-w-xl flex-col gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-primary-foreground/75">MỘT NƠI DUY NHẤT</span>
            <h1 className="text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
              Từ lúc đăng ký đến khi bắt đầu hành trình.
            </h1>
            <p className="max-w-lg text-base leading-7 text-primary-foreground/80">
              Teamora giúp mỗi CBNV theo dõi thông tin chính thức từ Ban Tổ chức mà không phải tìm
              lại trong nhiều email và bảng tính.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: PlaneTakeoffIcon, label: "Chuyến bay" },
              { icon: BusFrontIcon, label: "Xe đưa đón" },
              { icon: BedDoubleIcon, label: "Khách sạn & phòng" },
              { icon: MapPinnedIcon, label: "Lịch trình cá nhân" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-20 items-center gap-3 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 p-4"
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-primary-foreground/70">
          Nguồn thông tin nội bộ chính thức từ Ban Tổ chức
        </p>
      </section>

      <section className="flex flex-col p-4 sm:p-6 lg:p-10">
        <div className="flex items-center gap-2 lg:hidden">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <RouteIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-tight">Teamora</span>
            <span className="text-xs text-muted-foreground">Cổng thông tin nội bộ</span>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Chỉ sử dụng tài khoản công ty đã được Ban Tổ chức cấp
        </p>
      </section>
    </div>
  )
}
