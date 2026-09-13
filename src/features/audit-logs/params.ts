import { parseAsInteger, parseAsString } from "nuqs/server"

export const auditLogsParams = {
  search: parseAsString,
  entity: parseAsString,
  action: parseAsString,
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(25),
}
