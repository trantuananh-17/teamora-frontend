import { queryOptions } from "@tanstack/react-query"

import { getEmployees } from "../service/employees.service"

export const employeesKeys = {
  all: () => ["employees"] as const,
  list: () => [...employeesKeys.all(), "list"] as const,
}

export const employeesListOptions = () =>
  queryOptions({ queryKey: employeesKeys.list(), queryFn: getEmployees })
