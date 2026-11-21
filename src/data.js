export const worlds=[
 {id:'rain',name:'Phòng mưa',subtitle:'Một góc ấm bên cửa sổ',desc:'Thả lỏng trong căn phòng ấm áp, ngắm mưa rơi bên cửa sổ và nghe những giai điệu êm dịu.',image:'assets/world-rain.webp',scene:'assets/room-rain.webp',icon:'rain',tag:'Ấm áp · Đêm mưa',ambient:'rain'},
 {id:'beach',name:'Biển hoàng hôn',subtitle:'Dịu dàng theo sóng vỗ',desc:'Chờ mặt trời lặn trên biển tím hồng, nghe từng đợt sóng vỗ bờ và ngắm trời đổi màu.',image:'assets/world-beach.webp',scene:'assets/scene-beach.svg',icon:'sun',tag:'Thiên nhiên · Bình yên',ambient:'wave'},
 {id:'forest',name:'Rừng đêm',subtitle:'Ánh sao và đom đóm',desc:'Lạc vào khu rừng lung linh nơi tiếng gió kể chuyện, đom đóm bay và các vì sao lấp lánh.',image:'assets/world-forest.webp',scene:'assets/scene-forest.svg',icon:'moon',tag:'Thư thái · Yên tĩnh',ambient:'wind'},
 {id:'cafe',name:'Quán lofi',subtitle:'Góc nhỏ bên ly cà phê',desc:'Ghé quán cà phê ấm áp, bật một giai điệu thật nhẹ, nhâm nhi và tận hưởng những phút chậm rãi.',image:'assets/world-cafe.webp',scene:'assets/scene-cafe.svg',icon:'coffee',tag:'Lofi · Ấm cúng',ambient:'rain'}
];
export const games=[
 {id:'cozy-home',name:'Cozy Home · Nuôi pet & xây nhà',desc:'Nuôi bé pet, trang trí nhà và trồng cây theo ý mình',image:'assets/cozy-home-cover.svg',icon:'home',tag:'Nuôi pet · Sáng tạo · Có lưu tiến trình',details:'Nhận một người bạn nhỏ, cho ăn, vuốt ve, đổi màu phòng, sắp xếp nội thất và tưới vườn hoa. Tiến trình lưu trên máy hoặc tài khoản mtunzchill.'},
 {id:'pop',name:'Pop Pop',desc:'Nổ bong bóng thư giãn theo nhịp của riêng bạn',image:'assets/art-pop.webp',icon:'bubbles',tag:'Tương tác · Không áp lực',details:'Chạm vào 25 bong bóng pastel. Mỗi lần chạm đều có hiệu ứng nhỏ xinh.'},
 {id:'sand',name:'Vẽ trên cát',desc:'Sáng tạo những nét vẽ nhẹ nhàng',image:'assets/art-sand.webp',icon:'edit',tag:'Sáng tạo · Tự do',details:'Vẽ bằng chuột hoặc ngón tay. Thử tạo những hình vẽ thật tự do và xóa để bắt đầu lại.'},
 {id:'match',name:'Ghép đôi',desc:'Tìm các cặp hình giống nhau',image:'assets/art-match.webp',icon:'grid',tag:'Trí nhớ · Dễ thương',details:'Lật từng cặp thẻ dễ thương. Không tính thời gian, không áp lực.'},
 {id:'stars',name:'Nối sao',desc:'Nối các vì sao thành chòm sao lung linh',image:'assets/art-stars.webp',icon:'sparkles',tag:'Giải đố · Ngắm sao',details:'Nhấn lần lượt những ngôi sao theo thứ tự để hoàn thành chòm sao.'},
 {id:'pond',name:'Hồ cá nhỏ',desc:'Thả thức ăn và ngắm cá tung tăng',image:'assets/art-fish.webp',icon:'fish',tag:'Ngắm nhìn · Thiên nhiên',details:'Chạm vào mặt hồ để cho những người bạn nhỏ ăn. Không giới hạn số lần.'},
 {id:'breathe',name:'Hít thở 1 phút',desc:'Thở chậm cùng vòng tròn dịu nhẹ',image:'assets/art-breathe.webp',icon:'leaf',tag:'Thư giãn · Chánh niệm',details:'Theo nhịp hướng dẫn hít vào và thở ra nhẹ nhàng trong 60 giây.'}
];
export const tracks=[
 {title:'Rainy Lofi',subtitle:'Giai điệu tự tạo · Nhẹ nhàng',image:'assets/world-rain.webp',tempo:550,wave:'sine',notes:[261.63,329.63,392,329.63,293.66,349.23,440,349.23,261.63,392,349.23,329.63,246.94,293.66,329.63,261.63]},
 {title:'Golden Hour',subtitle:'Giai điệu tự tạo · Nắng chiều',image:'assets/world-beach.webp',tempo:630,wave:'triangle',notes:[293.66,369.99,440,369.99,329.63,392,493.88,392,329.63,440,392,293.66,261.63,329.63,369.99,293.66]},
 {title:'Forest Whispers',subtitle:'Giai điệu tự tạo · Rừng xanh',image:'assets/world-forest.webp',tempo:675,wave:'sine',notes:[220,261.63,329.63,261.63,246.94,293.66,349.23,293.66,220,246.94,293.66,329.63,261.63,246.94,220,196]},
 {title:'Moonlight',subtitle:'Giai điệu tự tạo · Đêm sao',image:'assets/world-cafe.webp',tempo:700,wave:'sine',notes:[196,246.94,293.66,246.94,220,261.63,329.63,261.63,196,261.63,293.66,349.23,293.66,261.63,246.94,196]}
];
export const moods=[{id:'calm',name:'Bình yên',emoji:'☁️',quote:'Một ngày bình thường cũng có thể chứa những khoảnh khắc thật đẹp.'},{id:'happy',name:'Vui vẻ',emoji:'🌞',quote:'Niềm vui đôi khi là một bài nhạc hay và chút nắng ngoài hiên.'},{id:'tired',name:'Hơi mệt',emoji:'🧋',quote:'Bạn có thể nghỉ ngơi. Không phải phút nào cũng cần thật năng suất.'},{id:'focus',name:'Tập trung',emoji:'✨',quote:'Làm từng việc nhỏ một, rồi mọi thứ sẽ dần trở nên nhẹ nhàng.'}];
export const quotes=[
 'Bạn không cần phải vội. Một ngày dịu dàng vẫn đang đợi bạn phía trước.',
 'Hạnh phúc đôi khi là một buổi chiều có mây, ly trà ấm và người bạn yêu thương.',
 'Mọi thứ đều có thể chậm lại một chút. Cứ hít thở thật êm.',
 'Gửi bạn một khoảng trời bình yên — ngay tại đây, ngay lúc này.',
 'Ngày hôm nay không cần hoàn hảo để trở thành một ngày đáng nhớ.'
];
const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
 gamepad:'<path d="M6 12h4m-2-2v4m7-2h.01M18 10h.01"/><path d="M6 6h12a4 4 0 0 1 4 3.5l1 7a4 4 0 0 1-6.4 3.6l-2.9-2H10l-2.9 2A4 4 0 0 1 .7 16.5l1-7A4 4 0 0 1 6 6Z"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
 leaf:'<path d="M20 4C8 4 4 10 4 16a4 4 0 0 0 4 4c6 0 12-4 12-16ZM4 20c4-6 8-9 13-12"/>',
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-8 15-8 16 0"/>',
 play:'<path d="m8 5 12 7-12 7Z" fill="currentColor" stroke="none"/>',
 pause:'<path d="M8 5v14M16 5v14" stroke-width="3"/>',
 prev:'<path d="M5 4v16m14-16L7 12l12 8Z"/>',
 next:'<path d="M19 4v16M5 4l12 8-12 8Z"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 'heart-full':'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" fill="currentColor"/>',
 search:'<circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 5 5"/>',
 right:'<path d="m9 18 6-6-6-6"/>',
 left:'<path d="m15 18-6-6 6-6"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
 moon:'<path d="M20 15a8 8 0 0 1-11-11A8.7 8.7 0 1 0 20 15Z"/>',
 rain:'<path d="M6 16a5 5 0 0 1 .2-10A7 7 0 0 1 20 9a4 4 0 0 1 0 7H6ZM7 19l-1 2m6-2-1 2m6-2-1 2"/>',
 coffee:'<path d="M5 9h12v7a6 6 0 0 1-12 0Zm12 1h2a3 3 0 0 1 0 6h-2M4 22h14M8 3v3m5-3v3"/>',
 wind:'<path d="M3 8h12a3 3 0 1 0-3-3M2 12h19a3 3 0 1 1-3 3M3 16h9a3 3 0 1 1-3 3"/>',
 wave:'<path d="M2 12c3-4 7-4 10 0s7 4 10 0M2 18c3-4 7-4 10 0s7 4 10 0"/>',
 flame:'<path d="M12 22a8 8 0 0 0 8-8c0-3-2-6-5-9 0 3-1 5-3 6C11 8 9 6 9 2 3 8 4 12 4 14a8 8 0 0 0 8 8Z"/>',
 sparkles:'<path d="m12 2 2.1 7 6.9 3-6.9 3L12 22l-2.2-7L3 12l6.8-3ZM20 2v4M18 4h4"/>',
 edit:'<path d="M4 20h16M4 18 18 4l3 3L7 21H4v-3Zm11-11 3 3"/>',
 fish:'<path d="M2 12s6-8 13-6c3 1 5 4 5 6s-2 5-5 6c-7 2-13-6-13-6Zm0 0c2-4 2-4 2-6m-2 6c2 4 2 4 2 6m7-6h.01"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 bubbles:'<circle cx="7" cy="8" r="4"/><circle cx="17" cy="15" r="5"/><circle cx="6" cy="19" r="2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/>',
 volume:'<path d="M5 9H2v6h3l5 5V4L5 9Zm9-1c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
 volumeoff:'<path d="M5 9H2v6h3l5 5V4L5 9Zm9 1 7 7m0-7-7 7"/>',
 shuffle:'<path d="m3 5 4 0c5 0 5 14 10 14h4m-4-3 4 3-4 3M3 19h4c2 0 3-2 4-4m3-6c1-2 2-4 4-4h3m-4-3 4 3-4 3"/>',
 repeat:'<path d="M18 3l3 3-3 3M3 11V9a3 3 0 0 1 3-3h15M6 21l-3-3 3-3m15-2v2a3 3 0 0 1-3 3H3"/>',
 close:'<path d="M5 5 19 19M19 5 5 19"/>',
 refresh:'<path d="M3 12a9 9 0 1 0 3-6m-3-3v5h5"/>',
 headphones:'<path d="M3 14v-3a9 9 0 0 1 18 0v3M3 14h4v7H5a2 2 0 0 1-2-2Zm18 0h-4v7h2a2 2 0 0 0 2-2Z"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',
 map:'<path d="M3 6 9 3l6 3 6-3v15l-6 3-6-3-6 3ZM9 3v15m6-12v15"/>'
};
export function icon(name,size=20){return `<svg aria-hidden="true" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.sparkles}</svg>`;}
export function escapeHtml(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));}
