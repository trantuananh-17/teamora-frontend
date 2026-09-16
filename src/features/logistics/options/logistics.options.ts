import { queryOptions } from "@tanstack/react-query"
import {
  listHotels,
  listRoomAssignments,
  listRoomRuns,
  listRooms,
  listRoomTypes,
  listVehicleAssignments,
  listVehicleRuns,
  listVehicles,
} from "../service/logistics.service"
export const logisticsKeys = { event: (id: string) => ["logistics", id] as const }
export const vehiclesOptions = (id: string) =>
  queryOptions({
    queryKey: [...logisticsKeys.event(id), "vehicles"],
    queryFn: () => listVehicles(id),
  })
export const vehicleRunsOptions = (id: string) =>
  queryOptions({
    queryKey: [...logisticsKeys.event(id), "vehicle-runs"],
    queryFn: () => listVehicleRuns(id),
  })
export const vehicleAssignmentsOptions = (id: string, page = 1, pageSize = 25) =>
  queryOptions({
    queryKey: [...logisticsKeys.event(id), "vehicle-assignments", page, pageSize],
    queryFn: () => listVehicleAssignments(id, page, pageSize),
  })
export const roomRunsOptions = (id: string) =>
  queryOptions({
    queryKey: [...logisticsKeys.event(id), "room-runs"],
    queryFn: () => listRoomRuns(id),
  })
export const accommodationsOptions = (id: string) =>
  queryOptions({
    queryKey: [...logisticsKeys.event(id), "accommodations"],
    queryFn: async () => {
      const [hotels, roomTypes, rooms, assignments] = await Promise.all([
        listHotels(id),
        listRoomTypes(id),
        listRooms(id),
        listRoomAssignments(id),
      ])
      return { hotels, roomTypes, rooms, assignments }
    },
  })
