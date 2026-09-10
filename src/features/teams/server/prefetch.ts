import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { teamsListOptions } from "../options/teams.options"

export async function prefetchTeams(eventId: string) {
  await getQueryClient().prefetchQuery(teamsListOptions(eventId))
}
