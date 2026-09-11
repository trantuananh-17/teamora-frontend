import { queryOptions } from "@tanstack/react-query"
import { getMyRegistration } from "../service/registration.service"

export const registrationKeys = {
  all: () => ["registrations"] as const,
  my: (eventId: string) => [...registrationKeys.all(), "my", eventId] as const,
}

export function myRegistrationOptions(eventId: string) {
  return queryOptions({
    queryKey: registrationKeys.my(eventId),
    queryFn: () => getMyRegistration(eventId),
  })
}
