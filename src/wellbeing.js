import {normalizeCozyHome,readCozyHome,resetCozyHome} from './cozy-home.js';
/** Private state, optionally synced through the account's authenticated API. */
const PREFIX='mc_';
function read(key,fallback){try{const s=localStorage.getItem(PREFIX+key);return s?JSON.parse(s):fallback}catch{return fallback}}
function write(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true}catch{return false}}
const currentDay=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const allowedMoods=['calm','happy','tired','focus'];
function noteShape(v){if(!v||typeof v!=='object'||typeof v.text!=='string')return null;const text=v.text.trim().slice(0,900);if(!text)return null;const raw=Number(v.createdAt);const timestamp=Number.isFinite(raw)&&raw>946684800000&&raw<Date.now()+86400000?raw:Date.now();return {id:typeof v.id==='string'&&v.id.length<80?v.id:`note-${timestamp}-${Math.random().toString(36).slice(2,8)}`,text,mood:allowedMoods.includes(v.mood)?v.mood:'calm',createdAt:timestamp}}
function normalizeNotes(data){if(!Array.isArray(data))return [];const used=new Set();return data.slice(0,100).map(noteShape).filter(n=>{if(!n||used.has(n.id))return false;used.add(n.id);return true}).sort((a,b)=>b.createdAt-a.createdAt)}
let notes=normalizeNotes(read('journal',[]));
const freshJourney=()=>({worlds:[],games:[],days:{}});
const defaultJourney=freshJourney();
let journey=read('journey',defaultJourney);
if(!journey||typeof journey!=='object'||!Array.isArray(journey.worlds)||!Array.isArray(journey.games)||!journey.days||typeof journey.days!=='object'||Array.isArray(journey.days))journey=freshJourney();
journey.worlds=journey.worlds.filter(x=>typeof x==='string').slice(0,20);
journey.games=journey.games.filter(x=>typeof x==='string').slice(0,20);
function todayFlags(){const v=journey.days[currentDay()];return v&&typeof v==='object'?v:{}}
export function trackMoment(kind,id){if(!['world','game','music','journal','focus'].includes(kind))return false;const today=currentDay(),v=journey.days[today]&&typeof journey.days[today]==='object'?journey.days[today]:{};let changed=false;if(!v[kind]){v[kind]=true;changed=true}journey.days[today]=v;
if(kind==='world'&&typeof id==='string'&&!journey.worlds.includes(id)){journey.worlds.push(id);changed=true}
if(kind==='game'&&typeof id==='string'&&!journey.games.includes(id)){journey.games.push(id);changed=true}
const days=Object.keys(journey.days).sort().slice(-40);journey.days=Object.fromEntries(days.map(d=>[d,journey.days[d]]));if(changed)write('journey',journey);return changed}
export function dailyProgress(){const f=todayFlags();return{items:[{id:'world',label:'Ghé một thế giới',done:!!f.world,icon:'🌸'},{id:'music',label:'Nghe một giai điệu',done:!!f.music,icon:'🎵'},{id:'game',label:'Chơi một trò nhỏ',done:!!f.game,icon:'🎮'},{id:'journal',label:'Viết vài dòng',done:!!f.journal,icon:'✍️'}],done:['world','music','game','journal'].filter(x=>f[x]).length,date:currentDay()}}
export function journeyStats(){return{worlds:journey.worlds.length,games:journey.games.length,days:Object.values(journey.days).filter(v=>v&&Object.values(v).some(Boolean)).length,focusDays:Object.values(journey.days).filter(v=>v&&v.focus).length,notes:notes.length}}
export function getNotes(){return notes.map(n=>({...n}))}
export function saveNote(text,mood='calm',id=null){if(typeof text!=='string'||!text.trim()||text.trim().length>900)throw Error('Nội dung cần từ 1 đến 900 ký tự');const next=noteShape({id:id||`note-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,text,mood,createdAt:Date.now()});if(id){const old=notes.find(n=>n.id===id);if(!old)throw Error('Không tìm thấy ghi chú');next.createdAt=old.createdAt;notes=notes.filter(n=>n.id!==id)}notes=[next,...notes].sort((a,b)=>b.createdAt-a.createdAt).slice(0,100);if(!write('journal',notes))throw Error('Không đủ bộ nhớ lưu trữ');trackMoment('journal');return next}
export function deleteNote(id){const size=notes.length;notes=notes.filter(n=>n.id!==id);if(notes.length!==size){write('journal',notes);return true}return false}
export function exportBackup(){const payload={format:'mtunzchill-local',version:1,exportedAt:new Date().toISOString(),journal:notes,journey,cozyHome:readCozyHome(),preferences:{favorites:read('favorites',{worlds:[],tracks:[]}),mood:read('mood','calm'),reduceMotion:read('reduceMotion',false),lastWorld:read('lastWorld',null),lastGame:read('lastGame',null),volume:readRaw('mtunzchill_volume',58),ambients:readRaw('mtunzchill_ambients',{rain:0,wave:0,wind:0,fire:0})}};return JSON.stringify(payload,null,2)}
function readRaw(key,fallback){try{const s=localStorage.getItem(key);return s?JSON.parse(s):fallback}catch{return fallback}}
export function importBackup(text){if(typeof text!=='string'||text.length>1024*1024)throw Error('Tệp quá lớn');let p;try{p=JSON.parse(text)}catch{throw Error('Tệp không phải JSON hợp lệ')}if(p?.format!=='mtunzchill-local'||p.version!==1||!Array.isArray(p.journal))throw Error('Không đúng định dạng sao lưu mtunzchill');const imported=normalizeNotes(p.journal);notes=imported;if(p.cozyHome&&typeof p.cozyHome==='object'){if(!write('cozyHome',normalizeCozyHome(p.cozyHome)))throw Error('Không lưu được dữ liệu nhà và pet')}else{resetCozyHome()}if(!write('journal',notes))throw Error('Không đủ dung lượng để nhập ghi chú');
if(p.journey&&typeof p.journey==='object'&&Array.isArray(p.journey.worlds)&&Array.isArray(p.journey.games)&&p.journey.days&&typeof p.journey.days==='object'&&!Array.isArray(p.journey.days)){journey={worlds:p.journey.worlds.filter(x=>typeof x==='string').slice(0,20),games:p.journey.games.filter(x=>typeof x==='string').slice(0,20),days:Object.fromEntries(Object.entries(p.journey.days).filter(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&v&&typeof v==='object'&&!Array.isArray(v)).slice(-40).map(([k,v])=>[k,Object.fromEntries(['world','game','music','journal','focus'].map(n=>[n,!!v[n]]))]))};write('journey',journey)}
const pref=p.preferences;if(pref&&typeof pref==='object'){
 if(pref.favorites&&Array.isArray(pref.favorites.worlds)&&Array.isArray(pref.favorites.tracks))write('favorites',{worlds:pref.favorites.worlds.filter(x=>typeof x==='string').slice(0,20),tracks:pref.favorites.tracks.filter(x=>Number.isInteger(x)&&x>=0&&x<100).slice(0,30)});
 if(allowedMoods.includes(pref.mood))write('mood',pref.mood);if(typeof pref.reduceMotion==='boolean')write('reduceMotion',pref.reduceMotion);
 if(typeof pref.lastWorld==='string')write('lastWorld',pref.lastWorld);if(typeof pref.lastGame==='string')write('lastGame',pref.lastGame);
 if(Number.isFinite(pref.volume))try{localStorage.setItem('mtunzchill_volume',JSON.stringify(Math.min(100,Math.max(0,pref.volume))))}catch{}
 if(pref.ambients&&typeof pref.ambients==='object')try{localStorage.setItem('mtunzchill_ambients',JSON.stringify(Object.fromEntries(['rain','wave','wind','fire'].map(k=>[k,Math.min(100,Math.max(0,Number(pref.ambients[k])||0))]))))}catch{}
}return imported.length}
export function clearWellbeing(){notes=[];journey=freshJourney();resetCozyHome();for(const name of ['journal','journey'])try{localStorage.removeItem(PREFIX+name)}catch{}}
