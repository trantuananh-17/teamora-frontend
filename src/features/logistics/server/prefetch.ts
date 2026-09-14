import "server-only"
import { getQueryClient } from "@/lib/get-query-client"
import {
  accommodationsOptions,
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
  getQueryClient().prefetchQuery(accommodationsOptions(id))
export const prefetchVehicleAllocation = (id: string, page = 1, pageSize = 25) =>
  Promise.all([
    getQueryClient().prefetchQuery(vehiclesOptions(id)),
    getQueryClient().prefetchQuery(vehicleAssignmentsOptions(id, page, pageSize)),
    getQueryClient().prefetchQuery(vehicleRunsOptions(id)),
  ])
