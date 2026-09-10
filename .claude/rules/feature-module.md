# Feature Module

Mọi màn hình là một module tự chứa trong `src/features/<name>/`. Đây là convention quan trọng nhất
của repo này — lấy nguyên từ Ragenta (ADR-003). Thêm màn hình mới nghĩa là copy khung này, không
phải phát minh cách sắp xếp mới.

## Khung

```
features/<name>/
├── params.ts                    # nuqs parsers — chỉ khi màn hình có state trên URL
├── service/<name>.service.ts    # ky call + zod schema + z.infer types
├── options/<name>.options.ts    # queryKeys + queryOptions
├── hooks/<name>.hook.ts         # useXxxSuspense / useCreateXxx / useUpdateXxx
├── server/params-loader.ts      # createLoader(params) — đi kèm params.ts
├── server/prefetch.ts           # làm ấm cache của QueryClient phía server
└── components/
    ├── index.ts                 # barrel — chỉ export những gì page import
    ├── <name>-container.tsx     # header + slot toolbar + slot pagination
    ├── <name>-table.tsx         # đọc params → hook suspense → EntityDataTable
    ├── columns.tsx              # ColumnDef<T>[]
    ├── <name>-toolbar.tsx       # ô tìm kiếm debounce, ghi vào URL
    ├── <name>-pagination.tsx
    ├── <name>-states.tsx        # Loading / Empty / Error
    └── <name>-row-actions.tsx
```

Màn hình chi tiết hoặc form (ví dụ `register`) không cần `params.ts`, `columns.tsx`,
`*-table.tsx`, `*-pagination.tsx`. Bốn thư mục còn lại thì luôn có.

## Ba directive rule — sai là vỡ build

| File | Directive | Vì sao |
|---|---|---|
| `options/*.options.ts` | **không có** | Bị import từ cả `prefetch.ts` (server) lẫn `hook.ts` (client). Thêm `"use client"` vào đây là hỏng build |
| `hooks/*.hook.ts` | `"use client"` | Nó gọi `useSuspenseQuery`, `useMutation`, `useRouter` |
| `server/prefetch.ts` | `import "server-only"` | Helper lúc render, **không phải** Server Action. `"use server"` sẽ publish nó thành endpoint RPC |

Đây là lý do `options/` tách khỏi `hooks/` thay vì gộp làm một. Nó không phải sở thích sắp xếp.

## Types sống ở service

Không có `src/types/`. Kiểu sinh ra từ chính zod schema parse response:

```ts
export const flightSchema = z.object({
  id: z.string(),
  code: z.string(),
  direction: z.enum(["outbound", "return"]),
  capacity: z.number(),
  assignedCount: z.number(),
  departAt: z.coerce.date(),
})
export type Flight = z.infer<typeof flightSchema>

export async function getFlights(eventId: string, params: FlightsParams): Promise<FlightsPage> {
  const response = await api.get(`events/${eventId}/flights`, { searchParams: { ... } })
  return flightsPageSchema.parse(await response.json())
}
```

**Zod-parse mọi response.** Backend đổi shape thì lỗi nổ ở đây, kèm đường dẫn field — không phải ở
một component cách đó bốn tầng với `undefined is not an object`.

Kiểu params sinh từ parser: `type FlightsParams = inferParserType<typeof flightsParams>`.

## Query key

Mỗi feature export một object `<name>Keys`, phân cấp, `all()` đứng đầu để một lần
`invalidateQueries` dọn sạch cả feature. **`eventId` luôn là đoạn scope đầu tiên** — cùng lý do
backend luôn scope theo `eventId` (ADR-004).

```ts
export const flightsKeys = {
  all: () => ["flights"] as const,
  list: (eventId: string, params: FlightsParams) =>
    [...flightsKeys.all(), "list", eventId, params] as const,
  detail: (eventId: string, flightId: string) =>
    [...flightsKeys.all(), "detail", eventId, flightId] as const,
}
```

Thiếu `eventId` trong key nghĩa là chuyển kỳ vẫn thấy dữ liệu kỳ cũ trong cache.

## Page chuẩn

```tsx
export default async function FlightsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireOrganizer()

  const params = await flightsParamsLoader(searchParams)
  await prefetchFlights(params)

  return (
    <FlightsContainer>
      <HydrationBoundary state={dehydrate(getQueryClient())}>
        <ErrorBoundary fallback={<FlightsError />}>
          <Suspense fallback={<FlightsLoading />}>
            <FlightsTable />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </FlightsContainer>
  )
}
```

Container nằm **ngoài** boundary: header, toolbar và pagination hiện ngay, chỉ bảng mới suspend.

Prefetch phía server làm ấm cache, `HydrationBoundary` chuyển nó sang client, và
`useSuspenseQuery` phía client trúng **đúng query key đó** — nên nó render ngay, không gọi API lần hai.

## Mutation

```ts
export function useUpdateFlightAssignment(eventId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAssignmentInput) => updateAssignment(eventId, input),
    onSuccess: (result) => {
      toast.success("Đã chuyển chuyến", {
        description: result.warning ?? `${result.flightCode} — còn ${result.remaining} chỗ`,
      })
      queryClient.invalidateQueries({ queryKey: flightsKeys.all() })
    },
    onError: async (error) => {
      toast.error("Không chuyển được", { description: await errorMessage(error) })
    },
  })
}
```

`onError` là `async` vì `errorMessage` phải đọc body của response để lấy `error.message` mà backend
gửi. Cảnh báo vượt sức chứa (§5.5) đến trong `result`, **không phải** trong `onError` — nó không
phải lỗi.

## Thêm một màn hình

1. Copy một feature gần giống nhất, đổi tên. Đừng dựng từ đầu.
2. Viết `service/` trước: schema zod và hàm gọi ky.
3. `options/` — key + queryOptions.
4. `hooks/` — hook suspense và mutation.
5. `params.ts` + `server/params-loader.ts` nếu có state trên URL.
6. `server/prefetch.ts`.
7. `components/`, export qua `index.ts`.
8. Page dưới `app/(app)/` hoặc `app/admin/(main)/`, gate ở dòng đầu.
9. Một mục trong sidebar tương ứng.

## Trước khi kết thúc

- Ba directive đúng chỗ chưa?
- Response đã zod-parse chưa?
- Query key có `eventId` chưa?
- Page có gate ở **dòng đầu tiên** chưa?
- Bảng có `ColumnMeta.priority` để bỏ cột ở màn hẹp chưa (§13 responsive)?
- Có Loading / Empty / Error đủ ba trạng thái chưa?
