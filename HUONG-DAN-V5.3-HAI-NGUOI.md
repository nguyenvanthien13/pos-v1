# Nàng Hoa POS V5.3 — Concurrent Checkout (bản thử nghiệm)

## Thay đổi
- Khi nhấn hoàn tất đơn, frontend **không còn tự ghi đơn và trừ kho local**; gửi POST /api/sync/checkout.
- Backend dùng PostgreSQL transaction và advisory transaction lock để xử lý tuần tự các checkout của cùng POS.
- Backend kiểm tra tồn kho mới nhất, tính lại giá và tổng tiền từ sản phẩm trên server, tạo đơn và trừ kho trong cùng giao dịch.
- Mã đơn UUID, retry cùng mã sẽ không tạo trùng đơn; tuy nhiên frontend chưa có hàng đợi retry giữ mã khi timeout, cần xác minh đơn trước khi nhấn tạo lại.
- Đồng bộ polling 3 giây như bản trước; thay đổi ngoài checkout vẫn dùng snapshot CAS và **có thể bị báo xung đột**.

## GIỚI HẠN QUAN TRỌNG
Đây chưa phải hệ thống đa người dùng production hoàn chỉnh. Các thao tác sửa đơn, nhập kho, xóa sản phẩm, chỉnh sửa khách hàng vẫn theo snapshot và có thể xung đột; không được bảo đảm không xung đột 100%. Không bán offline. Cần migration sang CRUD giao dịch theo từng thực thể, idempotency keys lưu ở DB, nhật ký thay đổi, kiểm thử concurrency và phục hồi sau sự cố trước khi sử dụng thật.

## Cài đặt
1. Sao lưu dữ liệu hiện tại; không xóa Docker volumes.
2. Mở Docker Desktop; dùng cổng PostgreSQL chưa bị chiếm (ví dụ 5435) trong docker-compose.yml và backend/.env.
3. Chạy `powershell -ExecutionPolicy Bypass -File .\START-NANG-HOA.ps1`.
4. Đăng nhập ở hai trình duyệt, đợi cả hai đồng bộ xong, thử bán cùng sản phẩm tồn kho 1. Chỉ một đơn được chấp nhận.
5. Nếu có timeout, kiểm tra danh sách đơn trên server trước khi tạo lại.
