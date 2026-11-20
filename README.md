# mtunzchill 🌿

**Website giải trí thư giãn** với đồ họa hoạt hình 2D, âm thanh tự tạo và các hoạt động tương tác. Bản hiện tại: **3.0**.

## Trải nghiệm hiện có

- Cảnh hoạt hình tương tác: vuốt ve mèo Mochi, chuyển ngày/đêm, bật/tắt mưa.
- 5 trò chơi hoạt động: **Pop Pop**, **Vẽ trên cát**, **Ghép đôi**, **Hồ cá nhỏ**, **Nối những vì sao**.
- Hoạt động **Hít thở 1 phút** với nút bắt đầu, tạm dừng và làm lại.
- Trình phát **3 giai điệu nguyên bản tổng hợp bằng Web Audio API**, chuyển bài, tạm dừng và điều chỉnh âm lượng.
- Bộ trộn âm thanh mưa, sóng và gió; preset **Mưa bên hiên / Biển chiều / Gió rừng**.
- Mood và lời nhắn; lưu tùy chọn ngày/đêm, mood, âm lượng nhạc và giảm chuyển động trên trình duyệt.
- Responsive cho máy tính, máy tính bảng và điện thoại; hỗ trợ điều hướng bàn phím, chế độ giảm chuyển động.

## Kiến trúc hiện tại

Toàn bộ ứng dụng được triển khai dưới dạng **Static Site**. Mở `index.html` trên trình duyệt hiện đại để sử dụng. **Không cần** backend, môi trường biến hay database.

- Không có đăng ký/đăng nhập hay đồng bộ dữ liệu qua thiết bị.
- Dữ liệu tùy chọn được lưu trong `localStorage` của trình duyệt; không lưu ở Neon.
- Âm thanh nhạc là các giai điệu **tổng hợp trên trình duyệt**, không phải dịch vụ nghe nhạc thương mại.
- Trình duyệt yêu cầu thao tác người dùng trước khi phát âm thanh.
- Không tải script, font hoặc thư viện bên ngoài. Trang khai báo CSP và không dùng API thu thập dữ liệu.

## Triển khai

- Repo: `hoangminhtuan-2322/mtunzchill`, nhánh `main`
- Render: **Static Site** tên `mtunzchill`
- URL: https://mtunzchill.onrender.com
- Build Command: `echo 'No build required'`
- Publish Directory: `.`
- Auto deploy: bật theo commit trên `main`

## Kiểm thử trước khi phát hành

Trên Chromium: kiểm tra layout 320, 390, 768, 1024, 1440px; chuyển ngày/đêm, hiệu ứng mưa, mood, âm thanh, preset; cả 5 game và bài hít thở; kiểm tra console JavaScript. Các kiểm tra này không thay thế kiểm thử thực tế trên mọi trình duyệt và thiết bị.

## Hướng phát triển sau

Khi bổ sung tài khoản, bảng xếp hạng hoặc đồng bộ đám mây, cần xây dựng backend và phân quyền bảo mật trước khi kết nối Neon. Không đặt kết nối database hoặc bí mật trong mã nguồn trình duyệt.
