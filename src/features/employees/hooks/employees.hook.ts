"use client"

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiErrorBody, errorMessage } from "@/lib/api-error"
import { employeesKeys, employeesListOptions } from "../options/employees.options"
import {
  importEmployees,
  importErrorDetailsSchema,
  type RowError,
} from "../service/employees.service"

export function useEmployeesSuspense() {
  return useSuspenseQuery(employeesListOptions())
}

export interface ImportFailure {
  message: string
  totalErrors: number
  errors: RowError[]
}

/**
 * A failed import is not a toast. The organiser needs the row numbers in front
 * of them while they fix the spreadsheet, so the per-row errors are returned to
 * the screen and rendered there; only the headline goes in the toast.
 */
async function readImportFailure(error: unknown): Promise<ImportFailure | null> {
  // `apiErrorBody` clones before reading — a consumed body would leave
  // `errorMessage` nothing to quote for a non-row error such as a missing column.
  const body = await apiErrorBody(error)
  const parsed = importErrorDetailsSchema.safeParse(body?.error?.details)
  if (!parsed.success) return null
  return {
    message: body?.error?.message ?? "File có lỗi.",
    totalErrors: parsed.data.totalErrors,
    errors: parsed.data.errors,
  }
}

export function useImportEmployees(onFailure: (failure: ImportFailure | null) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => importEmployees(file),
    onSuccess: (summary) => {
      onFailure(null)
      toast.success("Import xong", {
        description: `${summary.total} dòng — thêm mới ${summary.created}, cập nhật ${summary.updated}.`,
      })
      queryClient.invalidateQueries({ queryKey: employeesKeys.all() })
    },
    onError: async (error) => {
      const failure = await readImportFailure(error)
      onFailure(failure)
      toast.error("Không import được", {
        description: failure?.message ?? (await errorMessage(error)),
      })
    },
  })
}
