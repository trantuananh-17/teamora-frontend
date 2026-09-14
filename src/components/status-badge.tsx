import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * The single place a business state becomes a colour and a Vietnamese label.
 *
 * `.claude/rules/theming.md` requires this to live in one file. Scattering the
 * conditions is how a status ends up amber on one screen and red on the next,
 * and how a label the backend renamed keeps appearing under its old name in the
 * two places nobody remembered to change.
 */

type Tone = "success" | "warning" | "destructive" | "info" | "muted"

const TONE_CLASS: Record<Tone, string> = {
  success: "text-success bg-success/10 border-success/25",
  warning: "text-warning bg-warning/10 border-warning/25",
  destructive: "text-destructive bg-destructive/10 border-destructive/25",
  info: "text-info bg-info/10 border-info/25",
  muted: "text-muted-foreground bg-muted border-border",
}

/**
 * §12. Note that nothing here is `destructive`: an edition simply being early in
 * its life is not a fault, and a screen that is all red because nothing has
 * happened yet is a screen nobody reads.
 */
const EVENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  registration_open: { label: "Đang mở đăng ký", tone: "success" },
  registration_closed: { label: "Đã đóng đăng ký", tone: "muted" },
  allocation_processing: { label: "Đang phân bổ", tone: "info" },
  information_published: { label: "Đã công bố", tone: "success" },
  event_started: { label: "Đang diễn ra", tone: "info" },
  event_completed: { label: "Đã kết thúc", tone: "muted" },
}

export function eventStatusLabel(status: string): string {
  // The backend owns this vocabulary. An unmapped value shows through as itself
  // rather than as "Không rõ", so a status added there is visible here instead
  // of silently rendering as an error state.
  return EVENT_STATUS[status]?.label ?? status
}

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        TONE_CLASS[tone],
      )}
    >
      {children}
    </span>
  )
}

export function EventStatusBadge({ status }: { status: string }) {
  const mapped = EVENT_STATUS[status]
  return <Badge tone={mapped?.tone ?? "muted"}>{mapped?.label ?? status}</Badge>
}

/** Master data rows that can be switched off instead of deleted. */
export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? "success" : "muted"}>{active ? "Đang dùng" : "Đã tắt"}</Badge>
  )
}

const NOTIFICATION_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Đang chờ", tone: "muted" },
  sent: { label: "Đã gửi", tone: "success" },
  failed: { label: "Gửi lỗi", tone: "destructive" },
}

export function NotificationStatusBadge({ status }: { status: string }) {
  const mapped = NOTIFICATION_STATUS[status]
  return <Badge tone={mapped?.tone ?? "muted"}>{mapped?.label ?? status}</Badge>
}

/**
 * Allocator flags (ADR-017). `shift_unmet` is a preference the run could not
 * honour; `shift_locked_unmet` is a real work constraint left without a seat,
 * which the organiser must clear before anything else — so it is red while its
 * sibling is only amber. The tooltip carries the reason so a chip never needs
 * a second column to explain itself.
 */
const ALLOCATION_FLAG: Record<string, { label: string; reason: string; tone: Tone }> = {
  team_split: { label: "Team bị tách", reason: "Team này không cùng một chuyến.", tone: "warning" },
  shift_unmet: { label: "Lệch ca đăng ký", reason: "Không xếp được đúng ca đã đăng ký.", tone: "warning" },
  shift_locked_unmet: { label: "Không xếp được ca bắt buộc", reason: "Ca bắt buộc theo công việc chưa có chỗ.", tone: "destructive" },
  unassigned: { label: "Chưa xếp được", reason: "Hết chỗ ở mọi chuyến phù hợp.", tone: "destructive" },
  over_capacity: { label: "Vượt sức chứa", reason: "Điều chỉnh tay đã vượt sức chứa (§5.5).", tone: "destructive" },
}

export function AllocationFlagBadge({ flag }: { flag: string }) {
  const mapped = ALLOCATION_FLAG[flag]
  if (!mapped) return <Badge tone="muted">{flag}</Badge>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span><Badge tone={mapped.tone}>{mapped.label}</Badge></span>
      </TooltipTrigger>
      <TooltipContent>{mapped.reason}</TooltipContent>
    </Tooltip>
  )
}
