"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { notificationsKeys, notificationsListOptions } from "../options/notifications.options"
import {
  retryNotification,
  type NotificationsQuery,
} from "../service/notifications.service"

export function useNotificationsSuspense(eventId: string, query: NotificationsQuery) {
  return useSuspenseQuery(notificationsListOptions(eventId, query))
}

export function useRetryNotification(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => retryNotification(eventId, id),
    onSuccess: () => {
      toast.success("Đã đưa email vào hàng đợi", {
        description: "Worker sẽ gửi lại trong lần xử lý kế tiếp.",
      })
      queryClient.invalidateQueries({ queryKey: notificationsKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không thể gửi lại email", { description: await errorMessage(error) })
    },
  })
}
