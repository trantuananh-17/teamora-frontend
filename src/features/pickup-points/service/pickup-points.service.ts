import { z } from "zod"

import { api } from "@/lib/ky"

export const pickupPointSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  /** Null means the point serves every office — the airport, say (§4.5). */
  workLocationId: z.string().nullable(),
  name: z.string(),
  address: z.string().nullable(),
  active: z.boolean(),
  sortOrder: z.number(),
})

export type PickupPoint = z.infer<typeof pickupPointSchema>

const listSchema = z.object({ items: z.array(pickupPointSchema) })

export async function getPickupPoints(eventId: string): Promise<PickupPoint[]> {
  const response = await api.get(`events/${eventId}/pickup-points`)
  return listSchema.parse(await response.json()).items
}

export interface CreatePickupPointInput {
  name: string
  address?: string | null
  workLocationId?: string | null
}

export async function createPickupPoint(
  eventId: string,
  input: CreatePickupPointInput,
): Promise<PickupPoint> {
  const response = await api.post(`events/${eventId}/pickup-points`, { json: input })
  return pickupPointSchema.parse(await response.json())
}

export async function setPickupPointActive(
  eventId: string,
  pickupPointId: string,
  active: boolean,
): Promise<PickupPoint> {
  const response = await api.patch(`events/${eventId}/pickup-points/${pickupPointId}`, {
    json: { active },
  })
  return pickupPointSchema.parse(await response.json())
}
