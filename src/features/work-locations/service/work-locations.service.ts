import { z } from "zod"

import { api } from "@/lib/ky"

export const workLocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  sortOrder: z.number(),
})

export type WorkLocation = z.infer<typeof workLocationSchema>

const listSchema = z.object({ items: z.array(workLocationSchema) })

export async function getWorkLocations(): Promise<WorkLocation[]> {
  const response = await api.get("work-locations")
  return listSchema.parse(await response.json()).items
}

export async function createWorkLocation(input: { name: string }): Promise<WorkLocation> {
  const response = await api.post("work-locations", { json: input })
  return workLocationSchema.parse(await response.json())
}

/**
 * There is no delete. `employee_profile.workLocationId` is a restrict foreign
 * key, so an office anybody has ever been assigned to cannot be removed —
 * switching it off is what takes it out of the registration form.
 */
export async function setWorkLocationActive(id: string, active: boolean): Promise<WorkLocation> {
  const response = await api.patch(`work-locations/${id}`, { json: { active } })
  return workLocationSchema.parse(await response.json())
}
