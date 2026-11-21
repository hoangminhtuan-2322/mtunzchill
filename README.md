# mtunzchill — Cozy Hybrid 🌸

Website giải trí thư giãn **nhiều trang + thế giới hoạt hình tương tác**, thiết kế lại từ đầu theo concept pastel đã được duyệt.

## Website đang triển khai

**https://mtunzchill.onrender.com** (Render Static Site)

## Các trang và chức năng hoàn chỉnh hiện có

| Trang | Đường dẫn | Chức năng |
|---|---|---|
| Trang chủ | `#/home` | Banner, thế giới nổi bật, tìm kiếm, game, âm thanh, player |
| Thế giới | `#/worlds` | Danh sách 4 cảnh, lưu yêu thích |
| Tương tác | `#/worlds/rain`, `beach`, `forest`, `cafe` | Chuyển ngày/đêm, bật/tắt mưa, ánh sáng, vuốt ve Mochi, chọn âm thanh |
| Âm nhạc | `#/music` | 4 giai điệu gốc tổng hợp bằng Web Audio, đổi bài, phát/dừng, điều chỉnh âm lượng, 4 bộ âm thanh thiên nhiên |
| Trò chơi | `#/games` | Danh mục 6 hoạt động và trang chơi độc lập |
| Pop Pop | `#/games/pop` | Bóp 25 bong bóng và chơi lại |
| Vẽ trên cát | `#/games/sand` | Vẽ bằng chuột/cảm ứng, xóa và vẽ lại |
| Ghép đôi | `#/games/match` | 4 cặp, lượt chơi, khóa thao tác khi lật, chơi lại |
| Nối sao | `#/games/stars` | Nối 7 sao theo thứ tự, chơi lại, hỗ trợ phím Enter |
| Hồ cá nhỏ | `#/games/pond` | Cho cá ăn, đếm lượt, hỗ trợ chạm và bàn phím |
| Hít thở | `#/games/breathe` | Đồng hồ 1 phút, vòng tròn hít/thở, tạm dừng và chơi lại |
| Thư giãn | `#/relax` | Mood, câu nói, liên kết hít thở/thế giới/focus |
| Tập trung | `#/relax/focus` | Hẹn giờ 5/15/25 phút, tạm dừng, đặt lại |
| Góc của mình | `#/profile` | Thế giới và nhạc đã lưu, âm lượng, giảm chuyển động, xóa dữ liệu cục bộ |
| Giới thiệu | `#/about` | Giới thiệu và quyền riêng tư |

## Hướng dẫn chạy thử cục bộ

Ứng dụng là **Static Site**, dùng JavaScript ES Modules. Mở bằng web server tĩnh (không mở file trực tiếp vì các trình duyệt chặn `import` qua `file://`).

```bash
python -m http.server 8000
```

Sau đó mở `http://localhost:8000/#/home`.

## Cấu trúc

```text
index.html
assets/
  styles.css
  favicon.svg
  hero-world.webp
  world-*.webp
  room-rain.webp
  scene-*.svg
  art-*.webp
src/
  app.js       # Điều hướng các trang, giao diện, lưu cục bộ, tìm kiếm
  data.js      # Dữ liệu thế giới, trò chơi, giai điệu, icon SVG
  audio.js     # Web Audio synth + ambient mixer
  games.js     # Các mini game, hẹn giờ
README.md
robots.txt
```

## Triển khai lên Render

- Type: **Static Site**
- Git repository: `https://github.com/hoangminhtuan-2322/mtunzchill`
- Branch: `main`
- Build command: `echo 'No build required'`
- Publish directory: `.`
- Trường hợp Render đang đọc repo bằng URL Public (chưa kết nối GitHub App), cập nhật sau khi commit cần được kích hoạt deploy thủ công. Không nên cho rằng `autoDeploy: yes` đồng nghĩa với webhook hoạt động.

## Quyền riêng tư và bản quyền

- Không có đăng nhập, gửi email, thu thập dữ liệu người dùng hoặc kết nối Neon.
- Mood, mục yêu thích, lựa chọn gần đây, âm lượng và tùy chọn giảm chuyển động được lưu vào `localStorage` trên thiết bị. Xóa trong `Góc của mình`.
- Không có analytics, quảng cáo, thư viện nhúng hay yêu cầu đến máy chủ bên ngoài.
- **Nhạc là các giai điệu tự tổng hợp trong trình duyệt**, không phải các bản nhạc thu âm, kho nhạc thương mại hoặc API streaming. Trình duyệt chỉ phát âm thanh sau khi người dùng thao tác.
- Minh họa được lấy từ các ảnh concept được tạo cho dự án mtunzchill và SVG tự dựng.

## Tiêu chuẩn chất lượng

- Giao diện desktop/mobile, menu thật, không có nút chỉ để trang trí.
- Hỗ trợ `prefers-reduced-motion`, cài đặt giảm animation, các trạng thái nút và focus bàn phím.
- Dùng JS Modules thuần, không cần cài dependencies, không đưa khóa API vào frontend.
- Có thẻ CSP, không tải script bên ngoài.
- Đã kiểm tra smoke bằng Chromium với 6 độ rộng: 320, 360, 390, 768, 1024, 1440; điều hướng 18 route, game, âm thanh, tìm kiếm, storage. Việc này không thay thế QA đa trình duyệt, đa thiết bị thực tế.

## Phát triển tiếp

Các chức năng như tài khoản, cloud sync, playlist nhạc streaming được cấp phép và quản trị nội dung cần backend riêng trước khi công khai. Không đặt thông tin kết nối Neon ở ứng dụng tĩnh.
