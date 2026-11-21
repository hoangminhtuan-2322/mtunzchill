/** Cozy Home: relaxed long-term progression. Pure state, no pay-to-win or timers that hurt pets.
 * Stored inside the legacy v1 cozyHome snapshot to preserve existing saves.
 */
import {escapeHtml} from './data.js';
const numeric=(value,min,max,fallback=0)=>Number.isFinite(Number(value))?Math.max(min,Math.min(max,Math.floor(Number(value)))):fallback;
const text=(v,n=24)=>typeof v==='string'?v.replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,n):'';
const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export const CROPS=[
 {id:'daisy',name:'Cúc mật ong',emoji:'🌼',minute:1,cost:4,reward:12,xp:9,detail:'Một bông hoa nhỏ nở rất nhanh'},
 {id:'berry',name:'Dâu ngọt',emoji:'🍓',minute:5,cost:10,reward:25,xp:17,detail:'Trái đỏ ngọt cho một ngày êm'},
 {id:'mint',name:'Bạc hà',emoji:'🌿',minute:15,cost:18,reward:44,xp:26,detail:'Khu vườn thoảng hương mát'},
 {id:'moon',name:'Hoa trăng',emoji:'🌙',minute:45,cost:32,reward:76,xp:42,detail:'Một loài hoa lấp lánh lúc đêm'}
];
const cropBy=id=>CROPS.find(c=>c.id===id);
const QUESTS=[
 {id:'care',emoji:'💗',name:'Chăm bạn nhỏ',detail:'Chăm sóc pet 3 lần',target:3,coins:20,xp:20},
 {id:'sow',emoji:'🌱',name:'Gieo mầm vui',detail:'Trồng 2 luống cây',target:2,coins:24,xp:24},
 {id:'harvest',emoji:'🍓',name:'Mùa thu hoạch',detail:'Thu hoạch 1 cây',target:1,coins:18,xp:20},
 {id:'decor',emoji:'🪑',name:'Sắp xếp tổ ấm',detail:'Đặt hoặc chuyển một món đồ',target:1,coins:14,xp:16}
];
const BADGES=[
 {id:'first-care',emoji:'💝',name:'Cái ôm đầu tiên',rule:s=>s.adventure.stats.care>=1},
 {id:'gardener',emoji:'🌱',name:'Người làm vườn',rule:s=>s.adventure.stats.harvest>=1},
 {id:'seed-keeper',emoji:'🌿',name:'Nhà trồng cây',rule:s=>s.adventure.stats.harvest>=15},
 {id:'decorator',emoji:'🏡',name:'Nhà thiết kế',rule:s=>s.adventure.stats.decor>=10},
 {id:'explorer',emoji:'🗺️',name:'Dạo khắp nơi',rule:s=>s.adventure.stats.scout>=7},
 {id:'souvenir',emoji:'📸',name:'Người lưu kỷ niệm',rule:s=>s.adventure.photos.length>=6},
 {id:'friendship',emoji:'🐾',name:'Bạn thân bốn chân',rule:s=>s.adventure.friends.length>=1},
 {id:'collector',emoji:'✨',name:'Kho báu nhỏ',rule:s=>s.adventure.stickers.length>=6},
 {id:'homey',emoji:'🪟',name:'Nhà có gác xép',rule:s=>s.adventure.loft===true},
 {id:'level5',emoji:'👑',name:'Chill cấp 5',rule:s=>levelOf(s)>=5},
 {id:'sunny',emoji:'☀️',name:'Người kiên nhẫn',rule:s=>s.adventure.stats.days>=7},
 {id:'moon-garden',emoji:'🌙',name:'Hoa dưới trăng',rule:s=>s.adventure.stats.moon>=1}
];
const DESTINATIONS=[
 {id:'meadow',emoji:'🌷',name:'Đồi hoa',detail:'Mây trôi trên thảm hoa pastel'},
 {id:'woods',emoji:'🪲',name:'Rừng đom đóm',detail:'Một khúc rừng lấp lánh'},
 {id:'beach',emoji:'🐚',name:'Bãi biển',detail:'Nhặt một chiếc vỏ sò xinh'},
 {id:'market',emoji:'🎐',name:'Phiên chợ nhỏ',detail:'Quán hàng thơm mùi bánh'}
];
const STICKERS=["🌷","🦋","🐚","🍄","🪄","🍡","🧁","🪴","🎏","☁️","🌈","🐞"];
const SPACES=['bedroom','garden','loft'];
export const cozyLevel=xp=>Math.min(30,1+Math.floor(Math.sqrt(Math.max(0,xp)/65)));
export const levelOf=s=>cozyLevel(s.adventure?.xp||0);
const neededFor=level=>Math.max(0,65*Math.max(0,level-1)**2);
function blank(){return {xp:0,loft:false,plots:[null,null,null],daily:{date:dateKey(),counts:{care:0,sow:0,harvest:0,decor:0},claimed:[],gift:false},stats:{care:0,sow:0,harvest:0,decor:0,scout:0,moon:0,days:0},lastVisited:'',friends:[],stickers:[],photos:[],lastScout:'',lastRewardAction:0};}
function petValue(v){return{kind:['cat','dog','bunny'].includes(v?.kind)?v.kind:'cat',name:text(v?.name,20)||'Bạn nhỏ',fullness:numeric(v?.fullness,0,100,80),joy:numeric(v?.joy,0,100,80),energy:numeric(v?.energy,0,100,80)};}
export function normalizeAdventure(v){const d=blank();if(!isObj(v))return d;
 d.xp=numeric(v.xp,0,1e7);d.loft=v.loft===true;
 d.plots=Array.from({length:3},(_,i)=>{const p=Array.isArray(v.plots)?v.plots[i]:null;return cropBy(p?.id)?{id:p.id,at:numeric(p.at,0,Date.now(),Date.now())}:null});
 const q=isObj(v.daily)?v.daily:{};d.daily.date=/^\d{4}-\d{2}-\d{2}$/.test(q.date||'')?q.date:dateKey();
 for(const k of Object.keys(d.daily.counts))d.daily.counts[k]=numeric(q.counts?.[k],0,1000);
 d.daily.claimed=Array.isArray(q.claimed)?[...new Set(q.claimed.filter(x=>QUESTS.some(z=>z.id===x)))]:[];
 d.daily.gift=q.gift===true;
 for(const k of Object.keys(d.stats))d.stats[k]=numeric(v.stats?.[k],0,100000);
 d.lastVisited=/^\d{4}-\d{2}-\d{2}$/.test(v.lastVisited||'')?v.lastVisited:'';
 d.friends=Array.isArray(v.friends)?v.friends.filter(isObj).slice(0,2).map(petValue):[];
 d.stickers=Array.isArray(v.stickers)?[...new Set(v.stickers.filter(x=>typeof x==='string'&&STICKERS.includes(x)))].slice(0,12):[];
 d.photos=Array.isArray(v.photos)?v.photos.filter(isObj).slice(-24).map(p=>({at:numeric(p.at,0,Date.now(),Date.now()),name:text(p.name,20),kind:['cat','dog','bunny'].includes(p.kind)?p.kind:'cat',place:SPACES.includes(p.place)?p.place:'bedroom',theme:['peach','mint','lavender'].includes(p.theme)?p.theme:'peach'})):[];
 d.lastScout=/^\d{4}-\d{2}-\d{2}$/.test(v.lastScout||'')?v.lastScout:'';
 d.lastRewardAction=numeric(v.lastRewardAction,0,Date.now(),0);
 return d;
}
export function ensureAdventure(s){if(!s.adventure)s.adventure=blank();const a=s.adventure,now=dateKey();if(a.daily.date!==now)a.daily={date:now,counts:{care:0,sow:0,harvest:0,decor:0},claimed:[],gift:false};
 if(a.lastVisited!==now){a.lastVisited=now;a.stats.days=Math.min(100000,a.stats.days+1)}
 return a;}
