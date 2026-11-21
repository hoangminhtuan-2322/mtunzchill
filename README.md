# mtunzchill — website động (Web Service)

Website nhiều trang phong cách Cozy Cartoon, gồm 4 thế giới hoạt hình, âm nhạc, trò chơi và hệ thống đăng ký/đăng nhập riêng.

## Kiến trúc

- **Một Render Web Service (Python/FastAPI)** phục vụ giao diện và API trên cùng origin.
- **Neon Postgres riêng:** database mtunzchill, không chia sẻ tài khoản với mtunz.
- API: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/profile`, `/api/auth/change-password`, `/api/auth/account`, `/api/state` và `/healthz`.
- Lưu trạng thái cục bộ ở trình duyệt khi không đăng nhập; khi đăng nhập, đồng bộ nhật ký/yêu thích/hành trình lên Neon có kiểm tra phiên bản để tránh ghi đè đồng thời.
- Mật khẩu băm Argon2id; session token được hash trong database. Credential chỉ có trong environment của Render, không đẩy lên GitHub.

## Chạy local

```bash
python -m pip install -r requirements.txt
export DATABASE_URL='postgresql://... (Neon)'
uvicorn api.main:app --host 127.0.0.1 --port 8000
```

Vào `http://localhost:8000` — client API đồng origin.

## Render Web Service

- Runtime `python`, region Singapore.
- Build: `pip install -r requirements.txt`
- Start: `uvicorn api.main:app --host 0.0.0.0 --port $PORT --workers 1 --proxy-headers`
- Environment `DATABASE_URL` lấy từ Neon (chỉ cấu hình trong Render).
- Environment `FRONTEND_ORIGIN` là URL public của Web Service.
- Không dùng Static Site để phục vụ giao diện mới.

## Giới hạn

Đây là website có backend thật. Chưa có email xác minh / quên mật khẩu qua email; tên đăng nhập là username, không thu thập email. Nhạc trong website được tạo bằng Web Audio, chưa phải nhạc thương mại.

## Trang chủ Dreamy Cozy · Premium Pastel (21/11/2026)

- Hero cảnh hoạt hình lớn, CTA dùng thật; bộ lối vào nhanh cho nhạc, thế giới, game, hít thở, nhật ký và tài khoản.
- Bốn thế giới với lưu yêu thích, 5 trò chơi, nhạc và preset âm thanh, tiếp tục hoạt động và nhật ký, gợi ý hoạt động hằng ngày.
- Giao diện responsive, animation có hỗ trợ Reduced Motion; nhạc không tự phát khi chưa được người dùng thao tác.
- Tệp trang chủ riêng tại `src/home.js` và `assets/home-premium.css` để không ảnh hưởng các trang chức năng/API hiện có.
- Service Worker chỉ lưu tài nguyên tĩnh; không cache API, phiên hoặc dữ liệu cá nhân.
