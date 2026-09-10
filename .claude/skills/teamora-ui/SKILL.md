---
name: teamora-ui
description: Dựng giao diện Teamora — token màu, thang bo góc và thang chữ, component dùng chung, bảng, trạng thái rỗng, responsive, và cách hiển thị dữ liệu nghiệp vụ như trạng thái kỳ, flag phân bổ, thông tin chuyến bay và xe. Dùng khi viết bất kỳ component nào.
---

# UI

Token màu, thang bo góc, thang chữ, dark mode: `.claude/rules/theming.md`. **Đọc trước.**
Skill này nói cách dựng component trên nền đó.

## Dùng lại trước khi viết

`src/components/` đã có, copy từ Ragenta. Kiểm tra chúng trước khi tạo component mới:

| Component | Dùng cho |
|---|---|
| `EntityContainer`, `EntityHeader` | Khung màn hình danh sách |
| `EntityDataTable`, `EntityTableSkeleton` | Bảng + skeleton khớp cột |
| `EntitySearch`, `EntityPagination` | Toolbar tìm kiếm debounce, phân trang |
| `EntityStateView`, `EntityEmptyView` | Trạng thái rỗng và lỗi |
| `DetailShell`, `DetailSection`, `DetailList` | Màn hình chi tiết |
| `PageHeader`, `StatCard`, `StatusBadge`, `ConfirmDialog`, `CopyButton` | Lặt vặt |

Một biến thể mới của bảng, một cách phân trang thứ hai, một `Card` tự viết — đó là dấu hiệu đang đi
lệch, không phải dấu hiệu component cũ thiếu.

## Thư viện

`lucide-react` icon · `sonner` toast · `react-hook-form` + zod form · `@tanstack/react-table` bảng ·
`recharts` biểu đồ (qua `components/ui/chart.tsx`) · `date-fns` ngày tháng · `next-themes` dark mode.

**Không thêm thư viện UI thứ hai.** Không date-picker: `<Input type="date">` là đủ và nó dùng được
bằng bàn phím ngay, trên điện thoại thì bung date picker của hệ điều hành.

## Hiển thị dữ liệu nghiệp vụ

### Trạng thái kỳ
Ánh xạ nhãn tiếng Việt ở **một file duy nhất**, không rải `switch` khắp component:

| `event.status` | Nhãn | Token |
|---|---|---|
| `registration_open` | Đang mở đăng ký | `success` |
| `registration_closed` | Đã đóng đăng ký | `muted-foreground` |
| `allocation_processing` | Đang phân bổ | `info` |
| `information_published` | Đã công bố | `success` |
| `event_started` | Đang diễn ra | `info` |
| `event_completed` | Đã kết thúc | `muted-foreground` |

### Flag phân bổ
`team_split` → "Team bị tách" (`warning`) · `shift_unmet` → "Lệch ca đăng ký" (`warning`) ·
`shift_locked_unmet` → "Không xếp được ca bắt buộc" (**`destructive`**) ·
`unassigned` → "Chưa xếp được" (`destructive`) · `over_capacity` → "Vượt sức chứa" (`destructive`).

`shift_unmet` là `warning`, `shift_locked_unmet` là `destructive` — đừng gộp hai cái. Cái đầu là
không chiều được nguyện vọng; cái sau là một người có ràng buộc công việc thật đang không có chỗ
(ADR-017), và BTC phải xử lý nó trước mọi thứ khác.

Flag hiện dạng chip nội dòng cạnh tên người, kèm tooltip nói **vì sao**. Một cột "Ghi chú" chứa chữ
`team_split` là thứ BTC phải đi hỏi mới hiểu.

### Sức chứa
Luôn hiện dạng `đã xếp / sức chứa`, không hiện riêng một con số. `38/40` trả lời được câu hỏi thật
("còn chỗ không"); `38` thì không.

Đầy thì `warning`, vượt thì `destructive`, còn chỗ thì màu chữ thường. **Không dùng `success` cho
"đã đầy"** — đầy không phải thành công, nó là hết chỗ.

### Thời gian
Giờ bay và giờ tập trung là dữ liệu người ta hành động theo. Luôn hiện **cả ngày và giờ**, định
dạng 24h (`14:35 · 12/10`). Không dùng thời gian tương đối ("2 giờ nữa") cho lịch bay — người đọc
cần con số họ đối chiếu được với vé.

### Chặng xe
Bốn chặng luôn hiện **đúng thứ tự hành trình**, không theo thứ tự bảng chữ cái:
HN/HCM → Sân bay · Sân bay → Khách sạn · Khách sạn → Sân bay · Sân bay → HN/HCM.

## Trạng thái rỗng phải nói việc tiếp theo

Ba loại rỗng, khác nhau:

| Loại | Ví dụ |
|---|---|
| Chưa có gì | "Chưa có chuyến bay nào. Thêm thủ công hoặc import từ Excel." + nút |
| Lọc không ra kết quả | "Không có CBNV nào khớp 'nguyen'." + nút xóa bộ lọc |
| Chưa tới lúc | "BTC sẽ cập nhật thông tin xe sau khi phân bổ xong." |

Loại thứ ba là loại My Journey dùng nhiều nhất. Nó **không phải lỗi** — đừng dùng icon cảnh báo,
đừng dùng `destructive`.

## Responsive là yêu cầu nghiệp vụ (§13)

CBNV tra cứu bằng điện thoại, ở sân bay, đang vội. Mục tiêu là 375px.

- Bảng admin **bỏ bớt cột** qua `ColumnMeta.priority`, không cuộn ngang. Skeleton bỏ đúng những cột đó.
- My Journey xếp dọc trên mobile, mỗi chặng một card. Không bảng.
- Thông tin quan trọng nhất lên đầu: mã chuyến, giờ, điểm tập trung. Trưởng xe và ghi chú xuống dưới.
- Số điện thoại Trưởng xe là `<a href="tel:...">` — người ta sẽ bấm gọi, không copy tay.
- Vùng chạm tối thiểu 44px.

## Toast

`toast.success(tiêu đề, { description })`. Tiêu đề là kết quả, description là chi tiết hữu ích:

```ts
toast.success("Đã chuyển chuyến", { description: "VN213 — còn 2 chỗ" })
toast.error("Không chuyển được", { description: await errorMessage(error) })
```

Cảnh báo vượt sức chứa (§5.5) đi qua `toast.warning`, **không phải** `toast.error` — thao tác đã
thành công, BTC chỉ cần biết điều họ vừa làm.

## Trước khi kết thúc

- Có component dùng chung nào đã làm được việc này không?
- Có class Tailwind palette thô nào không?
- Có `space-y-*` chỗ nào đáng lẽ là `gap-*` không?
- Ba trạng thái rỗng có đúng loại không?
- Thử ở 375px: cuộn ngang chỗ nào không? Số điện thoại bấm gọi được chưa?
- Nhãn tiếng Việt có nằm ở file ánh xạ chung, hay bị hard-code trong component?
