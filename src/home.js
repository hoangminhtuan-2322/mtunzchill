/** mtunzchill — Premium Cozy homepage. View-only, reuses existing app routes/actions. */
export function buildHome(ctx) {
  const { worlds, games, tracks, audio, favorites, lastWorld, lastGame, mood, auth, icon, escapeHtml, coverPlayer, dailyPanel, getNotes } = ctx;
  const hour = new Date().getHours();
  const daypart = hour < 11 ? 'buổi sáng' : hour < 18 ? 'buổi chiều' : 'buổi tối';
  const greeting = auth.user ? `Chào ${escapeHtml(auth.user.display_name)}!` : 'Chào bạn, ghé chơi nhé!';
  const song = tracks[audio.trackIndex] || tracks[0];
  const lastPlace = worlds.find(w => w.id === lastWorld) || worlds[0];
  const lastActivity = games.find(g => g.id === lastGame) || games.find(g => g.id === 'match') || games[0];
  const notebook = getNotes();
  const moodLabel = ({ calm: 'Bình yên', happy: 'Vui vẻ', tired: 'Cần nghỉ ngơi', focus: 'Tập trung' })[mood] || 'Bình yên';
  const emblem = (name) => icon(name, 20);
  const sectionHead = (eyebrow, title, detail, href, linkLabel = 'Xem tất cả') => `<div class="hp-section-head"><div><span class="hp-kicker">${eyebrow}</span><h2>${title}</h2><p>${detail}</p></div>${href ? `<a href="${href}" class="hp-section-more">${linkLabel} ${icon('right', 17)}</a>` : ''}</div>`;
  const quick = [
    {label:'Nghe nhạc',sub:'Giai điệu nhẹ nhàng',href:'#/music',glyph:'music',type:'music'},
    {label:'Khám phá thế giới',sub:'4 nơi chốn bình yên',href:'#/worlds',glyph:'globe',type:'world'},
    {label:'Chơi một chút',sub:`${games.length} hoạt động dễ thương`,href:'#/games',glyph:'gamepad',type:'play'},
    {label:'Hít thở',sub:'Dừng lại 1 phút',href:'#/games/breathe',glyph:'leaf',type:'breathe'},
    {label:'Nhật ký chill',sub:'Viết điều bạn nghĩ',href:'#/journal',glyph:'edit',type:'note'},
    {label:'Góc của mình',sub:auth.user?'Dữ liệu đã kết nối':'Cất giữ điều yêu thích',href:auth.user?'#/profile':'#/auth/login',glyph:'heart',type:'self'}
  ];
  const worldEyebrows = {rain:'COZY RAIN', beach:'GOLDEN HOUR', forest:'NIGHT FOREST', cafe:'LOFI CORNER'};
  const worldEmojis = {rain:'🌧️', beach:'🌅', forest:'✨', cafe:'☕'};
  const worldCards = worlds.map((w, i) => {
    const saved = favorites.worlds.includes(w.id);
    return `<article class="hp-world hp-enter" style="--delay:${i * 75}ms"><a class="hp-world-poster" href="#/worlds/${w.id}" aria-label="Bước vào ${escapeHtml(w.name)}"><img src="${w.id==='rain'?'assets/room-rain.webp':w.scene}" alt="Cảnh ${escapeHtml(w.name)}" loading="lazy" decoding="async"><span class="hp-world-weather" aria-hidden="true">${worldEmojis[w.id] || '🌿'}</span><span class="hp-world-entry">Bước vào ${icon('right', 16)}</span></a><div class="hp-world-text"><small>${worldEyebrows[w.id] || 'COZY WORLD'}</small><div class="hp-world-name"><a href="#/worlds/${w.id}">${escapeHtml(w.name)}</a><button type="button" data-action="favorite-world" data-id="${w.id}" aria-label="${saved?'Bỏ yêu thích':'Yêu thích'} ${escapeHtml(w.name)}" class="hp-fave ${saved?'saved':''}">${icon(saved?'heart-full':'heart',18)}</button></div><p>${escapeHtml(w.subtitle)}</p></div></article>`;
  }).join('');
  const gameCards = games.filter(g => g.id !== 'breathe').map((g, i) => `<a class="hp-game hp-enter" style="--delay:${i * 65}ms" href="#/games/${g.id}"><div class="hp-game-art hp-game-${g.id}"><img src="${g.image}" alt="Minh họa ${escapeHtml(g.name)}" loading="lazy" decoding="async"><span aria-hidden="true" class="hp-game-play">${icon('play',17)}</span></div><div class="hp-game-meta"><span class="hp-game-tag">${escapeHtml(g.tag.split('·')[0].trim())}</span><strong>${escapeHtml(g.name)}</strong><p>${escapeHtml(g.desc)}</p><span class="hp-game-go">Chơi ngay ${icon('right',15)}</span></div></a>`).join('');
  const soundPresets = [
    ['rain','Mưa bên hiên','🌧️'],['beach','Biển chiều','🌊'],['forest','Rừng xanh','🌲'],['cafe','Quán cà phê','☕']
  ].map(([id,label,glyph])=>`<button type="button" class="hp-amb-btn hp-amb-${id}" data-action="sound-preset" data-id="${id}" aria-label="Bật bầu không khí ${label}"><span class="hp-amb-emoji">${glyph}</span><span>${label}</span>${icon('play',14)}</button>`).join('');
  const recentWorld = `<a href="#/worlds/${lastPlace.id}" class="hp-recent-link"><img src="${lastPlace.image}" alt="" loading="lazy"><div><small>${lastWorld?'THẾ GIỚI GẦN ĐÂY':'GỢI Ý CHO BẠN'}</small><strong>${escapeHtml(lastPlace.name)}</strong><span>Bước vào khung cảnh ${escapeHtml(lastPlace.subtitle.toLowerCase())}</span></div>${icon('right',18)}</a>`;
  const recentGame = `<a href="#/games/${lastActivity.id}" class="hp-recent-link"><img src="${lastActivity.image}" alt="" loading="lazy"><div><small>${lastGame?'TRÒ CHƠI VỪA CHƠI':'THỬ MỘT TRÒ NHẸ NHÀNG'}</small><strong>${escapeHtml(lastActivity.name)}</strong><span>${escapeHtml(lastActivity.desc)}</span></div>${icon('right',18)}</a>`;
  const journalLink = `<a href="#/journal" class="hp-recent-link hp-recent-note"><span class="hp-recent-icon">${icon('edit',23)}</span><div><small>GÓC RIÊNG CỦA BẠN</small><strong>Nhật ký chill</strong><span>${notebook.length ? `Bạn đã lưu ${notebook.length} ghi chú` : 'Viết một dòng cho hôm nay cũng được'}</span></div>${icon('right',18)}</a>`;
  return `<div class="homepage">
    <section class="hp-hero hp-enter" aria-labelledby="hpHeroTitle">
      <div class="hp-hero-stars" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="hp-hero-copy">
        <span class="hp-overline"><span aria-hidden="true">✦</span> YOUR LITTLE COZY UNIVERSE</span>
        <span class="hp-hi">${greeting} <span class="hp-hi-wave" aria-hidden="true">🌷</span></span>
        <h1 id="hpHeroTitle">Một khoảng trời<br><em>thật chill</em><br>cho riêng bạn<span class="hp-dot">.</span></h1>
        <p>Gác lại những điều vội vã. Nghe một giai điệu dịu êm, chơi vài trò xinh xắn và dạo bước trong những thế giới hoạt hình đầy màu sắc.</p>
        <div class="hp-hero-actions"><a href="#/worlds/rain" class="hp-hero-main">${icon('globe',19)} Bước vào thế giới ${icon('right',17)}</a><button type="button" class="hp-hero-secondary" data-action="toggle-play" data-keep-label="Bật nhạc chill">${icon(audio.playing?'pause':'play',19)} ${audio.playing?'Tạm dừng nhạc':'Bật nhạc chill'}</button></div>
        <div class="hp-hero-proof"><div class="hp-proof-icons" aria-hidden="true"><span>🐱</span><span>🌙</span><span>🌸</span></div><span>Không cần vội, cứ là chính bạn thôi ♡</span></div>
      </div>
      <div class="hp-hero-visual"><img class="hp-hero-landscape" src="assets/hero-world.webp" alt="Hòn đảo hoạt hình với căn nhà gỗ, hồ sen, cây hoa anh đào và mèo Mochi" fetchpriority="high"><div class="hp-hero-bloom" aria-hidden="true">✿</div><div class="hp-hero-note hp-float-a">${icon('headphones',17)} Lofi & những ngày êm</div><a href="#/worlds/rain" class="hp-hero-note hp-float-b" aria-label="Vào phòng mưa">🌦️ Phòng mưa ấm áp ${icon('right',13)}</a><span class="hp-hero-sticker" aria-hidden="true">✧ slow down & stay awhile</span></div>
    </section>
    <div class="hp-content">
      <div class="hp-ribbon" aria-label="Khám phá nhanh"><span>✦ BẠN MUỐN CHILL THEO CÁCH NÀO?</span><span>♫ Nhạc êm&nbsp; · &nbsp;🌷 Trò xinh&nbsp; · &nbsp;☁️ Không gian dịu</span></div>
      <section class="hp-quick-wrap" aria-label="Lối vào nhanh"><div class="hp-quick-grid">${quick.map((q,i)=>`<a href="${q.href}" class="hp-quick hp-quick-${q.type} hp-enter" style="--delay:${i*55}ms"><span class="hp-quick-symbol">${emblem(q.glyph)}</span><span class="hp-quick-label"><strong>${q.label}</strong><small>${q.sub}</small></span>${icon('right',16)}</a>`).join('')}</div></section>
      <section class="hp-world-section" aria-labelledby="hpWorldTitle">${sectionHead('✿ FIND YOUR HAPPY PLACE','Những thế giới bé xinh <span aria-hidden="true">🌸</span>','Một nơi trú ẩn dịu dàng đang đợi bạn khám phá.','#/worlds','Tất cả thế giới')}<div class="hp-world-grid">${worldCards}</div></section>
      <div class="hp-duo"><section class="hp-listen-panel" aria-labelledby="hpListenTitle"><div class="hp-panel-deco" aria-hidden="true">♫</div><div class="hp-panel-heading"><span class="hp-kicker">✦ NOW PLAYING</span><h2 id="hpListenTitle">Nhạc dành cho <em>khoảnh khắc này</em></h2><p>Những giai điệu nguyên bản, phối cùng âm thanh thiên nhiên. Nhạc vẫn phát khi bạn khám phá các trang khác.</p></div><div class="hp-music-inner">${coverPlayer()}</div><div class="hp-track-picker">${tracks.slice(0,3).map((t,i)=>`<button type="button" data-action="play-track" data-id="${i}" class="hp-track ${audio.trackIndex===i?'selected':''}"><img src="${t.image}" alt=""><span><strong>${escapeHtml(t.title)}</strong><small>${escapeHtml(t.subtitle)}</small></span>${icon('play',15)}</button>`).join('')}</div><a class="hp-panel-link" href="#/music">Khám phá góc âm nhạc ${icon('right',15)}</a></section>
      <section class="hp-atmosphere-panel" aria-labelledby="hpAmbTitle"><div class="hp-panel-heading"><span class="hp-kicker">☁️ AMBIENT STUDIO</span><h2 id="hpAmbTitle">Bạn thích bầu không khí nào?</h2><p>Chọn một khung cảnh âm thanh. Tự phối mưa, sóng, gió và tiếng lửa ở trang Âm nhạc.</p></div><div class="hp-atmosphere-art" aria-hidden="true"><span class="hp-amb-cloud cloud-one">☁</span><span class="hp-amb-cloud cloud-two">☁</span><span class="hp-amb-sun">☀</span><span class="hp-amb-hill">✿ &nbsp; ✿ &nbsp; ✿</span></div><div class="hp-amb-grid">${soundPresets}</div><a class="hp-panel-link" href="#/music">Mở bộ trộn âm thanh ${icon('right',15)}</a></section></div>
      <section class="hp-cozy-feature" aria-label="Trò chơi nuôi pet và xây nhà"><div class="hp-cozy-feature-visual"><img loading="lazy" src="assets/cozy-home-cover.svg" alt="Căn nhà hoạt hình có mèo nhỏ và khu vườn"/></div><div class="hp-cozy-feature-copy"><span class="hp-kicker">✿ NEW LITTLE WORLD</span><h2>Nuôi pet, dựng một ngôi nhà <em>cho riêng bạn</em></h2><p>Chọn mèo, cún hoặc thỏ. Trang trí phòng, chăm vườn hoa và cùng bạn nhỏ tận hưởng từng ngày thật êm. Có thể lưu tiến trình lên tài khoản.</p><a class="hp-cozy-feature-cta" href="#/games/cozy-home">🏡 Bước vào Cozy Home ${icon('right',17)}</a></div></section>
      <section class="hp-games-section" aria-labelledby="hpGamesTitle">${sectionHead('✧ A LITTLE FUN EVERY DAY','Chơi một chút, vui cả ngày <span aria-hidden="true">🎮</span>','Không áp lực thắng thua, chỉ có những điều dễ thương.','#/games','Kho trò chơi')}<div class="hp-games-grid">${gameCards}</div><a class="hp-breathe-link" href="#/games/breathe"><span class="hp-breathe-orb" aria-hidden="true">✿</span><span><small>MỘT PHÚT CHO CHÍNH MÌNH</small><strong>Hít vào dịu dàng, thở ra nhẹ nhõm</strong></span><span class="hp-breathe-cta">Thở cùng mình ${icon('right',17)}</span></a></section>
      <section class="hp-personal-section" aria-labelledby="hpPersonalTitle"><div class="hp-personal-header"><div><span class="hp-kicker">✿ YOUR SLOW MOMENTS</span><h2 id="hpPersonalTitle">Dành riêng cho ${auth.user?'bạn':'một ngày dịu dàng'}</h2><p>${auth.user?`${greeting} Hôm nay bạn đang cảm thấy ${moodLabel.toLowerCase()}?`:`Chọn điều khiến bạn thấy thoải mái trong ${daypart} này.`}</p></div><a href="${auth.user?'#/profile':'#/auth/register'}" class="hp-section-more">${auth.user?'Góc của mình':'Tạo góc riêng'} ${icon('right',16)}</a></div><div class="hp-personal-grid"><div class="hp-resume-panel"><span class="hp-microhead">↗ TIẾP TỤC TẬN HƯỞNG</span>${recentWorld}${recentGame}${journalLink}</div><div class="hp-daily-panel">${dailyPanel()}</div></div></section>
      <section class="hp-final-cta"><div class="hp-cta-sprinkle" aria-hidden="true">✿</div><div><span class="hp-kicker">♡ A LITTLE SPACE JUST FOR YOU</span><h2>${auth.user?'Góc chill của bạn luôn ở đây.':'Để những khoảnh khắc êm dịu ở lại.'}</h2><p>${auth.user?'Khám phá thêm, viết vài dòng nhật ký và lưu những thế giới bạn yêu thích.':'Đăng ký tài khoản để lưu nhật ký, mục yêu thích và hành trình thư giãn của bạn trên nhiều thiết bị.'}</p></div><a class="hp-cta-action" href="${auth.user?'#/profile':'#/auth/register'}">${auth.user?'Vào góc của mình':'Tạo tài khoản miễn phí'} ${icon('right',17)}</a></section>
      <p class="hp-footer-whisper">✦ Gửi bạn một chút bình yên. Hẹn gặp nhau ở một góc thật chill. ♡</p>
    </div>
  </div>`;
}
