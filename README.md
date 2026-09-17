# Teamora Frontend

Giao diện web của hệ thống quản lý Team Building. Một ứng dụng Next.js chứa hai shell:

- **CBNV** (`/`): đăng ký, hồ sơ, và *My Team Building Journey* — chuyến bay, xe, khách sạn/phòng,
  Gala Dinner, lịch trình, thông báo. Các tab phân bổ khóa cho tới khi BTC công bố.
- **BTC** (`/admin`): quản lý kỳ, CBNV, Team, chuyến bay, xe, khách sạn, bàn phân bổ (preview →
  commit), Gala, nội dung, audit log.

Trình duyệt không gọi backend trực tiếp: mọi request đi qua proxy Hono của chính app tại `/api/*`
sang `TEAMORA_API_URL`. Backend ở repo `teamora-backend`.

## Chạy demo (bàn giao / test nhanh)

Cần Docker Desktop. **Dựng backend demo trước** (xem README của `teamora-backend` — nó tự migrate
và seed đầy đủ dữ liệu mẫu), rồi:

```bash
docker compose -f docker-compose.demo.yml up --build -d
docker compose -f docker-compose.demo.yml ps        # web phải "healthy"
```

Mở <http://localhost:3000>. Container gọi backend qua `http://host.docker.internal:8080`.

**Tài khoản demo** (mật khẩu chung `Teamora!2026`):

| Vai trò | Email | Vào đâu |
|---|---|---|
| BTC | `admin@teamora.local` | `/admin` |
| CBNV | `demo01@teamora.local` … `demo18@teamora.local` | `/` |

Email hệ thống gửi ra xem ở Maildev <http://localhost:1080>.

### Chia sẻ cho người test bên ngoài (ngrok)

Stack demo đã cấu hình sẵn cho domain `https://undebilitating-punctiliously-matt.ngrok-free.dev`.
Chạy tunnel trên máy host (không cần trong Docker):

```bash
ngrok http 3000 --url=https://undebilitating-punctiliously-matt.ngrok-free.dev
```

Dùng domain khác: đặt `DEMO_PUBLIC_URL=https://<domain>` **cho cả hai** stack demo (backend dùng
nó làm `TRUSTED_ORIGINS`, frontend làm `APP_BASE_URL`) rồi `up` lại.

Biến tùy chọn:

| Biến | Mặc định | Dùng khi |
|---|---|---|
| `DEMO_PUBLIC_URL` | domain ngrok ở trên | Đổi domain public |
| `TEAMORA_DOCKER_API_URL` | `http://host.docker.internal:8080` | Backend ở máy khác / native Linux |
| `TEAMORA_WEB_PORT` | `3000` | Đổi port |

## Chạy dev

Yêu cầu: Node 22 (`.nvmrc`), pnpm 11 (`corepack enable`), backend đang chạy ở `localhost:8080`.

```bash
cp .env.example .env
pnpm install
pnpm dev                           # http://localhost:3000
```

Dev stack Docker (không seed): `docker compose up --build -d`.

## Lệnh

| Lệnh | Việc |
|---|---|
| `pnpm dev` | Next dev server |
| `pnpm build` · `pnpm start` | Production build (`output: "standalone"`) và chạy |
| `pnpm typecheck` | `tsc --noEmit` — chạy **sau** `build` để có `next-env.d.ts` |
| `pnpm lint` | ESLint (thêm đường dẫn để giới hạn: `pnpm lint src/features/logistics`) |
| `pnpm format` · `pnpm format:check` | Prettier |

## Cấu trúc code

