"use client"

import { useState } from "react"
import { EyeIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from "../constants"
import type { AuditLog } from "../service/audit-logs.service"

export function AuditLogDetails({ entry }: { entry: AuditLog }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button type="button" size="icon-sm" variant="ghost" aria-label="Xem chi tiết thay đổi" onClick={() => setOpen(true)}>
        <EyeIcon />
      </Button>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {AUDIT_ACTION_LABELS[entry.action] ?? entry.action} — {AUDIT_ENTITY_LABELS[entry.entity] ?? entry.entity}
          </DialogTitle>
          <DialogDescription>
            {entry.actorName ?? "Hệ thống"} • {entry.createdAt.toLocaleString("vi-VN")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto sm:grid-cols-2">
          <Snapshot title="Trước thay đổi" value={entry.before} />
          <Snapshot title="Sau thay đổi" value={entry.after} />
          {entry.reason && (
            <div className="flex flex-col gap-1 rounded-lg border bg-muted/30 p-3 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Lý do</span>
              <p className="text-sm whitespace-pre-wrap">{entry.reason}</p>
            </div>
          )}
          <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:col-span-2">
            <span>Entity ID: <span className="font-mono text-foreground">{entry.entityId}</span></span>
            {entry.actorEmail && <span>Actor: {entry.actorEmail}</span>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Snapshot({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-sm font-medium">{title}</span>
      <pre className="min-h-28 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs whitespace-pre-wrap break-all">
        {value === null || value === undefined ? "Không có dữ liệu" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  )
}
