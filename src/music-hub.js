/**
 * SoundSpace V9 — licensed-platform embeds, never scraped audio.
 * SoundCloud and YouTube media is only loaded after a user clicks Play.
 * The remote player persists across mtunzchill internal routes.
 */
const SOUNDSPACE_VERSION = 9;
const CURATED = [
 {id:'sc-lofi-nest',provider:'soundcloud',url:'https://soundcloud.com/lofidormouse/sets/lofi-nest-chill-music',title:'Lofi Nest',subtitle:'Một tổ nhỏ cho những ngày nhẹ nhàng',mood:'calm',tag:'LOFI • CHILL',art:'assets/room-rain.webp',theme:'lavender'},
 {id:'sc-central-beats',provider:'soundcloud',url:'https://soundcloud.com/ambientlofibeats/sets/central-beats-relaxing-lofi',title:'Relaxing Lofi Mix',subtitle:'Nhịp lofi dịu để học hoặc thư giãn',mood:'focus',tag:'BEATS • TẬP TRUNG',art:'assets/world-rain.webp',theme:'blue'},
 {id:'sc-cozy-nights',provider:'soundcloud',url:'https://soundcloud.com/lofisleep-music/sets/cozy-nights-chill-lofi-mix',title:'Cozy Nights',subtitle:'Chậm lại cùng buổi tối êm ái',mood:'sleep',tag:'NIGHT • LOFI',art:'assets/world-forest.webp',theme:'lavender'},
 {id:'sc-cosmic-cafe',provider:'soundcloud',url:'https://soundcloud.com/lofistudymusic/sets/cosmic-cafe-chill-lofi-mix',title:'Cosmic Café',subtitle:'Một tách cà phê và những giai điệu êm',mood:'cafe',tag:'CAFÉ • BEATS',art:'assets/world-cafe.webp',theme:'orange'},
 {id:'sc-smooth-jazz',provider:'soundcloud',url:'https://soundcloud.com/relaxcafemusic/calm-down',title:'Calm Down',subtitle:'Jazz thư giãn từ Relax Café Music',mood:'cafe',tag:'JAZZ • SOFT',art:'assets/world-cafe.webp',theme:'peach'},
 {id:'sc-ambient',provider:'soundcloud',url:'https://soundcloud.com/sheeknfreek-1/sets/sets-ambient',title:'Ambient Escape',subtitle:'Không gian âm thanh dài để thả lỏng',mood:'sleep',tag:'AMBIENT • REST',art:'assets/world-forest.webp',theme:'green'},
 {id:'sc-chill-days',provider:'soundcloud',url:'https://soundcloud.com/h-musicfr/sets/chill-lofi-day',title:'Chill Lofi Day',subtitle:'Lofi tươi nhẹ cho cả ngày của bạn',mood:'happy',tag:'SUNNY • LOFI',art:'assets/world-beach.webp',theme:'gold'},
 {id:'sc-galaxy',provider:'soundcloud',url:'https://soundcloud.com/filip-grygera/sets/rhythm-chill-out',title:'Galaxy Chillout',subtitle:'Chillout, downtempo và cảm hứng tự do',mood:'calm',tag:'CHILLOUT • MIX',art:'assets/scene-beach.svg',theme:'rose'},
 {id:'yt-lofi-live',provider:'youtube',url:'https://www.youtube.com/watch?v=X4VbdwhkE10',title:'Lofi Girl Radio',subtitle:'Lofi hip hop radio để học và thư giãn',mood:'focus',tag:'LIVE • RADIO',art:'assets/room-rain.webp',theme:'blue'},
 {id:'yt-lofi-relax',provider:'youtube',url:'https://www.youtube.com/watch?v=EWrX250Zhko',title:'Lofi Girl · Slow Time',subtitle:'Nhịp chậm cho một ngày thật thư thái',mood:'calm',tag:'VIDEO • LOFI',art:'assets/world-beach.webp',theme:'peach'}
];
const MOODS = [['all','✦ Tất cả'],['calm','🌷 Thư giãn'],['focus','📚 Tập trung'],['cafe','☕ Quán nhỏ'],['sleep','🌙 Buổi tối'],['happy','☀️ Tươi vui']];
const PROVIDERS=[['all','Tất cả'],['soundcloud','SoundCloud'],['youtube','YouTube']];
const clean = text => String(text??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const storage=(key,fallback)=>{try{const val=JSON.parse(localStorage.getItem('mc_soundspace_'+key));return val??fallback}catch{return fallback}};
const save=(key,val)=>{try{localStorage.setItem('mc_soundspace_'+key,JSON.stringify(val));return true}catch{return false}};
const isValidItem=item=>item&&typeof item.id==='string'&&/^[a-z0-9-]{3,60}$/.test(item.id)&&['youtube','soundcloud'].includes(item.provider)&&typeof item.url==='string'&&item.url.length<=350;
function ownItem(raw){
 if(!isValidItem(raw))return null;
 try{const parsed=parseMusicLink(raw.url);if(parsed.provider!==raw.provider)return null;return{...parsed,id:raw.id,title:String(raw.title||'Bản nhạc của bạn').slice(0,55),subtitle:'Liên kết bạn đã thêm',mood:'own',tag:'CỦA BẠN',art:raw.provider==='youtube'?'assets/world-forest.webp':'assets/room-rain.webp',theme:'lavender'}}catch{return null}
}
let custom=storage('custom',[]).filter(Boolean).map(ownItem).filter(Boolean).slice(0,35);
let favorites=storage('favorites',[]).filter(x=>typeof x==='string').slice(0,80);
let recent=storage('recent',[]).filter(x=>typeof x==='string').slice(0,16);
let activeMood='all',activeProvider='all',activeView='discover',query='';
let dock=null,currentId=null,initialized=false,notice=()=>{};
const allItems=()=>[...CURATED,...custom];
const byId=id=>allItems().find(i=>i.id===id);
const providerTitle=p=>p==='youtube'?'YouTube':'SoundCloud';
const providerIcon=p=>p==='youtube'?'▶':'☁';
function filterItems(){
 let items=activeView==='saved'?allItems().filter(x=>favorites.includes(x.id)):
  activeView==='mine'?custom:activeView==='recent'?recent.map(byId).filter(Boolean):allItems();
 if(activeProvider!=='all')items=items.filter(x=>x.provider===activeProvider);
 if(activeView==='discover'&&activeMood!=='all')items=items.filter(x=>x.mood===activeMood);
 if(query)items=items.filter(x=>(x.title+' '+x.subtitle+' '+x.tag+' '+providerTitle(x.provider)).toLocaleLowerCase('vi-VN').includes(query));
 return items;
}
function card(p){const fav=favorites.includes(p.id),active=currentId===p.id;
 return `<article class="ms-playlist ms-theme-${p.theme} ss-track-card ${active?'ss-is-active':''}">
 <div class="ms-cover"><img src="${clean(p.art)}" loading="lazy" alt="Ảnh minh họa ${clean(p.title)}"><span class="ss-provider ss-provider-${p.provider}">${providerIcon(p.provider)} ${providerTitle(p.provider)}</span><button class="ms-card-play" type="button" data-ss="play" data-id="${clean(p.id)}" aria-label="Nghe ${clean(p.title)}">▶</button></div>
 <div class="ms-card-info"><span class="ms-card-tag">${clean(p.tag)}</span><div class="ms-title-line"><strong>${clean(p.title)}</strong><button class="ms-heart ${fav?'saved':''}" type="button" data-ss="favorite" data-id="${clean(p.id)}" aria-pressed="${fav}" aria-label="${fav?'Bỏ yêu thích':'Yêu thích'} ${clean(p.title)}">${fav?'♥':'♡'}</button></div>
 <p>${clean(p.subtitle)}</p><button type="button" class="ms-listen" data-ss="play" data-id="${clean(p.id)}">Mở trình phát <span>↗</span></button></div></article>`;
}
function resolveSource(url){const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.port)throw Error('Vui lòng dùng liên kết HTTPS hợp lệ.');return u}
export function parseMusicLink(input){
 if(typeof input!=='string'||input.length>500)throw Error('Đường dẫn quá dài.');let u;try{u=resolveSource(input.trim())}catch{throw Error('Liên kết không hợp lệ. Hãy dán đường dẫn từ SoundCloud hoặc YouTube.');}
 const host=u.hostname.toLowerCase();let url,provider;
 if(host==='soundcloud.com'||host==='www.soundcloud.com'||host==='m.soundcloud.com'){
   const p=u.pathname.split('/').filter(Boolean);if(p.length<2||p.length>3||p[0].length>100||p.some(x=>!/^[-a-zA-Z0-9_]{1,120}$/.test(x))||(p.length===3&&p[1]!=='sets'))throw Error('Chỉ hỗ trợ bài hát hoặc playlist SoundCloud công khai.');
   provider='soundcloud';url=`https://soundcloud.com/${p.join('/')}`;
 }else if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtu.be','www.youtu.be'].includes(host)){
   provider='youtube';let id='',list='';
   if(host.includes('youtu.be'))id=u.pathname.replace(/^\//,'');
   else if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
   else if(u.pathname==='/playlist')list=u.searchParams.get('list')||'';
   else if(u.pathname.startsWith('/live/'))id=u.pathname.split('/')[2]||'';
   if(id&&!/^[a-zA-Z0-9_-]{11}$/.test(id))throw Error('Mã video YouTube không hợp lệ.');
   if(list&&!/^[a-zA-Z0-9_-]{12,80}$/.test(list))throw Error('Mã playlist YouTube không hợp lệ.');
   if(!id&&!list)throw Error('Dán đường dẫn video hoặc playlist YouTube, không phải link tìm kiếm.');
   url=list?`https://www.youtube.com/playlist?list=${list}`:`https://www.youtube.com/watch?v=${id}`;
 }else throw Error('Hỗ trợ liên kết chính thức của SoundCloud hoặc YouTube.');
 return {provider,url};
}
function embedSource(p){const url=new URL(p.url);
 if(p.provider==='soundcloud'){
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(p.url)}&color=%2384af88&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=false`;
 }
 let video=url.searchParams.get('v'),list=url.searchParams.get('list');
 if(video&&/^[a-zA-Z0-9_-]{11}$/.test(video))return `https://www.youtube-nocookie.com/embed/${video}?rel=0&playsinline=1`;
 if(list&&/^[a-zA-Z0-9_-]{12,80}$/.test(list))return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(list)}&rel=0&playsinline=1`;
 throw Error('Không mở được liên kết YouTube.');
}
function closeDock(){if(!dock)return;dock.querySelector('.ss-dock-iframe').replaceChildren();dock.hidden=true;currentId=null;dock.classList.remove('is-collapsed');document.querySelector('.ss-current-title')?.replaceChildren(document.createTextNode('Chọn một playlist để bắt đầu'));updateGrid();}
function ensureDock(){if(dock)return dock;
 dock=document.createElement('aside');dock.className='ss-dock';dock.id='musicDock';dock.hidden=true;dock.setAttribute('aria-label','Trình phát nhạc bên ngoài');
 dock.innerHTML=`<header class="ss-dock-header"><div class="ss-dock-brand"><span class="ss-disc" aria-hidden="true">♫</span><div><strong id="ssDockProvider">Music Garden</strong><small id="ssDockTitle">Chọn nhạc bạn thích</small></div></div><div class="ss-dock-actions"><button type="button" data-ssdock="collapse" title="Thu nhỏ" aria-label="Thu nhỏ trình phát">▁</button><button type="button" data-ssdock="close" title="Dừng phát" aria-label="Dừng và đóng trình phát">✕</button></div></header><div class="ss-dock-body"><div class="ss-dock-iframe"></div><div class="ss-dock-footer"><span>Nhạc phát bởi ứng dụng gốc</span><a href="https://soundcloud.com" id="ssExternalLink" target="_blank" rel="noopener noreferrer">Mở trong ứng dụng ↗</a></div></div><button class="ss-dock-open" data-ssdock="expand" type="button" hidden>♫ Mở lại trình phát ▴</button>`;
 document.body.appendChild(dock);
 dock.addEventListener('click',e=>{
  const button=e.target.closest('[data-ssdock]');if(!button)return;
  if(button.dataset.ssdock==='close'){closeDock();return}
  if(button.dataset.ssdock==='collapse'){
    const p=byId(currentId);if(p?.provider==='youtube'){notice('Để tuân thủ điều kiện YouTube, video cần luôn hiển thị khi đang phát.');return;}
    dock.classList.add('is-collapsed');dock.querySelector('.ss-dock-open').hidden=false;
  }else{dock.classList.remove('is-collapsed');dock.querySelector('.ss-dock-open').hidden=true;}
 });
 return dock;
}
function openMusic(id,audio){const p=byId(id);if(!p){notice('Nội dung không có trong thư viện.');return}
 let src;try{src=embedSource(p)}catch(err){notice(err.message);return}
 // Only one music source at a time. The ambient mixer can continue independently.
 audio.pause();const box=ensureDock();let wrap=box.querySelector('.ss-dock-iframe');
 wrap.replaceChildren();const iframe=document.createElement('iframe');iframe.title=`${providerTitle(p.provider)} — ${p.title}`;iframe.src=src;iframe.loading='eager';iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');iframe.setAttribute('allowfullscreen','');iframe.setAttribute('scrolling','no');iframe.className=p.provider==='youtube'?'ss-yt-frame':'ss-sc-frame';wrap.appendChild(iframe);
 box.hidden=false;box.classList.remove('is-collapsed');box.querySelector('.ss-dock-open').hidden=true;box.classList.toggle('ss-youtube-active',p.provider==='youtube');box.querySelector('#ssDockProvider').textContent=providerTitle(p.provider);box.querySelector('#ssDockTitle').textContent=p.title;box.querySelector('#ssExternalLink').href=p.url;
 currentId=id;recent=[id,...recent.filter(x=>x!==id)].slice(0,16);save('recent',recent);
 updateGrid();notice(`Đã mở ${providerTitle(p.provider)}. Nhấn ▶ trong trình phát để nghe.`);
}
function updateGrid(){const root=document.querySelector('.ms-page');if(!root)return;
 const items=filterItems();const grid=root.querySelector('#musicPlaylistGrid');if(grid)grid.innerHTML=items.map(card).join('');
 const counter=root.querySelector('#musicCount');if(counter)counter.textContent=`${items.length} lựa chọn`;
 const empty=root.querySelector('#musicEmpty');if(empty){empty.hidden=items.length>0;empty.textContent=activeView==='saved'?'Chưa có nhạc yêu thích. Chạm ♡ trên một thẻ để lưu.':activeView==='mine'?'Chưa có liên kết của bạn. Dán một link SoundCloud hoặc YouTube ở bên dưới nhé.':activeView==='recent'?'Chưa mở bài hát nào. Cùng chọn một chút nhạc chill nào.':'Không tìm thấy nhạc theo bộ lọc hiện tại.'}
 root.querySelectorAll('[data-ss="tab"]').forEach(b=>{b.classList.toggle('active',b.dataset.id===activeView);b.setAttribute('aria-pressed',String(b.dataset.id===activeView))});
 root.querySelectorAll('[data-ss="provider"]').forEach(b=>{b.classList.toggle('active',b.dataset.id===activeProvider);b.setAttribute('aria-pressed',String(b.dataset.id===activeProvider))});
 root.querySelectorAll('[data-ss="mood"]').forEach(b=>{b.classList.toggle('active',b.dataset.id===activeMood);b.setAttribute('aria-pressed',String(b.dataset.id===activeMood))});
 const moods=root.querySelector('.ss-moods');if(moods)moods.hidden=activeView!=='discover';
 const list=root.querySelector('#musicCustomList');if(list)list.innerHTML=custom.map(x=>`<div class="ss-added-row"><span>${providerIcon(x.provider)} <b>${clean(x.title)}</b><small>${providerTitle(x.provider)}</small></span><button type="button" data-ss="remove" data-id="${clean(x.id)}">Xóa</button></div>`).join('');
 const title=root.querySelector('.ss-current-title');if(title){title.textContent=byId(currentId)?.title||'Chọn một playlist để bắt đầu'}
}
export function musicStudio({tracks,audio,icon,coverPlayer,soundsMixer,presets}){
 const feature=CURATED[0],current=byId(currentId);
 return `<div class="ms-page ss-page"><section class="ms-hero ss-hero"><div class="ms-orb ms-orb-one"></div><div class="ms-orb ms-orb-two"></div><div class="ms-hero-copy"><span class="ms-kicker">✿ MTUNZCHILL MUSIC GARDEN · NGHE NHẠC THẬT</span><h1>Một góc nhạc<br><em>của riêng bạn.</em> ♫</h1><p>Đổi gió với những playlist từ <b>SoundCloud</b> và <b>YouTube</b>. Nghe lofi, chillhop, jazz hay ambient qua trình phát chính thức — và mang âm nhạc theo khi bạn khám phá mtunzchill.</p><div class="ms-hero-buttons"><button type="button" data-ss="play" data-id="${feature.id}" class="ms-main-button">♫ Bật nhạc lofi</button><button type="button" data-ss="scroll-library" class="ms-ghost-button">Khám phá thư viện ↓</button></div><div class="ms-hero-facts"><span>✓ Không cần kết nối mật khẩu</span><span>✓ Playlist công khai từ nghệ sĩ/người tạo</span></div></div><div class="ms-hero-art"><img src="assets/room-rain.webp" alt="Góc phòng êm ấm nhìn ra cửa sổ đêm mưa"><span class="ms-floating-note ms-note-one">♫ Music & slow moments</span><span class="ms-floating-note ms-note-two">☁️ Listen softly</span><span class="ms-floating-spark" aria-hidden="true">✧</span></div></section>
 <section class="ss-source-banner" aria-label="Nguồn phát nhạc"><span class="ss-source-icon">🎧</span><div><strong>Nghe từ ứng dụng bạn thích</strong><p>SoundCloud và YouTube được phát qua player chính thức. Nếu một bài không cho nhúng, bạn vẫn mở được trong ứng dụng gốc.</p></div><button type="button" data-ss="scroll-import" class="ss-source-link">Thêm nhạc của bạn ↗</button></section>
 <div class="ms-layout"><main class="ms-main" id="ms-library"><div class="ms-section-heading"><div><span class="ms-overline">CHỌN NHẠC THEO CẢM XÚC</span><h2>Playlist cho mỗi khoảnh khắc <span>✿</span></h2><p>Thay đổi nguồn nghe, tìm bài hát và lưu các lựa chọn bạn yêu thích.</p></div><span class="ms-total">${CURATED.length} gợi ý đã chọn</span></div>
 <div class="ss-provider-switch" role="group" aria-label="Chọn ứng dụng nghe nhạc">${PROVIDERS.map(([id,label])=>`<button type="button" data-ss="provider" data-id="${id}" class="${activeProvider===id?'active':''}" aria-pressed="${activeProvider===id}">${id==='soundcloud'?'☁':id==='youtube'?'▶':'✦'} ${label}</button>`).join('')}</div>
 <nav class="ms-tabs" aria-label="Mục thư viện">${[['discover','✦ Khám phá'],['saved','♡ Đã lưu'],['recent','◷ Gần đây'],['mine','♫ Của mình']].map(([id,label])=>`<button type="button" data-ss="tab" data-id="${id}" class="${id===activeView?'active':''}" aria-pressed="${id===activeView}">${label}</button>`).join('')}</nav>
 <div class="ms-find-row"><div class="ms-filter-shell"><span aria-hidden="true">⌕</span><input id="musicSearch" type="search" maxlength="80" placeholder="Lofi, jazz, buổi tối, quán cà phê..." aria-label="Tìm nhạc trong thư viện" autocomplete="off" value="${clean(query)}"></div><button class="ms-global-search" type="button" data-ss="external-search">Tìm trên ${activeProvider==='youtube'?'YouTube':'SoundCloud'} ↗</button><span id="musicCount" class="ms-count">${filterItems().length} lựa chọn</span></div>
 <div class="ss-moods ms-mood-filter">${MOODS.map(([id,label])=>`<button type="button" data-ss="mood" data-id="${id}" class="${activeMood===id?'active':''}" aria-pressed="${activeMood===id}">${label}</button>`).join('')}</div>
 <div class="ms-playlist-grid" id="musicPlaylistGrid">${filterItems().map(card).join('')}</div><div id="musicEmpty" class="ms-empty" hidden></div>
 <section class="ms-import ss-import" id="ms-import"><div><span class="ms-overline">TỦ NHẠC CỦA BẠN</span><h2>Có một bài hát yêu thích? ♡</h2><p>Thêm <b>link bài hát hoặc playlist SoundCloud/YouTube</b> vào thư viện riêng trên thiết bị. Không cần API key hay đăng nhập tài khoản nhạc.</p></div><form id="musicImportForm"><label class="ms-label" for="musicExternalLink">Liên kết từ SoundCloud hoặc YouTube</label><div class="ms-import-input"><input required type="url" id="musicExternalLink" maxlength="500" placeholder="https://soundcloud.com/... hoặc https://youtube.com/watch?v=..." autocomplete="off"><button type="submit">+ Thêm nhạc</button></div><label class="ms-label" for="musicExternalName">Đặt tên dễ nhớ (không bắt buộc)</label><input id="musicExternalName" class="ms-custom-name" type="text" maxlength="55" placeholder="Ví dụ: Nhạc nghe trong phòng mưa"><p id="musicImportFeedback" role="status" class="ms-inline-feedback">Chỉ nhận link chính thức từ soundcloud.com và youtube.com / youtu.be.</p></form><div class="ms-custom-list" id="musicCustomList"></div></section>
 <section class="ms-original ss-original"><div class="ms-section-heading"><div><span class="ms-overline">THÊM MỘT CHÚT THƯ GIÃN</span><h2>Nhạc nền mtunzchill</h2><p>Nếu bạn muốn nghe giai điệu tự tạo, vẫn có sẵn player nhỏ này.</p></div></div><div class="ms-original-player">${coverPlayer()}<div class="ms-original-tracks">${tracks.map((t,i)=>`<button type="button" data-action="play-track" data-id="${i}">${icon('play',14)} ${clean(t.title)}</button>`).join('')}</div></div></section></main>
 <aside class="ms-sidebar"><section class="ms-featured ss-selected"><div class="ms-sidebar-title"><h3>🎼 Đang chọn</h3><span>OFFICIAL EMBED</span></div><img src="assets/room-rain.webp" alt="Góc âm nhạc buổi tối" class="ss-selected-cover"><h3 class="ss-current-title">${clean(current?.title||'Chọn một playlist để bắt đầu')}</h3><p>Nhấn vào một thẻ nhạc để mở player nổi. Bạn có thể chuyển sang trò chơi khi đang nghe SoundCloud.</p><button class="ms-open-player" type="button" data-ss="play" data-id="${current?.id||feature.id}">▶ ${current?'Mở lại playlist':'Nghe lofi ngay'}</button><p class="ms-embed-note">Việc phát nhạc có thể bị hạn chế bởi chủ sở hữu hoặc trình duyệt.</p></section>
 <section class="ms-sound-card"><div class="ms-sidebar-title"><h3>🌧️ Mix tiếng thiên nhiên</h3><span>AMBIENT</span></div><p>Chọn thêm tiếng mưa, sóng, gió khi bạn muốn.</p>${presets()}${soundsMixer()}</section>
 <section class="ms-timer-card"><h3>🌙 Hẹn giờ tắt nhạc</h3><p>Khi hết giờ, mtunzchill sẽ đóng trình phát nhúng đang mở và dừng âm thanh riêng.</p><div class="sleep-buttons">${[10,20,30].map(x=>`<button data-action="sleep-timer" data-id="${x}" class="sleep-chip">${x} phút</button>`).join('')}<button data-action="sleep-timer" data-id="0" class="sleep-chip">Hủy</button></div><p class="sleep-status" data-bind="sleep-remaining">Chưa đặt hẹn giờ</p></section><div class="ms-safety-note">🔒 Player bên ngoài chỉ tải sau khi bạn nhấn phát. Bản nhạc không được sao chép hoặc tải lên mtunzchill. Nhạc đã lưu là link trên thiết bị, không tự đồng bộ Neon.</div></aside></div>
 <div class="ms-bottom-banner"><span>🐱</span><div><strong>Nhạc hay hơn, những ngày cũng nhẹ hơn.</strong><small>Mở SoundCloud rồi ghé Cozy Home, ngắm mưa hoặc chăm pet — âm nhạc vẫn ở cùng bạn.</small></div><a class="ms-outline-link" href="#/games/cozy-home">Ghé Cozy Home ↗</a></div></div>`;
}
export function mountMusicStudio({audio,toast}){notice=toast;
 if(!initialized){initialized=true;ensureDock();
  window.addEventListener('mtc:audio-sleep-finished',()=>{closeDock();notice('Đã hết thời gian nghe nhạc.');});
  window.addEventListener('mtc:stop-all-audio',closeDock);
  audio.onChange(s=>{if(s.playing&&currentId)closeDock()});
 }
 const root=document.querySelector('.ms-page');if(!root)return()=>{};
 function click(e){const button=e.target.closest('[data-ss]');if(!button||!root.contains(button))return;e.preventDefault();const a=button.dataset.ss,id=button.dataset.id;
  if(a==='play')openMusic(id,audio);
  else if(a==='scroll-library')root.querySelector('#ms-library')?.scrollIntoView({block:'start',behavior:'smooth'});
  else if(a==='scroll-import')root.querySelector('#ms-import')?.scrollIntoView({block:'start',behavior:'smooth'});
  else if(a==='favorite'){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[id,...favorites].slice(0,80);save('favorites',favorites);updateGrid();toast(favorites.includes(id)?'Đã lưu vào nhạc yêu thích ♡':'Đã bỏ khỏi nhạc yêu thích');}
  else if(a==='provider'){activeProvider=id;activeMood='all';updateGrid();const sr=root.querySelector('.ms-global-search');if(sr)sr.textContent=`Tìm trên ${activeProvider==='youtube'?'YouTube':'SoundCloud'} ↗`;}
  else if(a==='tab'){activeView=id;query='';const search=root.querySelector('#musicSearch');if(search)search.value='';updateGrid();}
  else if(a==='mood'){activeMood=id;updateGrid();}
  else if(a==='remove'){custom=custom.filter(x=>x.id!==id);favorites=favorites.filter(x=>x!==id);save('custom',custom);save('favorites',favorites);if(currentId===id)closeDock();updateGrid();toast('Đã xóa liên kết khỏi thư viện của bạn.');}
  else if(a==='external-search'){const term=(root.querySelector('#musicSearch')?.value||'lofi chill').trim()||'lofi chill';const url=activeProvider==='youtube'?'https://www.youtube.com/results?search_query='+encodeURIComponent(term):'https://soundcloud.com/search?q='+encodeURIComponent(term);window.open(url,'_blank','noopener,noreferrer');}
 }
 function input(e){if(e.target.id==='musicSearch'){query=e.target.value.toLocaleLowerCase('vi-VN').trim();updateGrid();}}
 function submit(e){if(e.target.id!=='musicImportForm')return;e.preventDefault();let feedback=root.querySelector('#musicImportFeedback');try{
  const link=parseMusicLink(root.querySelector('#musicExternalLink').value);
  if(allItems().some(x=>x.url===link.url))throw Error('Đường dẫn này đã có trong thư viện.');
  if(custom.length>=35)throw Error('Thư viện riêng đã đủ 35 liên kết.');
  const title=root.querySelector('#musicExternalName').value.trim().slice(0,55)||`${providerTitle(link.provider)} của mình`;
  const id='my-'+Math.random().toString(36).slice(2,10);
  custom=[{...link,id,title,subtitle:'Link bạn đã lưu',mood:'own',tag:'CỦA BẠN',art:link.provider==='youtube'?'assets/world-forest.webp':'assets/room-rain.webp',theme:'lavender'},...custom];
  save('custom',custom);feedback.textContent='✓ Đã lưu đường dẫn. Nhấn phát để mở trình phát chính thức.';feedback.classList.add('success');
  root.querySelector('#musicExternalLink').value='';root.querySelector('#musicExternalName').value='';activeView='mine';activeProvider='all';query='';root.querySelector('#musicSearch').value='';updateGrid();toast('Đã thêm vào góc nhạc riêng ♡');
 }catch(err){feedback.textContent=err.message;feedback.classList.remove('success');}}
 root.addEventListener('click',click);root.addEventListener('input',input);root.addEventListener('submit',submit);updateGrid();
 return()=>{root.removeEventListener('click',click);root.removeEventListener('input',input);root.removeEventListener('submit',submit)};
}
export function spotifyIsActive(){return!!currentId}
export function stopSpotify(){closeDock()}
export function clearMusicLibrary(){custom=[];favorites=[];recent=[];activeView='discover';activeMood='all';activeProvider='all';query='';for(const name of ['custom','favorites','recent'])try{localStorage.removeItem('mc_soundspace_'+name)}catch{}closeDock()}
