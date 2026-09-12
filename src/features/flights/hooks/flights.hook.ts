"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { errorMessage } from "@/lib/api-error"
import { allocationRunsOptions, flightAssignmentsOptions, flightsKeys, flightsListOptions } from "../options/flights.options"
import {
  commitAllocation, createFlight, deleteFlight, discardAllocation, importFlights,
  manualAssignFlight, previewAllocation, setAssignmentLock, updateFlight,
  type FlightFilters, type FlightInput, type PageParams,
} from "../service/flights.service"

export const useFlights = (eventId: string, filters: FlightFilters = {}, pagination?: PageParams) =>
  useSuspenseQuery(flightsListOptions(eventId, filters, pagination))
export const useFlightAssignments = (eventId: string, pagination?: PageParams) =>
  useSuspenseQuery(flightAssignmentsOptions(eventId, pagination))
export const useAllocationRuns = (eventId: string) => useSuspenseQuery(allocationRunsOptions(eventId))

function useFlightMutation<T>(eventId: string, mutationFn: (input: T) => Promise<unknown>, success: string, onDone?: () => void) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      toast.success(success)
      await client.invalidateQueries({ queryKey: flightsKeys.event(eventId) })
      onDone?.()
    },
    onError: async (error) => toast.error("Không thực hiện được", { description: await errorMessage(error) }),
  })
}

export const useCreateFlight = (eventId: string, onDone?: () => void) =>
  useFlightMutation<FlightInput>(eventId, (input) => createFlight(eventId, input), "Đã thêm chuyến bay", onDone)
export const useUpdateFlight = (eventId: string, flightId: string, onDone?: () => void) =>
  useFlightMutation<FlightInput>(eventId, (input) => updateFlight(eventId, flightId, input), "Đã cập nhật chuyến bay", onDone)
export const useDeleteFlight = (eventId: string) =>
  useFlightMutation<string>(eventId, (id) => deleteFlight(eventId, id), "Đã xóa chuyến bay")
export const useImportFlights = (eventId: string) =>
  useFlightMutation<File>(eventId, (file) => importFlights(eventId, file), "Đã import danh sách chuyến bay")
export const usePreviewAllocation = (eventId: string) =>
  useFlightMutation<void>(eventId, () => previewAllocation(eventId), "Đã tạo phương án preview")
export const useCommitAllocation = (eventId: string) =>
  useFlightMutation<string>(eventId, (id) => commitAllocation(eventId, id), "Đã áp dụng phương án phân chuyến")
export const useDiscardAllocation = (eventId: string) =>
  useFlightMutation<string>(eventId, (id) => discardAllocation(eventId, id), "Đã bỏ phương án preview")
export function useManualAssignFlight(eventId: string, onDone?: () => void) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: { registrationIds?: string[]; teamId?: string; flightId: string; reason: string }) =>
      manualAssignFlight(eventId, input),
    onSuccess: async (result) => {
      if (result.warnings.length > 0) {
        toast.warning("Đã điều chỉnh, có cảnh báo", { description: result.warnings.join(" ") })
      } else {
        toast.success("Đã điều chỉnh chuyến bay")
      }
      await client.invalidateQueries({ queryKey: flightsKeys.event(eventId) })
      onDone?.()
    },
    onError: async (error) => toast.error("Không điều chỉnh được", { description: await errorMessage(error) }),
  })
}
export const useSetAssignmentLock = (eventId: string) =>
  useFlightMutation<{ assignmentId: string; locked: boolean }>(eventId, ({ assignmentId, locked }) => setAssignmentLock(eventId, assignmentId, locked, "Khóa để giữ nguyên khi chạy lại phân bổ"), "Đã cập nhật khóa phân bổ")
