import { parseAsStringLiteral } from "nuqs/server"

import { notificationStatuses } from "./constants"

export const notificationsParams = {
  status: parseAsStringLiteral(notificationStatuses),
}
