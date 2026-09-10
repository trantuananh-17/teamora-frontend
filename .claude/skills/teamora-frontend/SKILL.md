---
name: teamora-frontend
description: Làm việc trong teamora-frontend — Next.js App Router, feature module, TanStack Query, nuqs, ky, proxy Hono, gate phía server. Dùng khi thêm hoặc sửa màn hình, luồng lấy dữ liệu, form, điều hướng, hoặc khi cần biết một feature phải được tổ chức thế nào.
---

# teamora-frontend

Khung feature module và ba directive rule nằm ở `.claude/rules/feature-module.md`.
Màu và thang kích thước nằm ở `.claude/rules/theming.md`. Chỗ dễ sai nằm ở `CLAUDE.md` của repo.
Skill này là thủ tục cho những việc lặp lại.

## Tầng lấy dữ liệu

```
component ─► hooks/*.hook.ts ─► options/*.options.ts ─► service/*.service.ts ─► ky ─► proxy ─► backend
```

Không có Server Action. Không `fetch()` trong component. Không gọi backend từ trình duyệt.

`ky` chạy hai chế độ: trên browser gọi `/api/v1` (đi qua proxy); trên server gọi thẳng
`${TEAMORA_API_URL}/v1` và tự đính cookie đã chuyển tiếp. Một client, hai đường — cùng cách Ragenta làm.

## Gate

| Chỗ | Gọi gì | Ở đâu |
|---|---|---|
| `app/(app)/layout.tsx` | `requireAuth()` | Một lần cho cả subtree CBNV |
| `app/(app)/**/page.tsx` | *(không gate lại)* | Layout đã lo; page chỉ đọc `EventProvider` |
| `app/admin/layout.tsx` | *(không gate)* | Shell thuần |
| `app/admin/(main)/**/page.tsx` | `await requireOrganizer()` | **Dòng đầu tiên của mọi page** |

Hai kiểu khác nhau là chủ ý: shell CBNV cần dữ liệu chung (kỳ hiện hành, registration) nên gate một
lần rồi phát xuống; admin không có gì chung nên mỗi page tự lo, và quên một page thì thấy ngay.

Tất cả **chỉ là UX**. Backend kiểm tra lại mọi request (ADR-006). Đừng dựa vào nó để giữ bí mật gì.

## `event.status` chi phối màn hình CBNV

Đừng suy quyền từ role. Hỏi trạng thái kỳ:

| `event.status` | `(app)` hiển thị gì |
|---|---|
| `registration_open` | Form đăng ký, sửa được |
| `registration_closed`, `allocation_processing` | Đăng ký ở chế độ chỉ đọc + thông báo "BTC đang phân bổ" |
| `information_published` trở đi | My Journey đầy đủ |

`app/(app)/page.tsx` redirect theo bảng này. Logic ánh xạ nằm **một chỗ**, không lặp ở từng màn hình.

Backend đã không trả dữ liệu phân bổ trước khi công bố — nên frontend không cần giấu, chỉ cần render
đúng trạng thái rỗng.

## My Journey phải chịu được dữ liệu thiếu

Đây là màn hình đặc biệt nhất: một endpoint (`GET /v1/events/:eventId/me/journey`) trả nguyên cụm,
và **nhiều mảnh sẽ rỗng** — BTC phân xong chuyến bay nhưng chưa phân xe, chưa import phòng, Gala là
Phase 2.

Mỗi mảnh render một trong ba trạng thái: **có dữ liệu** · **"BTC sẽ cập nhật"** · **"không áp dụng"**
(người không đăng ký xe chặng đó). Không bao giờ render khung trống, không bao giờ ném lỗi vì
thiếu một mảnh.

Đừng gọi sáu API rồi ghép ở client. Một endpoint là hiện thân của Single Source of Truth (§13).

## Form

`react-hook-form` + `zodResolver` + `register`. Không có component `<Form>`/`<FormField>` bọc.
Lỗi validate render nội dòng; lỗi từ server đi vào `toast` qua `onError` của mutation.

Ba chỗ riêng của Teamora:

- **Form đăng ký (§4)** có field auto-fill từ `employee_profile` — họ tên, email, mã NV, Team, địa
  điểm. Chúng **read-only**, không phải disabled: disabled không gửi lên và không đọc được bằng
  trình đọc màn hình.
- **Ô tick quy định (§4.3)** chặn Submit. Dùng `zodResolver` với `z.literal(true)`, đừng disable nút
  bằng state riêng — người dùng phải thấy được **vì sao** chưa submit được.
- **Chọn ca (§4.4)** phải có dòng chữ "đây là nguyện vọng đăng ký, BTC phân bổ theo nguồn lực,
  không cam kết đáp ứng 100%" ngay cạnh. Đây là yêu cầu nghiệp vụ viết bằng chữ, không phải gợi ý
  thiết kế.

## Bảng admin

`@tanstack/react-table`, chỉ core row model. Lọc, sắp xếp và phân trang **chạy ở server** qua URL —
không dùng plugin filter của thư viện.

```tsx
// columns.tsx — bỏ cột ở màn hẹp thay vì cuộn ngang
{ accessorKey: "phone", header: "Điện thoại", meta: { priority: "tertiary" } }
```

`secondary` ẩn dưới `md`, `tertiary` ẩn dưới `lg`. Skeleton phải bỏ đúng những cột đó — bộ khung
hiện sáu cột rồi bảng thật hiện hai là một cú nhảy layout.

## Hành động không hồi phục được

Confirm, và câu confirm nói **điều gì sẽ xảy ra**:

- ✅ "Công bố thông tin sẽ gửi email cho 412 CBNV và mở My Journey cho tất cả."
- ✅ "Commit phương án này sẽ ghi đè 380 phân bổ tự động. 12 phân bổ đã chỉnh tay được giữ nguyên."
- ❌ "Bạn có chắc không?"

Danh sách cần confirm ở Teamora: công bố thông tin · commit allocation · chuyển trạng thái kỳ ·
import ghi đè · xóa chuyến bay còn người ngồi · gửi lại email hàng loạt.

## Thêm một màn hình

Chín bước ở `.claude/rules/feature-module.md`. Bốn câu hay bị bỏ qua:

- Màn hình này thuộc `(app)` hay `admin/`? Gate tương ứng là gì?
- Nó có state trên URL không? Có thì cần `params.ts` + `params-loader.ts`.
- Nó có ba trạng thái Loading / Empty / Error chưa?
- Nó hiện đúng ở màn 375px chưa?

## Trước khi kết thúc

- `pnpm build` rồi `pnpm typecheck` — **đúng thứ tự đó**.
- Ba directive rule đúng chỗ chưa?
- Page có gate ở dòng đầu chưa?
- Response đã zod-parse chưa? Query key có `eventId` chưa?
- Có class Tailwind palette thô nào lọt vào không?
- Thử ở màn hẹp: có cuộn ngang chỗ nào không?