export function tickXp(s,amount){const a=ensureAdventure(s),before=levelOf(s);a.xp=Math.min(10000000,a.xp+Math.max(0,amount));const after=levelOf(s);return after>before?` ✨ Lên cấp ${after}!`:'';}
export function recordAdventure(s,type){const a=ensureAdventure(s);if(!Object.hasOwn(a.stats,type)&&type!=='decor')return '';
 // Avoid farming care XP by clicking a button repeatedly.
 if(type==='care'&&Date.now()-a.lastRewardAction<4500)return '';
 if(type==='care')a.lastRewardAction=Date.now();
 a.stats[type]=Math.min(100000,a.stats[type]+1);
 if(Object.hasOwn(a.daily.counts,type))a.daily.counts[type]=Math.min(1000,a.daily.counts[type]+1);
 return tickXp(s,{care:5,sow:7,harvest:12,decor:3,scout:10,moon:0}[type]||0);
}
function earn(s,coins,xp){s.sun=Math.min(20000,s.sun+coins);return tickXp(s,xp);}
function updateBadges(s){return BADGES.filter(b=>b.rule(s));}
export const statusAdventure=s=>{const a=ensureAdventure(s),level=levelOf(s);return{level,percent:Math.max(0,Math.min(100,Math.round((a.xp-neededFor(level))/(neededFor(level+1)-neededFor(level))*100))),badges:updateBadges(s).length}};
const tr=t=>escapeHtml(String(t));
const shortDate=d=>new Date(d).toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
const formatDuration=ms=>ms<=0?'Đã lớn 🌼':ms<60000?'Dưới 1 phút':`${Math.ceil(ms/60000)} phút`;
function progressBar(current,target){return `<div class="cx-meter" aria-hidden="true"><span style="width:${Math.min(100,Math.round(current/target*100))}%"></span></div>`}
export function adventureHeader(s){const a=ensureAdventure(s),v=statusAdventure(s),todayReady=!!a.daily.gift;
 const month=new Date().getMonth();const season=month>=2&&month<=4?'Mùa hoa':month>=5&&month<=7?'Mùa nắng':month>=8&&month<=10?'Mùa lá':'Mùa sao';
 return `<div class="cx-progress-header"><div class="cx-progress-title"><span>✨ CHUYẾN PHIÊU LƯU BÌNH YÊN</span><strong>Cozy Home · ${season}</strong><small>Tự do chơi theo nhịp của bạn — không có ngày nào bị bỏ lỡ.</small></div><div class="cx-level"><b>Cấp ${v.level}</b>${progressBar(v.percent,100)}<small>${a.xp} XP · ${v.percent}% đến cấp sau</small></div><button class="cx-daily ${todayReady?'collected':''}" type="button" data-cozy="gift" ${todayReady?'disabled':''}>${todayReady?'🎁 Đã nhận quà hôm nay':'🎁 Nhận quà hôm nay · +20 ☀'}</button></div>`;
}
export function adventureWorld(s,tab='garden'){
 const a=ensureAdventure(s),status=statusAdventure(s),now=Date.now();const pages=[['garden','🌱','Vườn thu hoạch'],['quests','📜','Thử thách nhẹ'],['friends','🐾','Bạn nhỏ'],['album','📷','Bộ sưu tập']];
 const tabs=`<div class="cx-tabs" role="tablist" aria-label="Khám phá Cozy Home">${pages.map(([id,emoji,label])=>`<button role="tab" aria-selected="${tab===id}" data-cozy="adventure-tab" data-tab="${id}" class="${id===tab?'active':''}">${emoji} ${label}</button>`).join('')}</div>`;
 let content='';
 if(tab==='garden'){
  content=`<div class="cx-panel-head"><div><span class="eyebrow">🌼 GROW AT YOUR OWN PACE</span><h3>Khu vườn bốn mùa</h3><p>Trồng cây, quay lại khi cây lớn và thu hoạch để có thêm Hạt nắng. Thời gian vẫn trôi khi bạn đóng trang.</p></div><span class="cx-chip">${a.plots.filter(Boolean).length}/3 luống đang gieo</span></div><div class="cx-plots">${a.plots.map((plot,i)=>{
   const crop=cropBy(plot?.id),left=crop?plot.at+crop.minute*60000-now:0;
   return `<div class="cx-plot ${crop?'planted':''} ${crop&&left<=0?'ready':''}"><div class="cx-dirt"><span>${crop?crop.emoji:'🌱'}</span><i></i></div><strong>${crop?crop.name:`Luống đất ${i+1}`}</strong><small ${crop?'data-cx-grow="'+i+'"':''}>${crop?formatDuration(left):'Sẵn sàng gieo mầm'}</small>${crop?`<button type="button" data-cozy="harvest" data-slot="${i}" ${left>0?'disabled':''}>${left<=0?'🧺 Thu hoạch':'🌱 Đang lớn'}</button>`:`<span class="cx-empty-tip">Chọn hạt giống phía dưới</span>`}</div>`;
  }).join('')}</div><div class="cx-seed-row">${CROPS.map(c=>`<div class="cx-seed"><span>${c.emoji}</span><div><strong>${c.name}</strong><small>${c.minute} phút · ${c.detail}</small></div><button type="button" data-cozy="sow" data-item="${c.id}" ${a.plots.every(Boolean)||s.sun<c.cost?'disabled':''}>${c.cost} ☀ Gieo</button></div>`).join('')}</div>`;
 }
 else if(tab==='quests'){
  content=`<div class="cx-panel-head"><div><span class="eyebrow">💌 A LITTLE JOY EACH DAY</span><h3>Bốn hoạt động cho hôm nay</h3><p>Không bắt buộc hoàn thành; nhiệm vụ đổi theo ngày và không có chuỗi ngày gây áp lực.</p></div><span class="cx-chip">${a.daily.claimed.length}/4 món quà</span></div><div class="cx-quest-grid">${QUESTS.map(q=>{const cur=a.daily.counts[q.id]||0,complete=cur>=q.target,claimed=a.daily.claimed.includes(q.id);return `<article class="cx-quest"><div class="cx-quest-icon">${q.emoji}</div><div><strong>${q.name}</strong><p>${q.detail}</p>${progressBar(cur,q.target)}<small>${Math.min(cur,q.target)}/${q.target} · +${q.coins} ☀ · +${q.xp} XP</small></div><button type="button" data-cozy="claim" data-item="${q.id}" ${!complete||claimed?'disabled':''}>${claimed?'Đã nhận':'Nhận quà'}</button></article>`}).join('')}</div>`;
 }
 else if(tab==='friends'){
  content=`<div class="cx-panel-head"><div><span class="eyebrow">🐾 FRIENDS FOREVER</span><h3>Hội bạn bốn chân</h3><p>Thêm bạn mới để đổi pet đồng hành, thay đổi phong cách căn nhà và chăm từng bạn nhỏ.</p></div><span class="cx-chip">${1+a.friends.length}/3 pet</span></div><div class="cx-friends"><article class="cx-friend main"><span class="cx-friend-face">${({cat:'🐱',dog:'🐶',bunny:'🐰'})[s.pet.kind]}</span><div><strong>${tr(s.pet.name)}</strong><small>Đang đi cùng bạn ♡</small></div><span class="cx-tag">Đồng hành</span></article>${a.friends.map((p,i)=>`<article class="cx-friend"><span class="cx-friend-face">${({cat:'🐱',dog:'🐶',bunny:'🐰'})[p.kind]}</span><div><strong>${tr(p.name)}</strong><small>Đang nghỉ ngơi ở nhà</small></div><button type="button" data-cozy="switch-pet" data-slot="${i}">Chọn pet</button></article>`).join('')}</div><div class="cx-adopt"><div><h4>Đón thêm một người bạn</h4><p>Cấp 2 trở lên, 120 ☀ mỗi bạn. Mọi pet đều được chăm sóc nhẹ nhàng, không bị phạt khi nghỉ chơi.</p></div><label for="cxPetKind">Bạn muốn đón ai?</label><select id="cxPetKind"><option value="cat">🐱 Mèo nhỏ</option><option value="dog">🐶 Cún bông</option><option value="bunny">🐰 Thỏ trắng</option></select><label for="cxPetName">Đặt tên</label><input type="text" maxlength="20" id="cxPetName" value="Mochi 2" autocomplete="off"><button type="button" data-cozy="adopt" ${a.friends.length>=2||status.level<2||s.sun<120?'disabled':''}>${a.friends.length>=2?'Nhà đã đủ ba pet':status.level<2?'Mở ở cấp 2':s.sun<120?'Cần 120 ☀':'♡ Đón về nhà · 120 ☀'}</button></div>`;
 }
 else if(tab==='album'){
  const badges=updateBadges(s);content=`<div class="cx-panel-head"><div><span class="eyebrow">📸 KEEP THE LITTLE MEMORIES</span><h3>Album của riêng bạn</h3><p>Chụp ảnh lưu kỷ niệm với pet, sưu tầm sticker khi dạo chơi và từ từ mở huy hiệu.</p></div><span class="cx-chip">${badges.length}/${BADGES.length} huy hiệu</span></div><div class="cx-album-actions"><button type="button" data-cozy="photo" ${a.photos.length>=24?'disabled':''}>📸 Chụp ảnh kỷ niệm</button><span>${a.photos.length}/24 tấm ảnh</span></div><div class="cx-photos">${a.photos.length?a.photos.slice().reverse().slice(0,8).map(p=>`<div class="cx-photo ${p.theme}"><span class="cx-photo-art">${({cat:'🐱',dog:'🐶',bunny:'🐰'})[p.kind]}<i>✿</i></span><strong>${tr(p.name)}</strong><small>${shortDate(p.at)}</small></div>`).join(''):'<div class="cx-empty-album">☁️ Chưa có ảnh nào. Chụp một bức thật xinh để giữ lại nhé!</div>'}</div><h4>Chuyến đi sưu tầm</h4><p class="cx-album-note">Mỗi ngày bạn có thể khám phá một địa điểm, nhận sticker bất ngờ và một ít hạt nắng.</p><div class="cx-scout-list">${DESTINATIONS.map(dest=>`<button type="button" data-cozy="scout" data-item="${dest.id}" ${a.lastScout===dateKey()?'disabled':''}><span>${dest.emoji}</span><strong>${dest.name}</strong><small>${dest.detail}</small></button>`).join('')}</div><h4>Sticker (${a.stickers.length}/${STICKERS.length})</h4><div class="cx-stickers">${STICKERS.map(st=>`<span class="${a.stickers.includes(st)?'owned':''}" title="${a.stickers.includes(st)?'Đã sưu tầm':'Chưa tìm thấy'}">${a.stickers.includes(st)?st:'✦'}</span>`).join('')}</div><h4>Huy hiệu đã mở khóa</h4><div class="cx-badges">${BADGES.map(b=>`<div class="${badges.some(x=>x.id===b.id)?'earned':''}"><span>${badges.some(x=>x.id===b.id)?b.emoji:'🔒'}</span><small>${b.name}</small></div>`).join('')}</div>`;
 }
 const loftOpen=a.loft;
 return `<section id="cozyAdventure" class="cx-world"><div class="cx-world-top"><div><span class="eyebrow">☁️ THE COZY JOURNEY</span><h2>Thế giới nhỏ, điều thú vị không hết ♡</h2><p>Mỗi hôm khám phá một chút thôi, chẳng cần chạy đua với ai.</p></div><div class="cx-unlock"><strong>🪟 Gác xép sáng tạo</strong><small>${loftOpen?'Đã mở khóa — chọn ở khu vực nhà':'Mở khóa tại cấp 3, tốn 180 hạt nắng'}</small><button type="button" data-cozy="unlock-loft" ${loftOpen||status.level<3||s.sun<180?'disabled':''}>${loftOpen?'Đã mở khóa':status.level<3?'Cần cấp 3':s.sun<180?'Cần 180 ☀':'🏡 Mở gác xép · 180 ☀'}</button></div></div>${tabs}<div class="cx-tab-body" role="tabpanel">${content}</div></section>`;
}
export function adventureAction(s,action,{id='',slot=-1,name='',kind='cat'}={}){
 const a=ensureAdventure(s),d=a.daily,now=Date.now(),status=statusAdventure(s);
 if(action==='gift'){
  if(d.gift)return{ok:false,message:'Hôm nay bạn đã nhận quà rồi nhé.'};d.gift=true;
  return{ok:true,message:`Một món quà nho nhỏ: +20 ☀!${earn(s,20,12)}`};
 }
 if(action==='sow'){
  const crop=cropBy(id),index=a.plots.findIndex(p=>!p);if(!crop||index<0||s.sun<crop.cost)return{ok:false,message:'Không đủ hạt nắng hoặc vườn đã đầy.'};
  s.sun-=crop.cost;a.plots[index]={id:crop.id,at:now};
  const up=recordAdventure(s,'sow');return{ok:true,message:`Đã gieo ${crop.name}. Hẹn cây lớn nhé! 🌱${up}`};
 }
 if(action==='harvest'){
  if(slot<0||slot>=3)return{ok:false};const crop=cropBy(a.plots[slot]?.id),plot=a.plots[slot];
  if(!crop||now<plot.at+crop.minute*60000)return{ok:false,message:'Cây vẫn đang lớn, chờ thêm một chút nhé.'};
  a.plots[slot]=null;const up=recordAdventure(s,'harvest');if(crop.id==='moon')a.stats.moon++;
  return{ok:true,message:`Thu hoạch ${crop.name}: +${crop.reward} ☀!${earn(s,crop.reward,crop.xp)}${up}`};
 }
 if(action==='claim'){
  const quest=QUESTS.find(q=>q.id===id);if(!quest||d.claimed.includes(id)||(d.counts[id]||0)<quest.target)return{ok:false};d.claimed.push(id);
  return{ok:true,message:`Nhận thưởng ${quest.name}: +${quest.coins} ☀!${earn(s,quest.coins,quest.xp)}`};
 }
 if(action==='unlock-loft'){
  if(a.loft||status.level<3||s.sun<180)return{ok:false,message:'Bạn chưa đủ điều kiện mở gác xép.'};
  s.sun-=180;a.loft=true;if(!Array.isArray(s.rooms.loft))s.rooms.loft=Array(12).fill(null);
  return{ok:true,message:'Gác xép sáng tạo đã mở cửa! 🏡'};
 }
 if(action==='adopt'){
  if(a.friends.length>=2||status.level<2||s.sun<120)return{ok:false,message:'Chưa thể đón thêm pet.'};
  if(!['cat','dog','bunny'].includes(kind))return{ok:false};
  s.sun-=120;a.friends.push({kind,name:text(name,20)||'Bạn mới',fullness:85,joy:82,energy:90});
  return{ok:true,message:`Đón ${text(name,20)||'bạn mới'} về nhà thành công! 🐾`};
 }
 if(action==='switch-pet'){
  if(slot<0||slot>=a.friends.length)return{ok:false};const chosen=a.friends[slot];a.friends[slot]={...s.pet};s.pet={...chosen};
  return{ok:true,message:`Hôm nay mình chơi cùng ${s.pet.name} nhé! 💗`};
 }
 if(action==='photo'){
  if(a.photos.length>=24)a.photos.shift();a.photos.push({at:now,name:s.pet.name,kind:s.pet.kind,place:s.room,theme:s.theme});
  return{ok:true,message:'Đã cất một bức ảnh vào album kỷ niệm 📸'};
 }
 if(action==='scout'){
  if(a.lastScout===dateKey())return{ok:false,message:'Hôm nay bạn đã dạo chơi rồi nhé.'};
  const dest=DESTINATIONS.find(x=>x.id===id);if(!dest)return{ok:false};a.lastScout=dateKey();
  const seed=[...a.lastScout+id].reduce((x,c)=>x*31+c.charCodeAt(0),0)>>>0;
  const missing=STICKERS.filter(x=>!a.stickers.includes(x));const sticker=missing.length?missing[seed%missing.length]:STICKERS[seed%STICKERS.length];
  if(!a.stickers.includes(sticker))a.stickers.push(sticker);
  const up=recordAdventure(s,'scout');return{ok:true,message:`${dest.emoji} Ghé ${dest.name}: nhặt được ${sticker} và +18 ☀!${earn(s,18,12)}${up}`};
 }
 return{ok:false};
}
export const formatCropTimer=(s,slot)=>{const p=s.adventure?.plots?.[slot],c=cropBy(p?.id);return c?formatDuration(p.at+c.minute*60000-Date.now()):''};
