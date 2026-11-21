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


## Music Studio V7 — Tích hợp Spotify chính thức

- Trang `#/music` có 8 playlist tuyển chọn, bộ lọc tâm trạng, yêu thích, gần đây, bộ sưu tập liên kết Spotify do người dùng tự thêm và tìm kiếm thư viện.
- Tìm trên toàn bộ Spotify sẽ mở trang Spotify; không giả vờ cung cấp Spotify Search API khi chưa có quyền truy cập.
- Spotify phát qua iframe nhúng chính thức, chỉ nạp sau thao tác phát của người dùng. Nhạc có thể tiếp tục khi điều hướng trong mtunzchill, tùy trình duyệt và chính sách Spotify.
- Mức độ phát đầy đủ, quảng cáo, hạn chế tài khoản, khu vực và trình duyệt do Spotify quyết định. Có nút mở nội dung trên Spotify.
- Nhạc synth nguyên bản, bộ trộn âm thanh thiên nhiên và hẹn giờ vẫn dùng được; hết giờ sẽ đóng iframe Spotify.
- Dữ liệu Spotify đã lưu gần đây và playlist cá nhân hiện chỉ lưu trên trình duyệt, chưa đồng bộ Neon. Xóa dữ liệu trong Góc của mình sẽ xóa chúng.
- Không có Web Playback SDK hoặc OAuth, không lấy hoặc lưu bản ghi thương mại hay Spotify API key. Spotify Development Mode bị giới hạn người dùng và thường yêu cầu Premium nếu sau này muốn tích hợp đầy đủ.
- CSP cho phép `frame-src https://open.spotify.com` và không cho phép nhúng website tùy ý.

## Cozy Home — game nuôi thú cưng và trang trí nhà

- Truy cập `#/games/cozy-home` để nhận pet riêng: mèo, cún hoặc thỏ, và đặt tên.
- Chăm pet: cho ăn, chơi cùng, nghỉ ngơi, vuốt ve. Pet không chết hay bị phạt khi nghỉ chơi lâu.
- Trang trí 2 khu: phòng ngủ và khu vườn. Đặt/cất/chuyển vị trí của 12 loại nội thất; đổi màu phòng, ban ngày/đêm.
- Chăm cây, nhận hạt nắng khi chăm pet và mua đồ trang trí. Hạt nắng chỉ là điểm game, không thể quy đổi tiền thật.
- Dữ liệu `cozyHome` được đưa vào bản sao lưu `mtunzchill-local` v1; đăng nhập sẽ đồng bộ cùng dữ liệu riêng qua `/api/state` theo user đã xác thực. Khi đăng xuất sẽ xóa bản cache cá nhân trên máy và không hiển thị nhà của chủ tài khoản cho khách.
- Khi chơi offline, tiến trình lưu trên `localStorage`; đồng bộ lại khi có mạng và phiên còn hiệu lực.
- Không dùng quảng cáo, phân tích hành vi hay mua vật phẩm bằng tiền.


## Music Garden V9 — SoundCloud & YouTube (21/11/2026)

- Trang Âm nhạc có SoundCloud (8 gợi ý playlist/track công khai) và YouTube (2 lựa chọn Lofi Girl), với trình phát nhúng chính thức khi người dùng chủ động nhấn nghe.
- Có thể nhập liên kết SoundCloud công khai hoặc video/playlist YouTube, lọc theo tâm trạng/nguồn, lưu yêu thích và mở lại gần đây. Dữ liệu thư viện nhạc tùy biến ở trình duyệt và chưa đồng bộ Neon. Các liên kết Spotify đã lưu ở localStorage phiên bản cũ không bị tự xóa.
- Trình phát nổi được giữ khi đổi trang; YouTube không được thu nhỏ trong lúc phát để giữ video hiển thị. Nguồn nhạc có thể hạn chế phát/nhúng theo chính sách, khu vực và quyền của tác giả. Có liên kết tới ứng dụng gốc để mở khi nhúng không hoạt động.
- Ấn logo mtunzchill tại đầu/chân trang từ bất kỳ trang nào sẽ trở về đầu trang chủ, kể cả khi URL đã là #/home.
- CSP chỉ cho phép iframe Spotify cũ, SoundCloud chính thức và YouTube privacy-enhanced; tài nguyên bên ngoài chỉ tải khi người dùng nhấn phát. Service worker đổi cache version và thêm CSS mới; API tài khoản vẫn không bị cache.

## Cozy Home — Storybook Seasons (V10)

Đợt nâng cấp trò chơi dài hạn (không liên quan tiền thật):

- **30 cấp trải nghiệm**: nhận XP nhẹ khi chăm pet, trồng cây, thu hoạch, trang trí và dạo chơi.
- **3 không gian**: phòng ngủ, vườn, và gác xép sáng tạo mở khóa ở cấp 3 với 180 Hạt nắng.
- **Thêm 8 đồ nội thất** và hai màu phòng mới.
- **Vườn thu hoạch 3 luống** với 4 loại cây; thời gian lớn tính theo đồng hồ thiết bị, chạy tiếp khi đóng trang (1/5/15/45 phút).
- **Nhiệm vụ tự nguyện mỗi ngày** (chăm pet, gieo cây, thu hoạch, trang trí), quà ngày và phần thưởng nhận duy nhất một lần.
- **Đón tối đa 3 pet** rồi đổi bạn đồng hành để chăm sóc từng bé.
- **Album**: ảnh kỷ niệm dạng thẻ minh họa, sticker sưu tầm theo chuyến đi hằng ngày và 12 huy hiệu.

### Lưu dữ liệu và tương thích

Bản nâng cấp thêm trường `adventure` vào đối tượng `cozyHome` hiện có nhưng giữ `version:1`. Bộ chuẩn hóa chấp nhận dữ liệu v1 trước đây, giữ pet, đồ nội thất, căn nhà, màu phòng và Hạt nắng. `wellbeing.js` vẫn lưu qua cùng snapshot đã được kết nối Neon khi đăng nhập; không tạo bảng mới hoặc sửa cấu trúc SQL.

Mục tiêu là trải nghiệm thư giãn: không có thú cưng chết, mất pet, nhiệm vụ bắt buộc, quảng cáo hoặc thanh toán thật. Thời gian gieo cây/phần thưởng dùng đồng hồ thiết bị; không phải hệ thống thành tích cạnh tranh chống gian lận.

### Kiểm thử

- Node: `node tests/test_state_v10.mjs` (bảo toàn save v1, nhận thưởng một lần, cây trồng, mở khóa, pet, sticker/ảnh và giới hạn dữ liệu).
- Chromium: thử giao diện đầy đủ 320/390/768/1440px; thử game trực tiếp với việc mua/đặt đồ, lưu và nạp lại tiến trình.
- Không sửa API tài khoản, thông tin đăng nhập hay database. Cần kiểm chứng độc lập API đồng bộ giữa hai thiết bị production nếu có người dùng thật.
