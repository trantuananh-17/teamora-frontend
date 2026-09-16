import "server-only"
import { getQueryClient } from "@/lib/get-query-client"
import {
  accommodationsOptions,
  roomRunsOptions,
  vehicleAssignmentsOptions,
  vehicleRunsOptions,
  vehiclesOptions,
} from "../options/logistics.options"
export const prefetchVehicles = (id: string) =>
  Promise.all([
    getQueryClient().prefetchQuery(vehiclesOptions(id)),
    getQueryClient().prefetchQuery(vehicleRunsOptions(id)),
  ])
export const prefetchAccommodations = (id: string) =>
  Promise.all([
    getQueryClient().prefetchQuery(accommodationsOptions(id)),
    getQueryClient().prefetchQuery(roomRunsOptions(id)),
  ])
export const prefetchVehicleAllocation = (id: string, page = 1, pageSize = 25) =>
  Promise.all([
    getQueryClient().prefetchQuery(vehiclesOptions(id)),
    getQueryClient().prefetchQuery(vehicleAssignmentsOptions(id, page, pageSize)),
    getQueryClient().prefetchQuery(vehicleRunsOptions(id)),
  ])
