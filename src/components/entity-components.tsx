"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { ChevronLeftIcon, ChevronRightIcon, InboxIcon, PlusIcon, SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { cn } from "@/lib/utils"

/**
 * The scaffolding every list screen is built from, copied from Ragenta
 * (`components/entity-components.tsx`). A feature supplies its columns, its
 * toolbar and its query hook; the shape of the page comes from here, so a dozen
 * screens look and behave like one product.
 *
 * Two changes from the original: the content widths are inlined rather than
 * imported from `detail-shell`, which has no consumer here yet, and the default
 * copy is Vietnamese.
 */

const CONTENT_WIDTHS = {
  full: "",
  wide: "max-w-7xl",
  medium: "max-w-5xl",
  narrow: "max-w-2xl",
} as const

type ContentWidth = keyof typeof CONTENT_WIDTHS

declare module "@tanstack/react-table" {
  // Both parameters go unused here, but they are part of `ColumnMeta`'s own
  // signature and declaration merging requires the identical list.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * How hard this column fights for horizontal room.
     *
     * §13 has employees looking this up on a phone. A table that only scrolls
     * sideways hides its own columns behind a gesture nobody performs; naming
     * the ones that can wait lets the narrow layout drop them instead.
     * `secondary` comes back at `md`, `tertiary` at `lg`. Leave it unset on the
     * column that identifies the row and on the actions — those never drop.
     */
    priority?: "secondary" | "tertiary"
  }
}

const COLUMN_PRIORITY = {
  secondary: "hidden md:table-cell",
  tertiary: "hidden lg:table-cell",
} as const

type EntityHeaderProps = {
  title: string
  description?: string
  newButtonLabel?: string
  disabled?: boolean
  actions?: React.ReactNode
} & (
  | { onNew: () => void; newButtonHref?: never }
  | { newButtonHref: string; onNew?: never }
  | { onNew?: never; newButtonHref?: never }
)

export function EntityHeader({
  title,
  description,
  onNew,
  newButtonHref,
  newButtonLabel = "Thêm mới",
  disabled,
  actions,
}: EntityHeaderProps) {
  return (
    <PageHeader
      title={title}
      description={description}
      actions={
        <>
          {actions}
          {onNew && (
            <Button size="sm" disabled={disabled} onClick={onNew}>
              <PlusIcon className="size-4" />
              {newButtonLabel}
            </Button>
          )}
          {newButtonHref && (
            <Button size="sm" asChild>
              <Link href={newButtonHref} prefetch>
                <PlusIcon className="size-4" />
                {newButtonLabel}
              </Link>
            </Button>
          )}
        </>
      }
    />
  )
}

interface EntityContainerProps {
  header?: React.ReactNode
  stats?: React.ReactNode
  search?: React.ReactNode
  actions?: React.ReactNode
  pagination?: React.ReactNode
  width?: ContentWidth
  children: React.ReactNode
}

export function EntityContainer({
  header,
  stats,
  search,
  actions,
  pagination,
  width = "wide",
  children,
}: EntityContainerProps) {
  return (
    <div className="flex flex-col pb-2">
      <div className={cn("mx-auto flex w-full flex-col gap-6", CONTENT_WIDTHS[width])}>
        {header && <div className="shrink-0">{header}</div>}
        {stats && <div className="shrink-0">{stats}</div>}
        {search && <div className="shrink-0">{search}</div>}
        {actions && <div className="shrink-0">{actions}</div>}
        <div className="flex min-h-64 flex-col overflow-hidden rounded-md border bg-background">
          {children}
        </div>
        {pagination && <div className="shrink-0">{pagination}</div>}
      </div>
    </div>
  )
}

export function EntityPagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const first = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const last = Math.min(safePage * pageSize, total)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Hiển thị {first}–{last} trong tổng số {total}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Số dòng</span>
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
          <SelectTrigger className="w-20" aria-label="Số dòng mỗi trang">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <span className="min-w-24 text-center text-sm tabular-nums">
          Trang {safePage}/{pageCount}
        </span>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Trang trước"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Trang sau"
          disabled={safePage >= pageCount}
          onClick={() => onPageChange(safePage + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  )
}

