"use client"

import { useRef, useState } from "react"
import { UploadIcon } from "lucide-react"

import { EntityContainer, EntityHeader } from "@/components/entity-components"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useImportEmployees, type ImportFailure } from "../hooks/employees.hook"

/**
 * Import is all-or-nothing on the backend, and this screen says so both before
 * the upload and after a rejection — otherwise an organiser reading "3 lỗi"
 * reasonably assumes the other rows went in.
 */
export function EmployeesContainer({ children }: { children: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [failure, setFailure] = useState<ImportFailure | null>(null)
  const importEmployees = useImportEmployees(setFailure)

  return (
    <EntityContainer
      header={
        <EntityHeader
          title="Cán bộ nhân viên"
          description="Danh sách nhân sự dùng chung mọi kỳ. Tài khoản đăng nhập sinh ra từ đây, không phải từ form đăng ký."
          actions={
            <Button
              size="sm"
              disabled={importEmployees.isPending}
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon className="size-4" />
              {importEmployees.isPending ? "Đang import…" : "Import Excel"}
            </Button>
          }
        />
      }
      actions={
        failure && (
          <Alert variant="destructive">
            <AlertTitle>{failure.message}</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <ul className="flex flex-col gap-1">
                  {failure.errors.map((error, index) => (
                    <li key={`${error.row}-${index}`} className="text-sm">
                      <span className="font-medium">Dòng {error.row}</span>
                      {error.column && <span className="text-muted-foreground"> · {error.column}</span>}
                      {" — "}
                      {error.message}
                    </li>
                  ))}
                </ul>
                {failure.totalErrors > failure.errors.length && (
                  <p className="text-sm">
                    …và {failure.totalErrors - failure.errors.length} lỗi khác. Sửa những lỗi trên
                    trước rồi import lại.
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) importEmployees.mutate(file)
          // Cleared so choosing the same file again still fires a change event —
          // which is exactly what someone does after fixing it.
          event.target.value = ""
        }}
      />
      {children}
    </EntityContainer>
  )
}
