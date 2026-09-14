import "server-only"
import { getQueryClient } from "@/lib/get-query-client"
import {
  registrationsListOptions,
  registrationStatsOptions,
} from "../options/registration-admin.options"
import type { ListRegistrationsParams } from "../service/registration-admin.service"

export async function prefetchRegistrationsList(eventId: string, params: ListRegistrationsParams) {
  const queryClient = getQueryClient()
  return queryClient.fetchQuery(registrationsListOptions(eventId, params))
}

export async function prefetchRegistrationStats(eventId: string) {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(registrationStatsOptions(eventId))
}
