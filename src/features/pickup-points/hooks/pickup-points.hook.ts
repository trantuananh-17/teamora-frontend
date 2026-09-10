"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { pickupPointsKeys, pickupPointsListOptions } from "../options/pickup-points.options"
import {
  createPickupPoint,
  setPickupPointActive,
  type CreatePickupPointInput,
} from "../service/pickup-points.service"

export function usePickupPointsSuspense(eventId: string) {
  return useSuspenseQuery(pickupPointsListOptions(eventId))
}

export function useCreatePickupPoint(eventId: string, onCreated?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePickupPointInput) => createPickupPoint(eventId, input),
    onSuccess: (point) => {
      toast.success("Đã thêm điểm đón", { description: point.name })
      queryClient.invalidateQueries({ queryKey: pickupPointsKeys.all() })
      onCreated?.()
    },
    onError: async (error) => {
      toast.error("Không thêm được điểm đón", { description: await errorMessage(error) })
    },
  })
}

export function useSetPickupPointActive(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ pickupPointId, active }: { pickupPointId: string; active: boolean }) =>
      setPickupPointActive(eventId, pickupPointId, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pickupPointsKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không đổi được trạng thái", { description: await errorMessage(error) })
    },
  })
}
