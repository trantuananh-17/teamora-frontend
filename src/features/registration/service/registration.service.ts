import { z } from "zod"
import { api } from "@/lib/ky"

// §4.5 - Bốn chặng xe
export const transportLegSchema = z.enum([
  "origin_to_airport",
  "airport_to_hotel",
  "hotel_to_airport",
  "airport_to_origin",
])
export type TransportLeg = z.infer<typeof transportLegSchema>

export const shiftSchema = z.enum(["shift_1", "shift_2"])
export type Shift = z.infer<typeof shiftSchema>

// Transport need
export const transportNeedSchema = z.object({
  leg: transportLegSchema,
  needed: z.boolean(),
  pickupPointId: z.string().nullable(),
})
export type TransportNeed = z.infer<typeof transportNeedSchema>

// Registration response
export const registrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  teamId: z.string(),
  participating: z.boolean(),
  agreedTermsAt: z.coerce.date().nullable(),
  termsVersion: z.string().nullable(),
  shiftPreference: shiftSchema.nullable(),
  shiftLocked: z.boolean(),
  isTeamLeader: z.boolean(),
  wishNote: z.string().nullable(),
  submittedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  team: z.object({
    id: z.string(),
    name: z.string(),
  }),
  employeeProfile: z
    .object({
      employeeCode: z.string().nullable(),
      phone: z.string().nullable(),
    })
    .nullable(),
  transportNeeds: z.array(transportNeedSchema),
  /** Only on `registrations/me` — who acts for the team at the Gala (§8.3). */
  teamLeaderName: z.string().nullable().optional(),
})
export type Registration = z.infer<typeof registrationSchema>

// Create/update input
export const createRegistrationInputSchema = z.object({
  participating: z.boolean(),
  teamId: z.string(),
  agreedTerms: z.boolean().optional(),
  shiftPreference: shiftSchema.optional(),
  transportNeeds: z.array(transportNeedSchema).optional(),
  wishNote: z.string().max(1000).optional(),
})
export type CreateRegistrationInput = z.infer<typeof createRegistrationInputSchema>

/**
 * CBNV tạo/cập nhật đăng ký của chính mình. §4
 * Yêu cầu: event.status = registration_open
 */
export async function createOrUpdateRegistration(
  eventId: string,
  input: CreateRegistrationInput,
): Promise<Registration> {
  const response = await api.put(`events/${eventId}/registrations/me`, { json: input })
  return registrationSchema.parse(await response.json())
}

/**
 * CBNV xem đăng ký của chính mình
 */
export async function getMyRegistration(eventId: string): Promise<Registration | null> {
  const response = await api.get(`events/${eventId}/registrations/me`)
  const data = await response.json()
  if (!data) return null
  return registrationSchema.parse(data)
}
