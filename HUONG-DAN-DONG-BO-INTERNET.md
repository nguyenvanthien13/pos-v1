# Nàng Hoa POS — Giai đoạn 1: Dữ liệu chung PostgreSQL

## Trạng thái và giới hạn

Bản này là **bản thử nghiệm đồng bộ thủ công có kiểm tra phiên bản** dựa trên source POS đã cung cấp. Không phải hệ thống POS nhiều quầy hoàn chỉnh. React vẫn dùng state/localStorage khi thao tác; nút **Lưu lên server** đẩy bản sao chung lên PostgreSQL, nút **Tải từ server** lấy bản sao mới nhất. Máy khác phải bấm tải để thấy thay đổi. Nếu có máy khác ghi trước, server trả HTTP 409, **không ghi đè**. Chưa có merge tự động, realtime, xử lý tồn kho giao dịch, queue offline, RBAC chi tiết, hay kiểm thử tích hợp thực tế. Không sử dụng để bán hàng thật khi nhiều thu ngân đồng thời.

## Triển khai backend lên Internet

1. Tạo PostgreSQL trên dịch vụ cloud có kết nối từ backend. Lưu URL trong `DATABASE_URL` (không commit mật khẩu lên GitHub).
2. Triển khai thư mục `backend/` thành một **Web Service** Node.js hoặc Docker, có biến môi trường `DATABASE_URL`, `AUTH_SECRET` (ngẫu nhiên >= 32 ký tự), `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `USER_USERNAME`, `USER_PASSWORD`, `FRONTEND_ORIGIN=https://nguyenvanthien13.github.io`.
3. Build command (Node.js): `npm install && npx prisma generate && npm run build && npx prisma db push`. Start command: `node dist/main.js`. Nếu dùng Dockerfile, container chạy prisma db push lúc khởi động. `prisma db push` phù hợp thử nghiệm; sản xuất nên dùng migration có kiểm soát.
4. Kiểm tra `https://TEN-BACKEND/api/health` (đường dẫn thực tế tùy health controller). API đồng bộ: `POST /api/sync/login`, `GET /api/sync/state`, `POST /api/sync/state`.
5. Trong GitHub repository Settings → Secrets and variables → Actions → **Variables**, thêm `VITE_API_URL=https://TEN-BACKEND` (không chứa `/api`). Thêm vào bước `Build PWA` trong workflow:

   ```yaml
   env:
     VITE_API_URL: ${{ vars.VITE_API_URL }}
   ```

   Hoặc khai báo biến môi trường khi build thủ công. **Đây là URL công khai, không phải mật khẩu.**
6. `frontend/vite.config.ts` và `frontend/public/manifest.webmanifest` đã được sửa `/pos/`; `frontend/scripts/generate-sw.mjs` cũng đã sửa `/pos/`.
7. Chạy build frontend `cd frontend && npm install && npm run build`, push và đợi Actions xanh; gỡ/cài lại PWA cũ nếu vẫn mở 404.

## Sử dụng nhiều máy

- Máy A đăng nhập → nếu PostgreSQL trống, dữ liệu demo hiện trên máy A; bấm **Lưu lên server** để khởi tạo. **Không import dữ liệu demo vào DB thật nếu chưa rà soát**.
- Máy B đăng nhập → tải dữ liệu chung. Khi máy A chỉnh đơn/sản phẩm, A bấm **Lưu lên server**; máy B bấm **Tải từ server**.
- Nếu hai máy cùng sửa dựa trên phiên bản cũ, máy ghi sau bị chặn 409. **Xuất backup JSON** trước khi tải lại, rồi nhập/chỉnh lại thủ công; hiện chưa có tính năng merge.
- Ảnh sản phẩm dạng data URL/base64 có thể vượt giới hạn 3MB. Cần chuyển sang object storage (S3/MinIO) trước khi vận hành chính thức.
- Khi server không truy cập được, không có đảm bảo dữ liệu đã đồng bộ. Sao lưu DB thường xuyên.

## An toàn

- Mật khẩu chỉ cấu hình trong biến môi trường backend, không hardcode trong frontend. Không dùng `123` trên Internet; đổi mật khẩu mạnh trước khi triển khai.
- Token phiên đăng nhập nằm trong `sessionStorage`, hết hạn sau 8 giờ; giao thức bắt buộc HTTPS khi triển khai.
- Quyền user/admin mới phân biệt khi đăng nhập, **chưa áp RBAC lên từng hành động**. Cả hai vai trò hiện được quyền lưu toàn bộ snapshot. Cần xây API CRUD có phân quyền cho từng thao tác trước khi chạy thật.
- Nếu đã có dữ liệu thật ở localStorage, sao lưu JSON trước khi đăng nhập và đồng bộ lần đầu.