export function EntityUrlPagination({
  total,
  page,
  pageSize,
}: {
  total: number
  page: number
  pageSize: number
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  function replace(changes: { page?: number; pageSize?: number }) {
    const next = new URLSearchParams(searchParams.toString())
    if (changes.page === undefined || changes.page === 1) next.delete("page")
    else next.set("page", String(changes.page))
    if (changes.pageSize !== undefined) next.set("pageSize", String(changes.pageSize))
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`)
  }

  return (
    <EntityPagination
      total={total}
      page={page}
      pageSize={pageSize}
      onPageChange={(nextPage) => replace({ page: nextPage })}
      onPageSizeChange={(nextPageSize) => replace({ page: 1, pageSize: nextPageSize })}
    />
  )
}

interface EntitySearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function EntitySearch({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className,
}: EntitySearchProps) {
  const [localValue, setLocalValue] = useState(value)
  const [lastExternalValue, setLastExternalValue] = useState(value)
  const debouncedValue = useDebouncedValue(localValue, 400)

  // Keeps the box in step when the URL changes from somewhere else — a cleared
  // filter, the back button — rather than from typing here. Adjusted during
  // render rather than in an effect: an effect would paint the stale value first
  // and then correct it.
  if (value !== lastExternalValue) {
    setLastExternalValue(value)
    setLocalValue(value)
  }

  useEffect(() => {
    if (debouncedValue !== value) onChange(debouncedValue)
    // `onChange` is a new closure on every render of the caller; depending on it
    // would re-run this effect continuously.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue])

  return (
    <div className={cn("relative w-full", className)}>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        className="bg-background pl-9"
        value={localValue}
        onChange={(event) => setLocalValue(event.target.value)}
      />
    </div>
  )
}

interface EntityStateViewProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  content?: React.ReactNode
}

export function EntityStateView({
  icon,
  title = "Đang tải",
  message,
  content,
}: EntityStateViewProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Empty className="border border-dashed bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon">{icon ?? <InboxIcon />}</EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {message && <EmptyDescription>{message}</EmptyDescription>}
        </EmptyHeader>
        {content && <EmptyContent>{content}</EmptyContent>}
      </Empty>
    </div>
  )
}

interface EntityEmptyViewProps extends EntityStateViewProps {
  onNew?: () => void
  newLabel?: string
  disabled?: boolean
}

export function EntityEmptyView({
  onNew,
  newLabel = "Thêm mới",
  disabled,
  ...props
}: EntityEmptyViewProps) {
  return (
    <EntityStateView
      {...props}
      content={
        onNew && (
          <Button size="sm" onClick={onNew} disabled={disabled}>
            <PlusIcon className="size-4" />
            {newLabel}
          </Button>
        )
      }
    />
  )
}

interface EntityDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyView?: React.ReactNode
  /** With filters applied, "no results" is the honest message — not "nothing exists". */
  hasFilters?: boolean
  noResultsText?: string
  onRowClick?: (row: TData) => void
  stickyHeader?: boolean
}

export function EntityDataTable<TData, TValue>({
  columns,
  data,
  emptyView,
  hasFilters = false,
  noResultsText = "Không có kết quả. Thử đổi bộ lọc.",
  onRowClick,
  stickyHeader = true,
}: EntityDataTableProps<TData, TValue>) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  if (data.length === 0) {
    if (emptyView && !hasFilters) return <div className="flex-1">{emptyView}</div>
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">{noResultsText}</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-background")}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const priority = header.column.columnDef.meta?.priority
              return (
                <TableHead key={header.id} className={priority && COLUMN_PRIORITY[priority]}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
          >
            {row.getVisibleCells().map((cell) => {
              const priority = cell.column.columnDef.meta?.priority
              return (
                <TableCell key={cell.id} className={priority && COLUMN_PRIORITY[priority]}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * A list's loading state, shaped like the table that replaces it. A centred
 * spinner tells you only that something is happening and then reflows the page
 * when the rows land.
 */
export function EntityTableSkeleton({ columns, rows = 8 }: { columns: number; rows?: number }) {
  const columnClass = (column: number) =>
    column < 2 ? undefined : column < 4 ? COLUMN_PRIORITY.secondary : COLUMN_PRIORITY.tertiary

  return (
    <Table aria-busy>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, column) => (
            <TableHead key={column} className={columnClass(column)}>
              <Skeleton className="h-3.5 w-20" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, row) => (
          <TableRow key={row}>
            {Array.from({ length: columns }).map((_, column) => (
              <TableCell key={column} className={columnClass(column)}>
                <Skeleton className={cn("h-4", column === 0 ? "w-40" : "w-24")} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
