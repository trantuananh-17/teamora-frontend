# Theming

Tailwind v4, **không có `tailwind.config.ts`**. Mọi thứ khai báo trong `src/app/globals.css`.
shadcn/ui style `radix-nova`, baseColor `neutral`, `cssVariables: true`.

**Màu nhấn của Teamora là teal, hue 195** (chốt 2026-09-11). Nó cách xa cả ba hue trạng thái —
`success` 163, `warning` 65, `info` 245 — nên một nút chính không bao giờ đọc nhầm thành trạng
thái. Đó cũng là lý do không dùng cam: hue 40 nằm giữa `warning` và `destructive`, và hành động
chính trên mọi màn hình sẽ trông như một cảnh báo.

Sidebar dùng bộ token `--sidebar-*` riêng, nhuộm nhẹ hue 195 để nó đọc ra như một mặt phẳng riêng
chứ không phải một đường viền vẽ trên trang.

## Mọi màu là một token

Không có class palette thô trong code ứng dụng. `text-emerald-600` là sai; `text-success` là đúng.

Lý do: dark mode. Một class palette thô cần một `dark:` đi kèm ở mọi chỗ nó xuất hiện, và chỗ nào
quên thì chữ biến mất trên nền tối — không lỗi, chỉ không đọc được. Token định nghĩa hai lần trong
CSS, một lần cho mỗi theme, nên chỗ dùng chỉ cần một class.

```css
:root {
  --success: oklch(0.5 0.115 163);
  --warning: oklch(0.499 0.126 65);
  --info:    oklch(0.5 0.118 245);
}
.dark { /* bộ song song, đã chỉnh độ sáng để đọc được trên nền tối */ }
```

Nhờ vậy `text-success bg-success/10 border-success/25` **không cần** một biến thể `dark:` nào.

Màu khai báo bằng **oklch**, không phải hex — nội suy độ sáng đúng, và `/10`, `/25` cho ra nền nhạt
đều nhau giữa các màu.

## Token trạng thái, ánh xạ sang nghiệp vụ

Teamora có nhiều trạng thái hiển thị. Ánh xạ chúng ở **một chỗ duy nhất**
(`components/status-badge.tsx`), không rải điều kiện màu khắp component:

| Nghĩa | Token |
|---|---|
| Đã đăng ký, đã xếp chỗ, đã gửi email | `success` |
| Chưa đăng ký, chờ phân bổ, email đang chờ | `muted-foreground` |
| Có flag: Team bị tách, lệch ca | `warning` |
| Vượt sức chứa, chưa xếp được, email lỗi | `destructive` |
| Đang xử lý, preview chưa commit | `info` |

Một CBNV chưa đăng ký **không phải lỗi** — dùng `muted`, không dùng `destructive`. Bảng đỏ rực vì
mọi thứ chưa xong là bảng không ai đọc.

## Thang bo góc

`rounded-lg` bề mặt (card, dialog, panel) · `rounded-md` control (button, input, select) ·
`rounded-sm` chip nội dòng · `rounded-full` avatar, dot, pill.

`rounded` trần **không thuộc thang này**. Dùng nó là lệch khỏi phần còn lại của giao diện.

## Thang chữ

`text-2xl font-semibold tracking-tight` tiêu đề trang — **đúng một cái mỗi màn hình** ·
`text-base` hoặc `text-lg font-semibold` tiêu đề khu vực · `text-sm` nội dung ·
`text-xs text-muted-foreground` metadata.

`text-xs` là **sàn**. Không có gì nhỏ hơn — §13 yêu cầu CBNV tra cứu được trên điện thoại, thường
là ở sân bay, thường là đang vội.

## Khoảng cách

Dùng `gap-*` của flex/grid, không dùng `space-y-*`. `space-y` phụ thuộc thứ tự anh em và hỏng lặng
lẽ khi một phần tử render có điều kiện — chuyện xảy ra liên tục ở My Journey, nơi nhiều mảnh rỗng
trước khi BTC công bố.

## Dark mode

`next-themes` với `attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange`.

**Không bao giờ gate markup phụ thuộc theme sau một cờ `mounted`.** Nó gây một nháy nội dung rỗng ở
mỗi lần tải trang. Viết CSS đúng cho cả hai theme rồi để trình duyệt lo.

## Thêm một màu

Đừng, trừ khi bảng token phía trên thật sự không diễn đạt được. Nếu phải thêm:

1. Định nghĩa trong `:root` **và** trong `.dark`, cả hai bằng oklch.
2. Ánh xạ trong khối `@theme inline`.
3. Kiểm tra tương phản trên cả hai theme trước khi commit.
4. Ghi nó vào bảng trạng thái ở trên, kèm nghĩa nghiệp vụ.

Một màu không có nghĩa nghiệp vụ là một màu sẽ bị dùng sai ở màn hình tiếp theo.
