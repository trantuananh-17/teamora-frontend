"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { workLocationsKeys, workLocationsListOptions } from "../options/work-locations.options"
import { createWorkLocation, setWorkLocationActive } from "../service/work-locations.service"

export function useWorkLocationsSuspense() {
  return useSuspenseQuery(workLocationsListOptions())
}

export function useCreateWorkLocation(onCreated?: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { name: string }) => createWorkLocation(input),
    onSuccess: (location) => {
      toast.success("Đã thêm địa điểm", { description: location.name })
      queryClient.invalidateQueries({ queryKey: workLocationsKeys.all() })
      onCreated?.()
    },
    onError: async (error) => {
      toast.error("Không thêm được địa điểm", { description: await errorMessage(error) })
    },
  })
}

export function useSetWorkLocationActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setWorkLocationActive(id, active),
    onSuccess: (location) => {
      toast.success(location.active ? "Đã bật lại địa điểm" : "Đã tắt địa điểm", {
        description: location.active
          ? undefined
          : "Địa điểm này không còn hiện trên form đăng ký. CBNV đang gắn với nó vẫn giữ nguyên.",
      })
      queryClient.invalidateQueries({ queryKey: workLocationsKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không đổi được trạng thái", { description: await errorMessage(error) })
    },
  })
}
