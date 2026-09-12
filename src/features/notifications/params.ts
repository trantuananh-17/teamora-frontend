import { parseAsInteger, parseAsStringLiteral } from "nuqs/server"

import { notificationStatuses } from "./constants"

export const notificationsParams = {
  status: parseAsStringLiteral(notificationStatuses),
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(25),
}
