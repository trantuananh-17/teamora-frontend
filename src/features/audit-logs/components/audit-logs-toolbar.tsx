"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { EntitySearch } from "@/components/entity-components"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_LABELS } from "../constants"
import type { AuditLogsQuery } from "../service/audit-logs.service"

export function AuditLogsToolbar({ query, filters }: { query: AuditLogsQuery; filters: { entities: string[]; actions: string[] } }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function replace(key: "search" | "entity" | "action", value?: string) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete("page")
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`)
  }

  const hasFilters = Boolean(query.search || query.entity || query.action)

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(16rem,1fr)_13rem_13rem_auto]">
      <EntitySearch value={query.search ?? ""} onChange={(value) => replace("search", value || undefined)} placeholder="Tìm người thao tác, ID hoặc lý do..." />
      <Select value={query.entity ?? "all"} onValueChange={(value) => replace("entity", value === "all" ? undefined : value)}>
        <SelectTrigger aria-label="Lọc theo đối tượng"><SelectValue placeholder="Tất cả đối tượng" /></SelectTrigger>
        <SelectContent><SelectGroup><SelectItem value="all">Tất cả đối tượng</SelectItem>{filters.entities.map((value) => <SelectItem key={value} value={value}>{AUDIT_ENTITY_LABELS[value] ?? value}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <Select value={query.action ?? "all"} onValueChange={(value) => replace("action", value === "all" ? undefined : value)}>
        <SelectTrigger aria-label="Lọc theo hành động"><SelectValue placeholder="Tất cả hành động" /></SelectTrigger>
        <SelectContent><SelectGroup><SelectItem value="all">Tất cả hành động</SelectItem>{filters.actions.map((value) => <SelectItem key={value} value={value}>{AUDIT_ACTION_LABELS[value] ?? value}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
      <Button type="button" variant="outline" disabled={!hasFilters} onClick={() => router.replace(pathname)}>Xóa lọc</Button>
    </div>
  )
}
