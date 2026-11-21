/** Cozy Home — a self-contained, gentle pet and decorating game.
 * Save data is included in the existing mtunzchill account snapshot through wellbeing.js.
 * No real-world currency, leaderboard, ad tracking or server-side purchases.
 */
import {escapeHtml} from './data.js';

const KEY='mc_cozyHome';
const DAY=86400000;
const KIND=['cat','dog','bunny'];
const THEMES=['peach','mint','lavender'];
const ROOM=['bedroom','garden'];
const ITEM=[
 {id:'rug',name:'Thảm hoa',price:0,icon:'🌼',group:'bedroom'},
 {id:'bed',name:'Giường mây',price:0,icon:'🛏️',group:'bedroom'},
 {id:'plant',name:'Cây lá nhỏ',price:0,icon:'🪴',group:'all'},
 {id:'lamp',name:'Đèn ngủ',price:0,icon:'💡',group:'bedroom'},
 {id:'sofa',name:'Sofa pastel',price:34,icon:'🛋️',group:'bedroom'},
 {id:'shelf',name:'Kệ sách',price:28,icon:'📚',group:'bedroom'},
 {id:'table',name:'Bàn trà',price:20,icon:'🍵',group:'all'},
 {id:'pillow',name:'Gối ôm',price:16,icon:'🧸',group:'bedroom'},
 {id:'flowers',name:'Bồn hoa',price:20,icon:'🌷',group:'garden'},
 {id:'bench',name:'Ghế vườn',price:28,icon:'🪑',group:'garden'},
 {id:'pond',name:'Hồ sen',price:42,icon:'🪷',group:'garden'},
 {id:'swing',name:'Xích đu',price:48,icon:'🎠',group:'garden'}
];
const known=new Set(ITEM.map(x=>x.id));
const itemBy=id=>ITEM.find(i=>i.id===id);
const clamp=(v,min,max,fallback=min)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Math.round(Number(v)))):fallback;
const safeText=(v,max=20)=>typeof v==='string'?v.replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,max):'';
const today=()=>new Date().toLocaleDateString('en-CA');

