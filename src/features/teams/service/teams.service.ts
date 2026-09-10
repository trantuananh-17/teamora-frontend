import { z } from "zod"

import { api } from "@/lib/ky"

export const teamSchema = z.object({
  id: z.string(),
  /** Null means the team is shared by every edition. */
  eventId: z.string().nullable(),
  name: z.string(),
  active: z.boolean(),
  sortOrder: z.number(),
})

export type Team = z.infer<typeof teamSchema>

const listSchema = z.object({ items: z.array(teamSchema) })

/** Returns this edition's teams **and** the shared ones — what a form must show. */
export async function getTeams(eventId: string): Promise<Team[]> {
  const response = await api.get(`events/${eventId}/teams`)
  return listSchema.parse(await response.json()).items
}

export interface CreateTeamInput {
  name: string
  shared: boolean
}

export async function createTeam(eventId: string, input: CreateTeamInput): Promise<Team> {
  const response = await api.post(`events/${eventId}/teams`, { json: input })
  return teamSchema.parse(await response.json())
}

/**
 * Only an edition-scoped team can be edited from inside an edition. The backend
 * refuses a shared one with 403, because it belongs to every edition and
 * renaming it here would change what the others show.
 */
export async function setTeamActive(
  eventId: string,
  teamId: string,
  active: boolean,
): Promise<Team> {
  const response = await api.patch(`events/${eventId}/teams/${teamId}`, { json: { active } })
  return teamSchema.parse(await response.json())
}