```
src/
├── app/
│   ├── (auth)/                 # login · forgot-password · reset-password; đăng ký tự do bị đóng
│   ├── (app)/                  # shell CBNV: sidebar + header, EventProvider
│   │   ├── page.tsx            # Tổng quan hành trình
│   │   ├── register · profile · flights · transport · hotel · gala · schedule · announcements
│   ├── admin/(main)/           # shell BTC: sidebar nhóm theo việc của BTC
│   │   ├── page.tsx            # tất cả các kỳ
│   │   └── events/[eventId]/   # dashboard kỳ · registrations · teams · pickup-points
│   │                           # flights(/allocation) · vehicles(/allocation) · accommodations
│   │                           # gala/tables · gala/session · content · notifications · audit-log
│   ├── api/[[...route]]        # proxy Hono → backend, /api/health
│   ├── layout.tsx · globals.css (design token) · error.tsx
├── features/<name>/            # một màn hình = một module tự chứa
│   ├── components/             # UI của feature
│   ├── service/                # gọi backend bằng ky, zod-parse tại ranh giới
│   ├── options/                # queryOptions (TanStack Query)
│   ├── hooks/                  # useQuery/useMutation bọc options + toast
│   └── server/prefetch.ts      # prefetch cho RSC page
│   auth · events · employees · registration · teams · pickup-points · work-locations
│   flights · logistics (xe, khách sạn, phân phòng) · gala · journey · notifications · audit-logs
├── components/
│   ├── ui/                     # shadcn (radix-nova)
│   ├── app-sidebar · app-header            # shell BTC
│   ├── employee-sidebar · employee-app-header · locked-tab   # shell CBNV
│   ├── entity-components · page-header · stat-card · status-badge   # khối dùng chung
│   └── env-script.tsx          # serialize APP_BASE_URL → window.__env lúc request
├── lib/                        # ky client, server-fetch, auth guard (requireAuth/requireOrganizer),
│                               # get-query-client, api-error, config
├── proxy/index.ts              # chuyển tiếp /api/* kèm cookie sang backend
└── hooks/                      # use-mobile, use-debounced-value
scripts/                        # smoke test giao diện
```

Quy ước bắt buộc (chi tiết ở `CLAUDE.md` và `.claude/rules/`):

- Không Server Action, không `fetch()` trong component — mọi lời gọi backend qua `service/` của
  feature.
- State danh sách ở URL (`nuqs`), state server ở TanStack Query; không zustand/redux.
- Route guard chỉ là UX; backend kiểm tra lại mọi request và gate theo `event.status`.
- Màu chỉ dùng token trong `globals.css` (`text-destructive`, `text-muted-foreground`…), không
  palette Tailwind thô.
- **Không có `NEXT_PUBLIC_*`.** Giá trị public đi qua `EnvScript` → `window.__env`, để một image
  chạy được cả staging lẫn production. CI fail nếu thấy `NEXT_PUBLIC_` trong bundle.

## Biến môi trường

Xem `.env.example`.

| Biến | Ghi chú |
|---|---|
| `TEAMORA_API_URL` | server-side, địa chỉ backend proxy trỏ tới; trình duyệt không bao giờ thấy |
| `APP_BASE_URL` | client-side qua `window.__env`; phải nằm trong `TRUSTED_ORIGINS` của backend |
| `RAGENTA_WIDGET_SRC` · `RAGENTA_WIDGET_KEY` · `RAGENTA_IDENTITY_SECRET` | chat bubble trên shell CBNV; để trống là ẩn |

## CI/CD

`.github/workflows/check.yml`: lint → build → typecheck → kiểm tra không có `NEXT_PUBLIC_*` →
`docker compose config`. Tag `vX.Y.Z` → production, `vX.Y.ZrcN` → staging. Chi tiết:
`.claude/docs/DEPLOYMENT.md` ở workspace root.

## Tài liệu

`.claude/docs/` ở workspace root: `STATUS.md`, `REQUIREMENTS.md`, `ARCHITECTURE.md`,
`DECISIONS.md` (ADR), `DEPLOYMENT.md`. Quy tắc riêng của frontend:
`.claude/rules/feature-module.md`, `.claude/rules/theming.md`.
