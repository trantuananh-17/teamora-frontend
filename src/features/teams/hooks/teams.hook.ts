"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { teamsKeys, teamsListOptions } from "../options/teams.options"
import { createTeam, setTeamActive, type CreateTeamInput } from "../service/teams.service"

export function useTeamsSuspense(eventId: string) {
  return useSuspenseQuery(teamsListOptions(eventId))
}

export function useCreateTeam(eventId: string, onCreated?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTeamInput) => createTeam(eventId, input),
    onSuccess: (team) => {
      toast.success("Đã thêm Team", {
        description: team.eventId
          ? `${team.name} — chỉ trong kỳ này`
          : `${team.name} — dùng chung mọi kỳ`,
      })
      queryClient.invalidateQueries({ queryKey: teamsKeys.all() })
      onCreated?.()
    },
    onError: async (error) => {
      toast.error("Không thêm được Team", { description: await errorMessage(error) })
    },
  })
}

export function useSetTeamActive(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ teamId, active }: { teamId: string; active: boolean }) =>
      setTeamActive(eventId, teamId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamsKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không đổi được trạng thái Team", { description: await errorMessage(error) })
    },
  })
}
