# Nàng Hoa POS V5.2 – Tự đồng bộ an toàn (thử nghiệm)

## Những gì đã bổ sung
- Sau đăng nhập, tự lấy bản dữ liệu mới nhất từ PostgreSQL.
- Kiểm tra server mỗi 3 giây; khi máy có thay đổi, tự lưu lên server (không cần bấm nút).
- Khi một máy đã lưu, các máy khác đang online và không có thay đổi chưa lưu sẽ tự tải bản mới.
- Mất mạng: giữ thay đổi ở localStorage; thử lại khi mạng phục hồi và phiên đăng nhập còn hiệu lực.
- Nếu server báo xung đột 409, dừng tự lưu và thông báo thay vì ghi đè dữ liệu của máy khác.

## Giới hạn quan trọng
- Đây là đồng bộ *snapshot toàn bộ dữ liệu*, KHÔNG phải hệ thống POS đa người dùng có giao dịch độc lập.
- Khi 2 máy sửa đồng thời, bản này sẽ dừng và cần xử lý thủ công; KHÔNG tự gộp đơn hàng/tồn kho.
- Không đảm bảo hoạt động không gián đoạn khi mất mạng, server ngừng hoạt động hoặc token hết hạn.
- Chưa có hàng đợi offline bền vững theo từng thao tác, WebSocket/SSE, transaction cho từng đơn, hoặc idempotency.
- Không nên sử dụng cho bán hàng đồng thời nhiều quầy trước khi chuyển sang API CRUD theo từng đơn/sản phẩm và transaction PostgreSQL.
- Để đồng bộ giữa các thiết bị ở ngoài cùng mạng LAN cần deploy Backend + PostgreSQL 24/7 lên server HTTPS; `localhost` chỉ dùng được trên máy đang chạy.

## Chạy
Mở Docker Desktop; chạy `powershell -ExecutionPolicy Bypass -File .\START-NANG-HOA.ps1` từ thư mục giải nén.
Nếu port 5432 bị chiếm, đổi port host trong `docker-compose.yml` và `backend/.env` giống nhau (ví dụ 5435).
