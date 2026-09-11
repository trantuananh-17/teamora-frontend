"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  registrationsListOptions,
  registrationStatsOptions,
} from "../options/registration-admin.options"
import {
  bulkSetShiftLocked,
  type ListRegistrationsParams,
  type BulkSetShiftLockedInput,
} from "../service/registration-admin.service"
import { errorMessage } from "@/lib/api-error"
import { registrationKeys } from "../options/registration.options"

export function useRegistrationsList(eventId: string, params: ListRegistrationsParams) {
  return useSuspenseQuery(registrationsListOptions(eventId, params))
}

export function useRegistrationStats(eventId: string) {
  return useSuspenseQuery(registrationStatsOptions(eventId))
}

export function useBulkSetShiftLocked(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BulkSetShiftLockedInput) => bulkSetShiftLocked(eventId, input),
    onSuccess: (result, input) => {
      toast.success("Đã cập nhật", {
        description: `${result.updated} đăng ký đã được ${input.shiftLocked ? "khóa" : "mở khóa"} ca bay`,
      })
      queryClient.invalidateQueries({ queryKey: registrationKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không cập nhật được", {
        description: await errorMessage(error),
      })
    },
  })
}
