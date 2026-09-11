import { z } from "zod"
import { api } from "@/lib/ky"

export const teamSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventId: z.string().nullable(),
  active: z.boolean(),
})
export type Team = z.infer<typeof teamSchema>
const teamsPageSchema = z.object({ items: z.array(teamSchema) })

export const pickupPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().nullable(),
  workLocationId: z.string().nullable(),
  active: z.boolean(),
})
export type PickupPoint = z.infer<typeof pickupPointSchema>
const pickupPointsPageSchema = z.object({ items: z.array(pickupPointSchema) })

export async function getTeams(eventId: string): Promise<Team[]> {
  const response = await api.get(`events/${eventId}/teams`)
  return teamsPageSchema.parse(await response.json()).items
}

export async function getPickupPoints(eventId: string): Promise<PickupPoint[]> {
  const response = await api.get(`events/${eventId}/pickup-points`)
  return pickupPointsPageSchema.parse(await response.json()).items
}
