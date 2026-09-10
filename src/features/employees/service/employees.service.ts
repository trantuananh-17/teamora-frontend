import { z } from "zod"

import { api } from "@/lib/ky"

export const employeeSchema = z.object({
  userId: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string().nullable(),
  employeeCode: z.string().nullable(),
  phone: z.string().nullable(),
  workLocationId: z.string().nullable(),
  defaultTeamId: z.string().nullable(),
  gender: z.string().nullable(),
  active: z.boolean().nullable(),
})

export type Employee = z.infer<typeof employeeSchema>

const listSchema = z.object({ items: z.array(employeeSchema) })

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get("employees")
  return listSchema.parse(await response.json()).items
}

export const importSummarySchema = z.object({
  fileName: z.string(),
  total: z.number(),
  created: z.number(),
  updated: z.number(),
})

export type ImportSummary = z.infer<typeof importSummarySchema>

/**
 * One row error as the backend reports it: the Excel row number, the Vietnamese
 * header, and what to do about it.
 */
export const rowErrorSchema = z.object({
  row: z.number(),
  column: z.string().optional(),
  message: z.string(),
})

export type RowError = z.infer<typeof rowErrorSchema>

export const importErrorDetailsSchema = z.object({
  totalErrors: z.number(),
  errors: z.array(rowErrorSchema),
})

export async function importEmployees(file: File): Promise<ImportSummary> {
  const body = new FormData()
  body.set("file", file)
  // No `json` option and no Content-Type header: the boundary has to be the one
  // FormData generated, and setting the header by hand strips it.
  const response = await api.post("employees/import", { body })
  return importSummarySchema.parse(await response.json())
}
