"use client"
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { errorMessage } from "@/lib/api-error"
import {
  accommodationsOptions,
  logisticsKeys,
  roomRunsOptions,
  vehicleAssignmentsOptions,
  vehicleRunsOptions,
  vehiclesOptions,
} from "../options/logistics.options"
import * as service from "../service/logistics.service"
export const useVehicles = (id: string) => useSuspenseQuery(vehiclesOptions(id))
export const useVehicleRuns = (id: string) => useSuspenseQuery(vehicleRunsOptions(id))
export const useVehicleAssignments = (id: string, page = 1, pageSize = 25) =>
  useSuspenseQuery(vehicleAssignmentsOptions(id, page, pageSize))
export const useAccommodations = (id: string) => useSuspenseQuery(accommodationsOptions(id))
export const useRoomRuns = (id: string) => useSuspenseQuery(roomRunsOptions(id))
function useLogisticsMutation<T>(
  eventId: string,
  fn: (input: T) => Promise<unknown>,
  success: string,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      toast.success(success)
      await client.invalidateQueries({ queryKey: logisticsKeys.event(eventId) })
    },
    onError: async (error) =>
      toast.error("Không thực hiện được", { description: await errorMessage(error) }),
  })
}
export const useCreateVehicle = (id: string) =>
  useLogisticsMutation<service.VehicleInput>(id, (x) => service.createVehicle(id, x), "Đã thêm xe")
export const useUpdateVehicle = (eventId: string, id: string) =>
  useLogisticsMutation<service.VehicleInput>(
    eventId,
    (x) => service.updateVehicle(eventId, id, x),
    "Đã cập nhật xe",
  )
export const useDeleteVehicle = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.deleteVehicle(id, x), "Đã xóa xe")
export const usePreviewVehicles = (id: string) =>
  useLogisticsMutation<void>(id, () => service.previewVehicles(id), "Đã tạo preview phân xe")
export const useCommitVehicles = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.commitVehicleRun(id, x), "Đã commit phân xe")
export const useDiscardVehicles = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.discardVehicleRun(id, x), "Đã bỏ preview")
export const useManualAssignVehicle = (id: string) =>
  useLogisticsMutation<{ registrationId: string; vehicleId: string }>(
    id,
    (x) => service.manualAssignVehicle(id, x.registrationId, x.vehicleId),
    "Đã điều chỉnh xe",
  )
export const useSetVehicleLock = (id: string) =>
  useLogisticsMutation<{ assignmentId: string; locked: boolean }>(
    id,
    (x) => service.setVehicleAssignmentLock(id, x.assignmentId, x.locked),
    "Đã cập nhật khóa",
  )
export const useCreateHotel = (id: string) =>
  useLogisticsMutation<{ name: string; address: string }>(
    id,
    (x) => service.createHotel(id, x),
    "Đã thêm khách sạn",
  )
export const useUpdateHotel = (eventId: string, id: string) =>
  useLogisticsMutation<{ name: string; address: string }>(
    eventId,
    (x) => service.updateHotel(eventId, id, x),
    "Đã cập nhật khách sạn",
  )
export const useDeleteHotel = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.deleteHotel(id, x), "Đã xóa khách sạn")
export const useCreateRoomType = (id: string) =>
  useLogisticsMutation<{ hotelId: string; name: string; capacity: number }>(
    id,
    (x) => service.createRoomType(id, x.hotelId, x),
    "Đã thêm loại phòng",
  )
export const useUpdateRoomType = (eventId: string, id: string) =>
  useLogisticsMutation<{ name: string; capacity: number }>(
    eventId,
    (x) => service.updateRoomType(eventId, id, x),
    "Đã cập nhật loại phòng",
  )
export const useDeleteRoomType = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.deleteRoomType(id, x), "Đã xóa loại phòng")
export const useCreateRoom = (id: string) =>
  useLogisticsMutation<{ hotelId: string; roomTypeId: string; code: string; capacity: number }>(
    id,
    (x) => service.createRoom(id, x.hotelId, x),
    "Đã thêm phòng",
  )
export const useUpdateRoom = (eventId: string, id: string) =>
  useLogisticsMutation<{ roomTypeId: string; code: string; capacity: number }>(
    eventId,
    (x) => service.updateRoom(eventId, id, x),
    "Đã cập nhật phòng",
  )
export const useDeleteRoom = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.deleteRoom(id, x), "Đã xóa phòng")
export const usePreviewRooms = (id: string) =>
  useLogisticsMutation<void>(id, () => service.previewRooms(id), "Đã tạo phương án phân phòng")
export const useCommitRooms = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.commitRoomRun(id, x), "Đã commit phân phòng")
export const useDiscardRooms = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.discardRoomRun(id, x), "Đã hủy phương án")
export const useImportRoomAssignments = (id: string) =>
  useLogisticsMutation<File>(
    id,
    (x) => service.importRoomAssignments(id, x),
    "Đã import phân phòng",
  )
export const useManualAssignRoom = (id: string) =>
  useLogisticsMutation<{ registrationIds: string[]; roomId: string; reason: string }>(
    id,
    (x) => service.manualAssignRoom(id, x),
    "Đã xếp phòng",
  )
export const useUnassignRoom = (id: string) =>
  useLogisticsMutation<string>(id, (x) => service.unassignRoom(id, x), "Đã bỏ khỏi phòng")
export const useSetRoomAssignmentLock = (id: string) =>
  useLogisticsMutation<{ assignmentId: string; locked: boolean }>(
    id,
    (x) => service.setRoomAssignmentLock(id, x.assignmentId, x.locked),
    "Đã cập nhật khóa",
  )
