import "server-only"

import { getQueryClient } from "@/lib/get-query-client"
import { employeesListOptions } from "../options/employees.options"

export async function prefetchEmployees() {
  await getQueryClient().prefetchQuery(employeesListOptions())
}
