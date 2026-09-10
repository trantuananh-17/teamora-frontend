import { Suspense } from "react"
import type { Metadata } from "next"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { ErrorBoundary } from "react-error-boundary"

import { EntityStateView, EntityTableSkeleton } from "@/components/entity-components"
import { EmployeesContainer, EmployeesTable } from "@/features/employees/components"
import { prefetchEmployees } from "@/features/employees/server/prefetch"
import { getQueryClient } from "@/lib/get-query-client"
import { requireOrganizer } from "@/lib/auth"

export const metadata: Metadata = { title: "Cán bộ nhân viên" }

export default async function EmployeesPage() {
  await requireOrganizer()
  await prefetchEmployees()

  return (
    <EmployeesContainer>
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<EntityStateView title="Không tải được danh sách CBNV" />}>
          <Suspense fallback={<EntityTableSkeleton columns={5} />}>
            <EmployeesTable />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </EmployeesContainer>
  )
}