const start=()=>({
 version:1,initialized:false,pet:{kind:'cat',name:'Mochi',fullness:80,joy:82,energy:80},sun:80,
 earned:0,earnedDate:today(),lastSeen:Date.now(),lastAction:0,
 room:'bedroom',theme:'peach',night:false,
 rooms:{bedroom:['rug',null,'bed','lamp',null,null,null,null,null,null,null,null],garden:['plant',null,null,null,null,null,null,null,null,null,null,null]},
 owned:{rug:1,bed:1,plant:1,lamp:1},plantGrowth:0,lastWater:0,visits:0
});
export function normalizeCozyHome(value){
 const d=start();if(!value||typeof value!=='object'||value.version!==1)return d;
 d.initialized=value.initialized===true;
 d.pet.kind=KIND.includes(value.pet?.kind)?value.pet.kind:'cat';
 d.pet.name=safeText(value.pet?.name)||'Mochi';
 for(const k of ['fullness','joy','energy'])d.pet[k]=clamp(value.pet?.[k],0,100,80);
 d.sun=clamp(value.sun,0,20000,80);d.earned=clamp(value.earned,0,60);
 d.earnedDate=/^\d{4}-\d{2}-\d{2}$/.test(value.earnedDate)?value.earnedDate:today();
 d.lastSeen=clamp(value.lastSeen,0,Date.now(),Date.now());
 d.lastAction=clamp(value.lastAction,0,Date.now(),0);
 d.room=ROOM.includes(value.room)?value.room:'bedroom';
 d.theme=THEMES.includes(value.theme)?value.theme:'peach';
 d.night=value.night===true;
 d.owned={};for(const i of ITEM){const count=clamp(value.owned?.[i.id],0,12);if(count)d.owned[i.id]=count}
 d.rooms={bedroom:Array(12).fill(null),garden:Array(12).fill(null)};
 const occupied={};for(const room of ROOM){
  const source=Array.isArray(value.rooms?.[room])?value.rooms[room]:[];
  for(let n=0;n<12;n++){
   const id=source[n];const i=itemBy(id);
   if(!i||!(i.group==='all'||i.group===room)||!d.owned[id])continue;
   occupied[id]=(occupied[id]||0)+1;
   if(occupied[id]<=d.owned[id])d.rooms[room][n]=id;
  }
 }
 d.plantGrowth=clamp(value.plantGrowth,0,4);
 d.lastWater=clamp(value.lastWater,0,Date.now());
 d.visits=clamp(value.visits,0,9999);
 return d;
}
export function readCozyHome(){try{return normalizeCozyHome(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return start()}}
export function saveCozyHome(value){const cleaned=normalizeCozyHome(value);try{localStorage.setItem(KEY,JSON.stringify(cleaned));window.dispatchEvent(new Event('mtc:changed'));return cleaned}catch{return null}}
export function resetCozyHome(){try{localStorage.removeItem(KEY);window.dispatchEvent(new Event('mtc:changed'))}catch{}}
export function cozySummary(){const v=readCozyHome();return{initialized:v.initialized,name:v.pet.name,kind:v.pet.kind,coins:v.sun,room:v.room}}

const ears={
 cat:`<path d="M48 59 42 26q-2-12 10-4l19 15q26-9 48 1l18-18q12-8 11 6l-4 34" fill="#f6cda9" stroke="#b88071" stroke-width="4"/><path d="m49 47-2-18 16 13M133 44l9-15-2 22" fill="#f0a7a5"/>`,
 dog:`<path d="M44 45Q16 23 16 60q4 34 27 22M140 43q34-22 31 16t-28 23" fill="#b98d7a" stroke="#946f60" stroke-width="4"/>`,
 bunny:`<path d="M60 47q-22-60-2-68t25 61M117 47q4-66 22-58t-1 70" fill="#fff3dd" stroke="#b895a1" stroke-width="4"/><path d="M67 32 61-5M129 33l7-41" stroke="#ecb4bf" stroke-width="9" stroke-linecap="round"/>`
};
function petArt(kind){return `<svg viewBox="0 0 190 180" role="img" aria-label="Thú cưng đang ngồi thư giãn" class="cozy-pet-svg">${ears[kind]||ears.cat}<ellipse cx="97" cy="147" rx="75" ry="28" fill="#bd90ae" opacity=".14"/><path d="M51 82q-18 5-18 34 0 42 60 45 73 2 75-42 0-34-23-42" fill="${kind==='dog'?'#ead1b9':'#fff1db'}" stroke="#b98b7e" stroke-width="4"/><ellipse cx="93" cy="85" rx="56" ry="49" fill="${kind==='cat'?'#f9d9ba':kind==='dog'?'#f0c798':'#fff4e4'}" stroke="#b98b7e" stroke-width="4"/><ellipse cx="58" cy="100" rx="10" ry="6" fill="#f5a4a5" opacity=".72"/><ellipse cx="129" cy="100" rx="10" ry="6" fill="#f5a4a5" opacity=".72"/><path d="M67 86q8-10 17 0M105 86q9-10 18 0" fill="none" stroke="#795b61" stroke-width="4" stroke-linecap="round"/><path d="m88 103 6 5 6-5m-6 5v3q-8 10-16 1m16-1q8 9 16 0" fill="none" stroke="#8d6b72" stroke-width="3" stroke-linecap="round"/><ellipse cx="61" cy="145" rx="18" ry="12" fill="#fff0e2" stroke="#b98b7e" stroke-width="3"/><ellipse cx="132" cy="145" rx="18" ry="12" fill="#fff0e2" stroke="#b98b7e" stroke-width="3"/><path d="M150 141q33 12 20-23" stroke="${kind==='dog'?'#b98d7a':'#f2c7a7'}" stroke-width="12" stroke-linecap="round" fill="none" class="cozy-tail"/></svg>`}
function furnitureArt(id){
 const shapes={
 rug:`<ellipse cx="65" cy="86" rx="52" ry="25" fill="#edd3e9" stroke="#c8a5c1" stroke-width="4"/><path d="M44 77q20-19 42 0M38 92q26 15 52-1" stroke="#fff8ea" stroke-width="5" fill="none" stroke-linecap="round"/>`,
 bed:`<rect x="16" y="54" width="98" height="43" rx="12" fill="#dfc1e7" stroke="#aa90ba" stroke-width="4"/><path d="M16 73h98" stroke="#fff" stroke-width="4"/><rect x="20" y="44" width="42" height="28" rx="12" fill="#fff8f1" stroke="#c8b8d4" stroke-width="3"/><path d="M24 96v10m84-10v10" stroke="#ad8fa5" stroke-width="7" stroke-linecap="round"/>`,
 plant:`<path d="M44 76h44l-9 30H53Z" fill="#e6a590" stroke="#bc7f70" stroke-width="4"/><path d="M67 76V29m0 28Q29 43 39 27q21-2 28 30m0-13q13-35 31-26 4 18-31 38m-2 11Q31 58 35 44q20-5 32 23" stroke="#5d9872" stroke-width="6" fill="#81c89a" stroke-linejoin="round"/>`,
 lamp:`<path d="M65 40v66" stroke="#ac8175" stroke-width="7"/><path d="M38 49 52 18h26l14 31z" fill="#ffe1a0" stroke="#cda476" stroke-width="4"/><path d="M47 106h36" stroke="#a98171" stroke-width="9" stroke-linecap="round"/><path d="M51 52q14 10 29 0" stroke="#ffb84e" stroke-width="3"/>`,
 sofa:`<rect x="16" y="46" width="98" height="52" rx="15" fill="#a7c4b8" stroke="#6d9f90" stroke-width="4"/><rect x="27" y="32" width="76" height="36" rx="13" fill="#c4dfcd" stroke="#6d9f90" stroke-width="4"/><path d="M22 96v9m88-9v9" stroke="#806e64" stroke-width="7" stroke-linecap="round"/>`,
 shelf:`<rect x="24" y="16" width="80" height="89" rx="7" fill="#e6b48c" stroke="#ad806c" stroke-width="4"/><path d="M29 48h70M29 77h70" stroke="#a67d69" stroke-width="5"/><path d="M36 27v18m11-14v14m10-16v16m17-12v12M37 60v15m18-15v15m16-15v15" stroke="#887aab" stroke-width="8"/>`,
 table:`<ellipse cx="65" cy="57" rx="49" ry="17" fill="#efc29c" stroke="#b08372" stroke-width="4"/><path d="M37 70v34m56-34v34" stroke="#a87b6f" stroke-width="7"/><ellipse cx="65" cy="45" rx="19" ry="8" fill="#fff8e9" stroke="#b6a0a6" stroke-width="3"/>`,
 pillow:`<rect x="24" y="45" width="82" height="54" rx="23" fill="#ffcedd" stroke="#c992b3" stroke-width="4"/><path d="M65 56v31m-15-16h30" stroke="#fff6f2" stroke-width="5" stroke-linecap="round"/>`,
 flowers:`<rect x="30" y="71" width="70" height="30" rx="8" fill="#e9b18e" stroke="#bd866a" stroke-width="4"/><path d="M65 80V37m-18 43-5-33m42 33 6-34" stroke="#589c78" stroke-width="5"/><g fill="#f5abc2" stroke="#fff9f0" stroke-width="3"><circle cx="42" cy="41" r="14"/><circle cx="65" cy="33" r="15"/><circle cx="92" cy="40" r="13"/></g><circle cx="65" cy="33" r="5" fill="#ffd070"/>`,
 bench:`<path d="M20 68h90v20H20ZM28 42h74v24H28Z" fill="#dfb48d" stroke="#a47c66" stroke-width="4"/><path d="M33 88v18m65-18v18" stroke="#947665" stroke-width="7" stroke-linecap="round"/>`,
 pond:`<ellipse cx="65" cy="77" rx="56" ry="27" fill="#a9e4e1" stroke="#79bcbf" stroke-width="5"/><ellipse cx="65" cy="80" rx="23" ry="10" fill="#65b9a7"/><path d="M61 80q10-19 22-13-5 17-22 13" fill="#aed27d"/><circle cx="69" cy="79" r="6" fill="#f3b7cc"/>`,
 swing:`<path d="M35 104 65 13l30 91M36 104h58" stroke="#b38d75" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M51 36v54m28-54v54" stroke="#a9a1a5" stroke-width="3"/><path d="M44 87h44v10H44Z" fill="#e2b28a" stroke="#b38d75" stroke-width="3"/>`
 };
 return `<svg class="cozy-item-art" viewBox="0 0 130 120" aria-hidden="true">${shapes[id]||''}</svg>`
}
function slowVisit(s){
 const now=Date.now();const passed=Math.max(0,Math.min(2,(now-s.lastSeen)/DAY));
 if(passed>0.02){s.pet.fullness=clamp(s.pet.fullness-Math.floor(passed*6),35,100);s.pet.joy=clamp(s.pet.joy-Math.floor(passed*4),40,100);s.pet.energy=clamp(s.pet.energy+Math.floor(passed*5),20,100)}
 s.lastSeen=now;s.visits=clamp(s.visits+1,0,9999);
 if(s.earnedDate!==today()){s.earned=0;s.earnedDate=today()}
 return s;
}
export function mountCozyHome(root,notify=()=>{}){
 let s=slowVisit(readCozyHome());let selected=null;let selectedCell=-1;let bounce=false;let alive=true;let notice='';
 let noticeTimer=null;
 const safe=txt=>escapeHtml(txt);
 function save(){s.lastSeen=Date.now();const stored=saveCozyHome(s);if(!stored){notify('Không lưu được tiến trình. Hãy kiểm tra bộ nhớ trình duyệt.');return} s=stored}
 function msg(t){notice=t;notify(t);clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{if(alive){notice='';const a=root.querySelector('#cozyNotice');if(a)a.textContent='Chạm vào đồ nội thất để di chuyển hoặc cất đi.'}},4000)}
 function award(n){if(s.earnedDate!==today()){s.earned=0;s.earnedDate=today()}const earned=Math.min(n,Math.max(0,50-s.earned));s.earned+=earned;s.sun+=earned;return earned}
 function stat(key,word,emoji){return `<div class="cozy-stat"><span>${emoji} ${word}</span><strong>${s.pet[key]}%</strong><div class="cozy-stat-bar"><i style="width:${s.pet[key]}%"></i></div></div>`}
 function roomMarkup(){const slots=s.rooms[s.room];return `<div class="cozy-scene cozy-theme-${s.theme} ${s.room==='garden'?'cozy-garden':''} ${s.night?'cozy-night':''}" id="cozyScene"><div class="cozy-sky" aria-hidden="true"><span class="cozy-sun">${s.night?'☾':'☀'}</span><i class="cozy-cloud a"></i><i class="cozy-cloud b"></i></div><div class="cozy-wall" aria-hidden="true"><div class="cozy-window"><span>✿</span><i></i></div><div class="cozy-wall-shelf">✧　♡　✿</div></div><div class="cozy-floor" aria-hidden="true"></div><div class="cozy-grid" role="group" aria-label="Sơ đồ đặt nội thất gồm mười hai vị trí">${slots.map((item,n)=>`<button type="button" class="cozy-slot ${item?'occupied':''} ${selectedCell===n?'chosen':''} ${selected&&(!item||selectedCell===n)?'target':''}" data-cozy="slot" data-slot="${n}" title="${item?safe(itemBy(item)?.name||item):'Vị trí trống — chạm để đặt đồ'}" aria-label="Vị trí ${n+1}: ${item?safe(itemBy(item)?.name||item):'trống'}">${item?furnitureArt(item):'<span class="cozy-slot-plus">+</span>'}</button>`).join('')}</div><button type="button" class="cozy-tap-pet" data-cozy="care" data-care="hug" aria-label="Vuốt ve ${safe(s.pet.name)}" title="Chạm để vuốt ve">${petArt(s.pet.kind)}<span class="cozy-pet-label">${safe(s.pet.name)} ${bounce?'♡':'✿'}</span></button><div class="cozy-scene-hint">${s.room==='garden'?'🌷 Khu vườn của bạn':'🪟 Căn phòng ấm áp'} · ${s.night?'Đêm sao':'Ngày dịu'}</div></div>`}
 function careButton(action,emoji,label,detail){return `<button type="button" class="cozy-care-btn" data-cozy="care" data-care="${action}"><span>${emoji}</span><b>${label}</b><small>${detail}</small></button>`}
 function itemsShop(){return ITEM.filter(i=>i.group===s.room||i.group==='all').map(i=>{
  const used=ROOM.reduce((acc,r)=>acc+s.rooms[r].filter(x=>x===i.id).length,0),total=s.owned[i.id]||0,available=total-used;
  const own=total>0;
  return `<div class="cozy-shop-row ${selected===i.id?'selected':''}"><span class="cozy-shop-art">${furnitureArt(i.id)}</span><div class="cozy-shop-copy"><strong>${safe(i.name)}</strong><small>${own?`Đang có ${total} · còn ${available} món`:'Đồ nội thất mới'}</small></div>${available>0?`<button type="button" data-cozy="select" data-item="${i.id}" class="cozy-shop-btn" aria-pressed="${selected===i.id}">${selected===i.id?'Đang chọn':'Đặt'}</button>`:`<button type="button" data-cozy="buy" data-item="${i.id}" class="cozy-shop-btn" ${s.sun<i.price?'disabled':''}>${i.price} ☀</button>`}</div>`
 }).join('')}
 function onboarding(){return !s.initialized?`<section class="cozy-welcome" aria-labelledby="cozyWelcomeTitle"><div class="cozy-welcome-head"><span class="eyebrow">✿ WELCOME HOME</span><h2 id="cozyWelcomeTitle">Chọn người bạn nhỏ của bạn</h2><p>Đây sẽ là căn nhà và người bạn đồng hành của riêng bạn. Không giới hạn thời gian, không có nhiệm vụ bắt buộc.</p></div><div class="cozy-choices">${[['cat','🐱','Mèo'],['dog','🐶','Cún'],['bunny','🐰','Thỏ']].map(([id,emoji,name])=>`<button type="button" class="cozy-choice ${s.pet.kind===id?'active':''}" data-cozy="kind" data-kind="${id}" aria-pressed="${s.pet.kind===id}"><span>${emoji}</span><strong>${name}</strong></button>`).join('')}</div><label class="cozy-name-label" for="cozyPetName">Tên thú cưng</label><input id="cozyPetName" maxlength="20" value="${safe(s.pet.name)}" placeholder="Ví dụ: Mochi" autocomplete="off"><button type="button" data-cozy="start" class="cozy-main-btn">Bắt đầu cuộc sống chill 🌸</button></section>`:''}
 function render(){if(!alive)return;root.innerHTML=`<div class="cozy-app">${onboarding()}<div class="cozy-topline"><div><span class="eyebrow">✿ COZY HOME — YOUR LITTLE SANCTUARY</span><h2>Ngôi nhà của ${safe(s.pet.name)} <span aria-hidden="true">🌷</span></h2><p>Trang trí nhà nhỏ, chăm bạn đồng hành và tận hưởng những ngày êm.</p></div><div class="cozy-currency" aria-label="${s.sun} hạt nắng"><span>☀️</span><div><strong>${s.sun.toLocaleString('vi-VN')}</strong><small>Hạt nắng</small></div></div></div><div class="cozy-nav"><div class="cozy-room-tabs" role="group" aria-label="Chọn khu vực"><button type="button" class="${s.room==='bedroom'?'active':''}" data-cozy="room" data-room="bedroom">🏠 Phòng nhỏ</button><button type="button" class="${s.room==='garden'?'active':''}" data-cozy="room" data-room="garden">🌼 Khu vườn</button></div><div class="cozy-scene-control"><button type="button" data-cozy="night" aria-pressed="${s.night}">${s.night?'☀️ Ban ngày':'🌙 Đêm sao'}</button><span>Đã ghé ${s.visits} lần</span></div></div><div class="cozy-play-layout"><div class="cozy-play-main">${roomMarkup()}<div class="cozy-scene-footer"><span id="cozyNotice" aria-live="polite">${notice?safe(notice):'Chạm vào đồ nội thất để di chuyển hoặc cất đi.'}</span><span>☁️ Mọi khoảnh khắc đều được lưu</span></div><div class="cozy-care-panel"><div class="cozy-care-title"><div><h3>Chăm sóc ${safe(s.pet.name)}</h3><p>${s.pet.joy>70?'Bạn nhỏ đang rất vui. ♡':'Một cái ôm sẽ làm ngày dịu hơn.'}</p></div><span class="cozy-heart">♡</span></div><div class="cozy-stats">${stat('fullness','No bụng','🍓')}${stat('joy','Vui vẻ','💗')}${stat('energy','Năng lượng','✨')}</div><div class="cozy-care-actions">${careButton('feed','🍓','Cho ăn','Bữa ngon')}${careButton('play','🧶','Chơi cùng','Vui một chút')}${careButton('rest','🛏️','Nghỉ ngơi','Ngủ thật êm')}${careButton('hug','💗','Vuốt ve','Trao một cái ôm')}</div><p class="cozy-care-disclaimer">Không có pet nào bị bệnh hay bỏ đi. Bạn có thể nghỉ chơi bất kỳ lúc nào ♡</p></div></div><aside class="cozy-build-panel"><div class="cozy-build-header"><span class="eyebrow">✦ CREATE YOUR OWN SPACE</span><h3>Trang trí theo ý bạn</h3><p>Chọn món đồ, sau đó chạm vào ô trống trong phòng để đặt.</p></div><div class="cozy-theme-row"><span>Màu tường</span><div>${[['peach','#f6daca','Kem đào'],['mint','#bedacb','Xanh mint'],['lavender','#ded1f3','Tím lavender']].map(([t,color,label])=>`<button type="button" data-cozy="theme" data-theme="${t}" class="cozy-theme-pick ${s.theme===t?'active':''}" style="--swatch:${color}" aria-label="${label}" title="${label}" aria-pressed="${s.theme===t}"></button>`).join('')}</div></div><div class="cozy-inventory" id="cozyInventory">${itemsShop()}</div><div class="cozy-placement"><strong>${selected?`Đang chọn: ${safe(itemBy(selected)?.name||selected)}`:selectedCell>=0?'Bạn đang chọn một vật trong phòng':'Chọn một món để đặt'}</strong><div><button type="button" data-cozy="store" ${selectedCell<0?'disabled':''}>Cất món đồ</button><button type="button" data-cozy="move" ${selectedCell<0?'disabled':''}>Di chuyển</button><button type="button" data-cozy="cancel" ${selected===null&&selectedCell<0?'disabled':''}>Bỏ chọn</button></div></div><div class="cozy-garden-side"><span>🪴</span><div><b>Cây nhỏ của bạn · Cấp ${s.plantGrowth+1}/5</b><p>${s.plantGrowth===4?'Cây đã nở hoa. Thật xinh!':'Tưới cho cây lớn lên từng chút.'}</p><button type="button" data-cozy="water" ${Date.now()-s.lastWater<6*3600000?'disabled':''}>${Date.now()-s.lastWater<6*3600000?'Đã tưới, hẹn lần sau':'💧 Tưới cây'}</button></div></div><p class="cozy-save-note">💾 Tiến trình lưu trên thiết bị và sẽ được đồng bộ khi bạn đăng nhập tài khoản.</p></aside></div></div>`}
 function care(which){if(Date.now()-s.lastAction<700)return; s.lastAction=Date.now();const pet=s.pet;let reward=0;
  if(which==='feed'){pet.fullness=clamp(pet.fullness+23,0,100);pet.joy=clamp(pet.joy+3,0,100);reward=5;msg(`${pet.name} ăn ngon miệng quá! 🍓`)}
  if(which==='play'){pet.joy=clamp(pet.joy+22,0,100);pet.energy=clamp(pet.energy-10,0,100);reward=8;msg(`Chơi cùng ${pet.name} vui ghê! 🧶`)}
  if(which==='rest'){pet.energy=clamp(pet.energy+32,0,100);pet.fullness=clamp(pet.fullness-4,0,100);reward=4;msg(`${pet.name} vừa có một giấc ngủ êm. ☁️`)}
  if(which==='hug'){pet.joy=clamp(pet.joy+9,0,100);reward=3;msg(`${pet.name} rất thích được vuốt ve! 💕`)}
  const earned=award(reward);if(earned&&reward)notice+=` (+${earned} ☀)`;
  bounce=true;save();render();setTimeout(()=>{if(alive){bounce=false;const node=root.querySelector('.cozy-tap-pet');node?.classList.remove('cozy-bounce')}},500);
 }
 root.addEventListener('click',onClick);
 function onClick(e){const b=e.target.closest('[data-cozy]');if(!b||!root.contains(b))return;const action=b.dataset.cozy;
  if(action==='kind'){const typed=safeText(root.querySelector('#cozyPetName')?.value);if(typed)s.pet.name=typed;s.pet.kind=KIND.includes(b.dataset.kind)?b.dataset.kind:'cat';render();return}
  if(action==='start'){const input=root.querySelector('#cozyPetName');s.pet.name=safeText(input?.value)||'Mochi';s.initialized=true;save();msg(`Chào mừng ${s.pet.name} về nhà! 🌸`);render();return}
  if(!s.initialized)return;
  if(action==='care'){care(b.dataset.care);return}
  if(action==='room'){s.room=ROOM.includes(b.dataset.room)?b.dataset.room:'bedroom';selected=null;selectedCell=-1;save();render();return}
  if(action==='night'){s.night=!s.night;save();render();return}
  if(action==='theme'){s.theme=THEMES.includes(b.dataset.theme)?b.dataset.theme:'peach';save();render();return}
  if(action==='select'){selected=b.dataset.item;selectedCell=-1;render();return}
  if(action==='buy'){
   const i=itemBy(b.dataset.item);if(!i||s.sun<i.price)return;
   s.sun-=i.price;s.owned[i.id]=(s.owned[i.id]||0)+1;selected=i.id;selectedCell=-1;
   save();msg(`Đã mang ${i.name} về nhà ♡`);render();return}
  if(action==='slot'){
   const index=Number(b.dataset.slot);if(!Number.isInteger(index)||index<0||index>11)return;
   const slots=s.rooms[s.room],item=slots[index];
   if(selected){const used=ROOM.reduce((n,r)=>n+s.rooms[r].filter(x=>x===selected).length,0);if(item!==selected&&used >= (s.owned[selected]||0)){msg('Bạn chưa còn món đồ này trong kho.');return}
    if(item===selected){selected=null;selectedCell=-1;render();return}
    slots[index]=selected;selected=null;selectedCell=-1;save();msg('Đã đặt nội thất vào vị trí mới 🌷');render();return}
   selectedCell=item?index:-1;render();return
  }
  if(action==='store'&&selectedCell>=0){s.rooms[s.room][selectedCell]=null;selectedCell=-1;selected=null;save();msg('Đã cất đồ vào kho.');render();return}
  if(action==='move'&&selectedCell>=0){selected=s.rooms[s.room][selectedCell];s.rooms[s.room][selectedCell]=null;selectedCell=-1;save();msg('Chạm vào ô trống để chuyển món đồ.');render();return}
  if(action==='cancel'){selected=null;selectedCell=-1;render();return}
  if(action==='water'){
   if(Date.now()-s.lastWater<6*3600000)return;
   s.lastWater=Date.now();s.plantGrowth=Math.min(4,s.plantGrowth+1);award(8);save();msg('Cây nhỏ vươn mình thêm một chút 🌱');render();return
  }
 }
 render();return()=>{alive=false;clearTimeout(noticeTimer);root.removeEventListener('click',onClick)};
}
