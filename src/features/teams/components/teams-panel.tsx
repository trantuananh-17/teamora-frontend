"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { EntityDataTable, EntityEmptyView } from "@/components/entity-components"
import { ActiveBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useCreateTeam, useSetTeamActive, useTeamsSuspense } from "../hooks/teams.hook"
import type { Team } from "../service/teams.service"

function ScopeBadge({ team }: { team: Team }) {
  return team.eventId ? (
    <span className="text-xs text-muted-foreground">Chỉ kỳ này</span>
  ) : (
    <span className="text-xs text-muted-foreground">Dùng chung mọi kỳ</span>
  )
}

function ActiveSwitch({ eventId, team }: { eventId: string; team: Team }) {
  const setActive = useSetTeamActive(eventId)

  // A shared team is reachable from every edition's screen, so the backend
  // refuses to edit one from inside an edition. Showing a switch that always
  // answers 403 would just teach people to ignore error toasts.
  if (!team.eventId) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <Switch
      checked={team.active}
      disabled={setActive.isPending}
      aria-label={`Bật/tắt ${team.name}`}
      onCheckedChange={(active) => setActive.mutate({ teamId: team.id, active })}
    />
  )
}

function buildColumns(eventId: string): ColumnDef<Team>[] {
  return [
    {
      accessorKey: "name",
      header: "Team / Bộ phận",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    { id: "scope", header: "Phạm vi", cell: ({ row }) => <ScopeBadge team={row.original} /> },
    {
      accessorKey: "active",
      header: "Trạng thái",
      meta: { priority: "secondary" },
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      id: "toggle",
      header: "Dùng trên form",
      cell: ({ row }) => <ActiveSwitch eventId={eventId} team={row.original} />,
    },
  ]
}

export function TeamsPanel({ eventId }: { eventId: string }) {
  const { data } = useTeamsSuspense(eventId)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [shared, setShared] = useState(true)

  const create = useCreateTeam(eventId, () => {
    setName("")
    setShared(true)
    setOpen(false)
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setOpen(true)}>
          Thêm Team
        </Button>
      </div>

      <div className="overflow-auto rounded-md border">
        <EntityDataTable
          columns={buildColumns(eventId)}
          data={data}
          emptyView={
            <EntityEmptyView
              title="Chưa có Team nào"
              message="Thêm các bộ phận của công ty. Hầu hết nên là Team dùng chung — chúng tồn tại qua mọi kỳ."
            />
          }
        />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Team</DialogTitle>
            <DialogDescription>
              Tên này phải khớp đúng chính tả với cột “Bộ phận/Team” trong file import CBNV.
            </DialogDescription>
          </DialogHeader>

          <form
            id="create-team"
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              create.mutate({ name, shared })
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="team-name">Tên Team</Label>
              <Input
                id="team-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kinh doanh"
              />
            </div>

            <div className="flex items-start gap-3 rounded-md border p-3">
              <Switch id="team-shared" checked={shared} onCheckedChange={setShared} />
              <div className="flex flex-col gap-1">
                <Label htmlFor="team-shared">Dùng chung mọi kỳ</Label>
                <p className="text-xs text-muted-foreground">
                  {shared
                    ? "Bộ phận thường trực của công ty. Chỉ Team dùng chung mới gán được cho CBNV lúc import."
                    : "Nhóm chỉ tồn tại trong kỳ này — ví dụ một ban tổ chức tạm thời."}
                </p>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" form="create-team" disabled={create.isPending}>
              {create.isPending ? "Đang thêm…" : "Thêm Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
