import "server-only"
import { getQueryClient } from "@/lib/get-query-client"
import { myRegistrationOptions } from "../options/registration.options"

export async function prefetchMyRegistration(eventId: string) {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(myRegistrationOptions(eventId))
}
