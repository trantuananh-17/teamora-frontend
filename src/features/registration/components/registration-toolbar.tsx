"use client"

import { DownloadIcon, LockIcon, UnlockIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { EntitySearch } from "@/components/entity-components"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Team } from "../service/master-data.service"
import {
  registrationExportUrl,
  type ListRegistrationsParams,
} from "../service/registration-admin.service"
import { useBulkSetShiftLocked } from "../hooks/registration-admin.hook"

export function RegistrationToolbar({
  eventId,
  teams,
  params,
}: {
  eventId: string
  teams: Team[]
  params: ListRegistrationsParams
}) {
  const router = useRouter()
  const pathname = usePathname()
  const current = useSearchParams()
  const bulk = useBulkSetShiftLocked(eventId)

  function setParam(name: string, value: string) {
    const next = new URLSearchParams(current.toString())
    if (value && value !== "all") next.set(name, value)
    else next.delete(name)
    next.delete("page")
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`)
  }

  const bulkFilter = {
    teamIds: params.teamId ? [params.teamId] : undefined,
    participating: params.participating,
    shiftPreference: params.shiftPreference,
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <EntitySearch
          value={params.search ?? ""}
          onChange={(value) => setParam("search", value)}
          placeholder="Tìm tên, email, mã NV..."
          className="col-span-2 md:col-span-1"
        />
        <Select value={params.teamId ?? "all"} onValueChange={(value) => setParam("teamId", value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả Team</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={params.participating === undefined ? "all" : String(params.participating)}
          onValueChange={(value) => setParam("participating", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trạng thái tham gia" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả phản hồi</SelectItem>
              <SelectItem value="true">Tham gia</SelectItem>
              <SelectItem value="false">Không tham gia</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          value={params.shiftPreference ?? "all"}
          onValueChange={(value) => setParam("shiftPreference", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả ca" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Tất cả ca</SelectItem>
              <SelectItem value="shift_1">Ca 1</SelectItem>
              <SelectItem value="shift_2">Ca 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={bulk.isPending}
          onClick={() => bulk.mutate({ ...bulkFilter, shiftLocked: false })}
        >
          <UnlockIcon data-icon="inline-start" />
          Mở khóa ca theo bộ lọc
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={bulk.isPending}
          onClick={() => bulk.mutate({ ...bulkFilter, shiftLocked: true })}
        >
          <LockIcon data-icon="inline-start" />
          Khóa ca theo bộ lọc
        </Button>
        <Button asChild>
          <a href={registrationExportUrl(eventId, params)}>
            <DownloadIcon data-icon="inline-start" />
            Xuất CSV
          </a>
        </Button>
      </div>
    </div>
  )
}
