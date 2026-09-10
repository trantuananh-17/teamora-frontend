import { cn } from "@/lib/utils"

/**
 * One number and what it means. Deliberately not a chart: §10's dashboard
 * numbers are counts an organiser reads and acts on, and a sparkline beside a
 * count of people who have not registered says nothing a number does not.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-lg border bg-card p-4", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  )
}
