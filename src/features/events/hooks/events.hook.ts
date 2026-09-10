"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { eventDetailOptions, eventsKeys, eventsListOptions } from "../options/events.options"
import {
  advanceEventStatus,
  createEvent,
  revertEventStatus,
  type CreateEventInput,
  type EventStatus,
} from "../service/events.service"

export function useEventsSuspense() {
  return useSuspenseQuery(eventsListOptions())
}

export function useEventSuspense(eventId: string) {
  return useSuspenseQuery(eventDetailOptions(eventId))
}

export function useCreateEvent(onCreated?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: (event) => {
      toast.success("Đã tạo kỳ", { description: `${event.name} (${event.code})` })
      queryClient.invalidateQueries({ queryKey: eventsKeys.all() })
      onCreated?.()
    },
    // `async` because the message is in the response body — the backend's own
    // words beat "Request failed with status code 409".
    onError: async (error) => {
      toast.error("Không tạo được kỳ", { description: await errorMessage(error) })
    },
  })
}

export function useAdvanceEventStatus(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (status: EventStatus) => advanceEventStatus(eventId, status),
    onSuccess: () => {
      toast.success("Đã chuyển trạng thái kỳ")
      queryClient.invalidateQueries({ queryKey: eventsKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không chuyển được trạng thái", { description: await errorMessage(error) })
    },
  })
}

export function useRevertEventStatus(eventId: string, onDone?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ status, reason }: { status: EventStatus; reason: string }) =>
      revertEventStatus(eventId, status, reason),
    onSuccess: () => {
      toast.success("Đã lùi trạng thái kỳ", {
        description: "Thao tác này đã được ghi vào nhật ký.",
      })
      queryClient.invalidateQueries({ queryKey: eventsKeys.all() })
      onDone?.()
    },
    onError: async (error) => {
      toast.error("Không lùi được trạng thái", { description: await errorMessage(error) })
    },
  })
}
