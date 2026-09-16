"use client"

import { cn } from "@/lib/utils"

export type SeatMapStatus = "available" | "taken" | "mine" | "unavailable"

export interface SeatMapTable {
  id: string
  name: string
  gridCol: number
  gridRow: number
}

export interface SeatMapSeat {
  id: string
  tableId: string
  seatNo: number
  status: SeatMapStatus
  /** Held but not yet confirmed — drawn with a dashed border. */
  held?: boolean
  /** Native tooltip, e.g. the team holding the seat. */
  title?: string
}

const CELL = 160
const TABLE_R = 34
const ORBIT_R = 58
const SEAT_R = 12

// Another team's seat is `chart-2` (violet): far from `primary` teal, so "mine"
// and "taken" never read as shades of one colour, and far from destructive red.
const SEAT_FILL: Record<SeatMapStatus, string> = {
  available: "fill-muted stroke-border",
  mine: "fill-primary stroke-primary",
  taken: "fill-chart-2 stroke-chart-2",
  unavailable: "fill-destructive/40 stroke-destructive/40",
}
const SEAT_HELD_FILL: Record<SeatMapStatus, string> = {
  ...SEAT_FILL,
  mine: "fill-primary/30 stroke-primary",
  taken: "fill-chart-2/30 stroke-chart-2",
}
const SEAT_TEXT: Record<SeatMapStatus, string> = {
  available: "fill-muted-foreground",
  mine: "fill-primary-foreground",
  taken: "fill-primary-foreground",
  unavailable: "fill-foreground",
}

const LEGEND: { label: string; className: string }[] = [
  { label: "Trống", className: "bg-muted border-border" },
  { label: "Team mình", className: "bg-primary border-primary" },
  { label: "Team khác", className: "bg-chart-2 border-chart-2" },
  { label: "Không dùng", className: "bg-destructive/40 border-destructive/40" },
  { label: "Đang giữ", className: "border-dashed border-foreground" },
]

/**
 * Pure SVG floor plan (S7-SPEC §A4): one `<g>` per table on a fixed grid, seats
 * on a ring by `seatNo`. No canvas library, no drag — the organiser types
 * `gridCol`/`gridRow`.
 */
export function SeatMap({
  tables,
  seats,
  selectable,
  selectedIds,
  onToggleSeat,
  className,
}: {
  tables: SeatMapTable[]
  seats: SeatMapSeat[]
  selectable?: (seat: SeatMapSeat) => boolean
  selectedIds?: ReadonlySet<string>
  onToggleSeat?: (seat: SeatMapSeat) => void
  className?: string
}) {
  const width = (Math.max(0, ...tables.map((table) => table.gridCol)) + 1) * CELL
  const height = (Math.max(0, ...tables.map((table) => table.gridRow)) + 1) * CELL
  const seatsByTable = new Map<string, SeatMapSeat[]>()
  for (const seat of seats) {
    const list = seatsByTable.get(seat.tableId) ?? []
    list.push(seat)
    seatsByTable.set(seat.tableId, list)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="overflow-x-auto rounded-lg border bg-card">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="block"
          role="img"
          aria-label="Sơ đồ bàn Gala Dinner"
        >
          {tables.map((table) => {
            const cx = table.gridCol * CELL + CELL / 2
            const cy = table.gridRow * CELL + CELL / 2
            const tableSeats = (seatsByTable.get(table.id) ?? []).sort(
              (a, b) => a.seatNo - b.seatNo,
            )
            return (
              <g key={table.id}>
                <circle cx={cx} cy={cy} r={TABLE_R} className="fill-background stroke-border" />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={600}
                  className="fill-foreground"
                >
                  {table.name}
                </text>
                {tableSeats.map((seat, index) => {
                  const angle = -Math.PI / 2 + (index / tableSeats.length) * Math.PI * 2
                  const sx = cx + Math.cos(angle) * ORBIT_R
                  const sy = cy + Math.sin(angle) * ORBIT_R
                  const clickable = Boolean(onToggleSeat && (selectable?.(seat) ?? true))
                  const selected = selectedIds?.has(seat.id) ?? false
                  const fill = (seat.held ? SEAT_HELD_FILL : SEAT_FILL)[seat.status]
                  return (
                    <g
                      key={seat.id}
                      role={clickable ? "button" : undefined}
                      tabIndex={clickable ? 0 : undefined}
                      aria-label={`${table.name} ghế ${seat.seatNo}`}
                      className={cn(
                        clickable && "cursor-pointer outline-none focus-visible:opacity-80",
                      )}
                      onClick={clickable ? () => onToggleSeat?.(seat) : undefined}
                      onKeyDown={
                        clickable
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault()
                                onToggleSeat?.(seat)
                              }
                            }
                          : undefined
                      }
                    >
                      {seat.title && <title>{seat.title}</title>}
                      <circle
                        cx={sx}
                        cy={sy}
                        r={SEAT_R}
                        strokeWidth={selected ? 3 : 1.5}
                        strokeDasharray={seat.held ? "3 2" : undefined}
                        className={cn(fill, selected && "stroke-primary")}
                      />
                      <text
                        x={sx}
                        y={sy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={10}
                        className={cn("pointer-events-none select-none", SEAT_TEXT[seat.status])}
                      >
                        {seat.seatNo}
                      </text>
                    </g>
                  )
                })}
              </g>
            )
          })}
        </svg>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded-full border", item.className)} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
