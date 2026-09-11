"use client"

import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { myRegistrationOptions, registrationKeys } from "../options/registration.options"
import {
  createOrUpdateRegistration,
  type CreateRegistrationInput,
  type Registration,
} from "../service/registration.service"
import { errorMessage } from "@/lib/api-error"

export function useMyRegistration(eventId: string) {
  return useSuspenseQuery(myRegistrationOptions(eventId))
}

export function useCreateOrUpdateRegistration(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateRegistrationInput) => createOrUpdateRegistration(eventId, input),
    onSuccess: (registration: Registration) => {
      const action = registration.participating ? "Đã đăng ký" : "Đã cập nhật"
      toast.success(action, {
        description: registration.participating
          ? `${registration.team.name} - ${registration.shiftPreference === "shift_1" ? "Ca 1" : registration.shiftPreference === "shift_2" ? "Ca 2" : "Chưa chọn ca"}`
          : "Đã ghi nhận không tham gia",
      })
      queryClient.invalidateQueries({ queryKey: registrationKeys.my(eventId) })
    },
    onError: async (error) => {
      toast.error("Không đăng ký được", {
        description: await errorMessage(error),
      })
    },
  })
}
