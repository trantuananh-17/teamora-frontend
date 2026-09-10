# teamora-frontend

Next.js App Router. Một app, hai shell: `app/(app)/` cho CBNV, `app/admin/(main)/` cho BTC
(ADR-011). Không sở hữu dữ liệu nghiệp vụ nào — mọi thứ đến từ `teamora-backend` qua proxy Hono.

Context cấp workspace nằm ở `../CLAUDE.md` và `../.claude/docs/`.

## Commands

```powershell
pnpm dev          # next dev --port 3000
pnpm build        # next build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit   ← CHẠY SAU build, xem bên dưới
pnpm start        # next start
```

## Skill vendor

`.claude/skills/shadcn/` lấy nguyên văn từ Ragenta (gốc: shadcn/ui). Không sửa tại chỗ — cần hướng
dẫn khác thì viết vào `teamora-ui` bên cạnh.

## Kiến trúc

```
Trình duyệt ──cookie session──► Next.js server ──chuyển tiếp cookie──► teamora-backend
                                 ├─ RSC: gate + prefetch
                                 └─ Hono proxy tại /api/*
```

Trình duyệt **không bao giờ** gọi thẳng backend. Nó chỉ giữ cookie httpOnly; Next.js server chuyển
tiếp cookie đó. Không có JWT nào phải mint, không có token cache nào phải giữ đúng.

## Feature module

Mọi màn hình là một module tự chứa trong `src/features/<name>/`. Cấu trúc bắt buộc và ba directive
rule nằm ở `.claude/rules/feature-module.md`. Đọc nó trước khi tạo màn hình đầu tiên.

## Gate

- `app/(app)/layout.tsx` gọi `requireAuth()` **một lần** cho cả subtree, rồi phát `EventProvider`
  (kỳ hiện hành + registration của caller) xuống dưới.
- `app/admin/layout.tsx` là **shell thuần, không gate**. **Mỗi page trong `admin/` gọi
  `await requireOrganizer()` ở dòng đầu tiên.**

Không có `middleware.ts`. Gate ở layout/page chạy trên server, thấy session thật, và không phải
duy trì thêm một bộ matcher nữa.

Tất cả những thứ trên **chỉ là UX**. Backend kiểm tra lại mọi request (ADR-006).

## Ba thứ hỏng âm thầm nếu làm sai

- **Import tĩnh `next/headers` trong `lib/server-fetch.ts`.** File này bị ky client import, mà ky
  client lại bị client component import. Phải `await import("next/headers")` **bên trong hàm**.
  Import tĩnh làm hỏng build với một thông báo không chỉ về đây.
- **`getQueryClient()` không bọc `cache()` ở phía server.** Nó được gọi hai lần mỗi lần render
  server (prefetch, rồi `dehydrate`). Không memo thì hydration state rỗng và **mọi màn hình gọi API
  hai lần** — không lỗi, chỉ chậm gấp đôi. Nhưng singleton cấp module thì rò dữ liệu người này sang
  trang người khác. Đúng là `cache(makeQueryClient)` cho server, biến module cho browser.
- **CI chạy `typecheck` trước `build`.** `next build` sinh `next-env.d.ts` và `.next/types/**`, và
  `tsconfig.json` include chúng. Đảo thứ tự thì typecheck hỏng hoặc bỏ sót lỗi thật.

## Những chỗ dễ sai ở đây

- **Zod-parse mọi response ở ranh giới service.** Backend đổi shape thì lỗi phải nổ ở đúng chỗ,
  không phải ở một component cách đó bốn tầng với `undefined is not an object`.
- **`options/*.options.ts` không có directive.** Nó bị import từ cả server (`prefetch.ts`) lẫn
  client (`hook.ts`). Thêm `"use client"` vào đó là hỏng build.
- **`server/prefetch.ts` dùng `import "server-only"`, không phải `"use server"`.** Nó là helper lúc
  render, không phải Server Action — `"use server"` sẽ publish nó thành một endpoint RPC.
- **Không có Server Action nào trong repo này.** Mutation đi qua `useMutation` → service → ky.
- **URL là nguồn sự thật cho state danh sách** (nuqs). Nó cũng chính là query key — đó là lý do ô
  tìm kiếm phải debounce.
- **Không hard-code nhãn trạng thái kỳ hay tên chặng.** Chúng đến từ backend; ánh xạ sang tiếng
  Việt ở một file duy nhất.
- **Không tự suy quyền từ role.** Hỏi backend hoặc đọc từ `EventProvider`. Đặc biệt: đừng đoán CBNV
  có được sửa đăng ký không — điều đó phụ thuộc `event.status`, không phụ thuộc role.
- **Màn hình My Journey phải chịu được dữ liệu thiếu.** Trước khi công bố, hoặc khi BTC chưa phân
  xong xe, nhiều mảnh sẽ rỗng. Render "sẽ cập nhật", không render khung trống hay lỗi.
- **Hành động không hồi phục được thì phải confirm**, và câu confirm nói **điều gì sẽ xảy ra** chứ
  không hỏi "bạn có chắc không". "Công bố thông tin sẽ gửi email cho 412 CBNV" hữu ích hơn nhiều.
- **Không dùng class Tailwind palette thô.** Mọi màu là token — xem `.claude/rules/theming.md`.
- **Responsive là yêu cầu nghiệp vụ (§13).** CBNV tra cứu bằng điện thoại ở sân bay. Bảng admin
  dùng `ColumnMeta.priority` để **bỏ bớt cột** ở màn hẹp, không cuộn ngang.
