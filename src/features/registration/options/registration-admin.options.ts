import { queryOptions } from "@tanstack/react-query"
import {
  listRegistrations,
  getRegistrationStats,
  type ListRegistrationsParams,
} from "../service/registration-admin.service"
import { registrationKeys } from "./registration.options"

export const registrationsAdminKeys = {
  ...registrationKeys,
  list: (eventId: string, params: ListRegistrationsParams) =>
    [...registrationKeys.all(), "list", eventId, params] as const,
  stats: (eventId: string) => [...registrationKeys.all(), "stats", eventId] as const,
}

export function registrationsListOptions(eventId: string, params: ListRegistrationsParams) {
  return queryOptions({
    queryKey: registrationsAdminKeys.list(eventId, params),
    queryFn: () => listRegistrations(eventId, params),
  })
}

export function registrationStatsOptions(eventId: string) {
  return queryOptions({
    queryKey: registrationsAdminKeys.stats(eventId),
    queryFn: () => getRegistrationStats(eventId),
  })
}
