# Nàng Hoa POS V5.1 – Local QuickStart

## Yêu cầu
- Windows 10/11, Node.js 22+, Docker Desktop đã mở và chạy.
- Cổng 5432, 3000 và 5173 chưa bị ứng dụng khác chiếm.
- Internet để tải npm dependencies và PostgreSQL image lần đầu.

## Chạy lần đầu
1. Giải nén toàn bộ ZIP.
2. Mở Docker Desktop, đợi trạng thái Engine running.
3. Chuột phải `RUN-NANG-HOA.bat` → Open (hoặc chạy `powershell -ExecutionPolicy Bypass -File .\START-NANG-HOA.ps1` từ thư mục giải nén).
4. Nhập mật khẩu Admin và User mới, tối thiểu 8 ký tự.
5. Đợi script kiểm tra schema, generate Prisma Client, tạo bảng PostgreSQL, build backend, rồi mở hai cửa sổ PowerShell.
6. Truy cập http://localhost:5173; kiểm tra http://localhost:3000/api/health.

## Chạy lại
Có thể dùng `RUN-NANG-HOA.bat` lần nữa. Muốn bỏ qua npm install: `powershell -ExecutionPolicy Bypass -File .\START-NANG-HOA.ps1 -SkipInstall`.

## Lưu ý
- `.env` chứa mật khẩu chỉ được lưu cục bộ; không commit lên GitHub.
- Bản này dùng Docker PostgreSQL local, KHÔNG tự đồng bộ qua Internet.
- Đồng bộ Phase 1 sử dụng nút lưu/tải dữ liệu thủ công; chưa có giao dịch đồng thời an toàn ở mức đơn hàng.
- Script `prisma db push` sẽ đồng bộ cấu trúc vào database Docker local. Không chạy với database sản xuất chưa sao lưu.
- Nếu cổng 5432 bị chiếm, dừng PostgreSQL khác hoặc chỉnh port mapping và DATABASE_URL đồng bộ.
- Nếu Docker đã có volume từ cấu hình khác, không tự ý xóa volume vì có thể mất dữ liệu.
- Nếu `Failed to fetch`, kiểm tra `frontend/.env.local` là `VITE_API_URL=http://localhost:3000`, backend chạy thành công, rồi xem Network trong DevTools.
- Tài khoản chỉ được kiểm tra trên backend; không dùng các mật khẩu mẫu trên môi trường công khai.
