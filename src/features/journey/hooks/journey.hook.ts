"use client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { errorMessage } from "@/lib/api-error"
import { contentOptions, dashboardOptions, journeyKeys } from "../options/journey.options"
import * as service from "../service/journey.service"

export const useDashboard = (id: string) => useSuspenseQuery(dashboardOptions(id))
export const useContent = (id: string) => useSuspenseQuery(contentOptions(id))
function useJourneyMutation<T>(eventId: string, fn: (input: T) => Promise<unknown>, message: string) {
  const client = useQueryClient(); return useMutation({ mutationFn: fn, onSuccess: async () => { toast.success(message); await client.invalidateQueries({ queryKey: journeyKeys.event(eventId) }) }, onError: async (error) => toast.error("Không thực hiện được", { description: await errorMessage(error) }) })
}
export const useCreateSchedule = (id: string) => useJourneyMutation<service.ScheduleInput>(id, (x) => service.createSchedule(id, x), "Đã thêm lịch trình")
export const useUpdateSchedule = (eventId: string, id: string) => useJourneyMutation<Partial<service.ScheduleInput>>(eventId, (x) => service.updateSchedule(eventId, id, x), "Đã cập nhật lịch trình")
export const useDeleteSchedule = (id: string) => useJourneyMutation<string>(id, (x) => service.deleteSchedule(id, x), "Đã xóa lịch trình")
export const useCreateAnnouncement = (id: string) => useJourneyMutation<service.AnnouncementInput>(id, (x) => service.createAnnouncement(id, x), "Đã thêm thông báo")
export const useUpdateAnnouncement = (eventId: string, id: string) => useJourneyMutation<Partial<service.AnnouncementInput>>(eventId, (x) => service.updateAnnouncement(eventId, id, x), "Đã cập nhật thông báo")
export const useDeleteAnnouncement = (id: string) => useJourneyMutation<string>(id, (x) => service.deleteAnnouncement(id, x), "Đã xóa thông báo")
