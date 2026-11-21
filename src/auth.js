/** mtunzchill account client. Bearer credential is restricted to this tab (sessionStorage). */
import {exportBackup,importBackup} from './wellbeing.js';
const API=''; // Same-origin API served by the Python Web Service.
const TOKEN_KEY='mtc_token';
const OWNER_KEY='mtc_cloud_owner';
let token=sessionStorage.getItem(TOKEN_KEY)||'';
let hydrating=false;
let user=null,revision=0,paused=false,lastError='',syncTimer=0,syncing=false,dirty=false;
const listeners=new Set();
const emit=()=>listeners.forEach(fn=>{try{fn(auth.status())}catch{}});
const notice=message=>window.dispatchEvent(new CustomEvent('mtc:notice',{detail:message}));
function dataSnapshot(){const data=JSON.parse(exportBackup());delete data.exportedAt;return data}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function guestHasData(data){return !!(data?.journal?.length||data?.journey?.worlds?.length||data?.journey?.games?.length||data?.preferences?.favorites?.worlds?.length||data?.preferences?.favorites?.tracks?.length)}
const emptyData=()=>({format:'mtunzchill-local',version:1,journal:[],journey:{worlds:[],games:[],days:{}},preferences:{favorites:{worlds:[],tracks:[]},mood:'calm',reduceMotion:false,lastWorld:null,lastGame:null,volume:58,ambients:{rain:0,wave:0,wind:0,fire:0}}});
function purgeData(){hydrating=true;for(const key of ['mc_journal','mc_journey','mc_favorites','mc_mood','mc_reduceMotion','mc_lastWorld','mc_lastGame','mtunzchill_volume','mtunzchill_ambients'])localStorage.removeItem(key);importBackup(JSON.stringify(emptyData()));hydrating=false}
function clearSession(){token='';user=null;revision=0;paused=false;dirty=false;lastError='';sessionStorage.removeItem(TOKEN_KEY);localStorage.removeItem(OWNER_KEY);emit()}
async function request(path,{method='GET',body,authenticated=true}={}){
 const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),45000);
 try{
  const headers={'Accept':'application/json'};
  if(body!==undefined)headers['Content-Type']='application/json';
  if(authenticated&&token)headers['Authorization']='Bearer '+token;
  const res=await fetch(API+path,{method,headers,body:body!==undefined?JSON.stringify(body):undefined,mode:'cors',credentials:'omit',cache:'no-store',signal:ctrl.signal});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){const e=new Error(typeof data.detail==='string'?data.detail:'Không thể thực hiện yêu cầu.');e.status=res.status;throw e}
  return data;
 }catch(err){if(err.name==='AbortError')throw Error('Máy chủ phản hồi quá lâu. Vui lòng thử lại.');throw err}finally{clearTimeout(timeout)}
}
async function fetchCloud(){const response=await request('/api/state');revision=response.revision;return response.data}
function importCloud(payload){hydrating=true;try{importBackup(JSON.stringify(payload));localStorage.setItem(OWNER_KEY,user.id)}finally{hydrating=false}}
function goReload(){location.href='#/profile';location.reload()}
async function handleCloud(isNew=false,carryGuest=true){
 const cloud=await fetchCloud(),owner=localStorage.getItem(OWNER_KEY),local=dataSnapshot();
 if(cloud){
  if(owner!==user.id&&guestHasData(local)){
   if(!window.confirm('Trên máy này đang có dữ liệu riêng. Bạn muốn mở dữ liệu đã lưu trên tài khoản? Nếu chọn Hủy, dữ liệu trên máy không bị ghi đè và đồng bộ sẽ tạm dừng.')){
    paused=true;lastError='Đồng bộ tạm dừng để bảo vệ dữ liệu trên máy.';emit();return false;
   }
   if(!sessionStorage.getItem('mtc_guest_snapshot'))sessionStorage.setItem('mtc_guest_snapshot',JSON.stringify(local));
  }
  if(owner!==user.id||!same(local,cloud)){importCloud(cloud);emit();goReload();return true}
  emit();return true;
 }
 if(owner&&owner!==user.id){purgeData();carryGuest=false;}
 if(!carryGuest){purgeData();}
 if(carryGuest&&guestHasData(local)&&owner!==user.id&&!sessionStorage.getItem('mtc_guest_snapshot'))sessionStorage.setItem('mtc_guest_snapshot',JSON.stringify(local));
 localStorage.setItem(OWNER_KEY,user.id);
 if(carryGuest){dirty=true;await flush();}
 emit();return true;
}
export const auth={
 get user(){return user},get loggedIn(){return !!user},
 status(){return {user,revision,paused,dirty,syncing,lastError}},
 onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)},
 async initialize(){if(!token){const previousOwner=localStorage.getItem(OWNER_KEY);if(previousOwner){purgeData();localStorage.removeItem(OWNER_KEY);const guest=sessionStorage.getItem('mtc_guest_snapshot');if(guest){try{hydrating=true;importBackup(guest)}catch{}finally{hydrating=false}}location.reload();return}emit();return}try{const me=await request('/api/auth/me');user=me.user;await handleCloud(false,true)}catch(err){if(err.status===401){clearSession();purgeData();const guest=sessionStorage.getItem('mtc_guest_snapshot');if(guest)try{hydrating=true;importBackup(guest)}catch{}finally{hydrating=false};location.reload();return}paused=true;lastError='Chưa kết nối được máy chủ. Dữ liệu trên thiết bị vẫn được giữ.';emit()}},
 async login(username,password){const response=await request('/api/auth/login',{method:'POST',body:{username,password},authenticated:false});token=response.token;user=response.user;revision=0;paused=false;dirty=false;lastError='';sessionStorage.setItem(TOKEN_KEY,token);emit();try{await handleCloud(false,true)}catch(err){paused=true;lastError='Đăng nhập thành công nhưng chưa tải được dữ liệu. '+err.message;emit()}return response.user},
 async register(username,display_name,password,carryGuest){const response=await request('/api/auth/register',{method:'POST',body:{username,display_name,password,accepted_terms:true},authenticated:false});token=response.token;user=response.user;revision=0;paused=false;dirty=false;lastError='';sessionStorage.setItem(TOKEN_KEY,token);emit();try{await handleCloud(true,carryGuest)}catch(err){paused=true;lastError='Đã tạo tài khoản nhưng chưa đồng bộ được dữ liệu. '+err.message;emit()}return response.user},
 async logout(){if(user&&dirty&&!paused){await flush()}if(dirty||paused){if(!window.confirm('Dữ liệu đang chưa đồng bộ. Bạn nên xuất bản sao lưu trước. Bạn vẫn muốn đăng xuất và bỏ các thay đổi chưa lưu lên tài khoản?'))return false;}if(token)await request('/api/auth/logout',{method:'POST'});clearSession();purgeData();const guest=sessionStorage.getItem('mtc_guest_snapshot');sessionStorage.removeItem('mtc_guest_snapshot');if(guest)try{hydrating=true;importBackup(guest)}catch{}finally{hydrating=false};goReload()},
 async rename(display_name){const res=await request('/api/auth/profile',{method:'PATCH',body:{display_name}});user=res.user;emit();return user},
 async changePassword(old_password,new_password){return request('/api/auth/change-password',{method:'POST',body:{old_password,new_password}})},
 async deleteAccount(password){await request('/api/auth/account',{method:'DELETE',body:{password}});clearSession();purgeData();sessionStorage.removeItem('mtc_guest_snapshot');goReload()},
 queue(){if(!user||paused)return;dirty=true;emit();clearTimeout(syncTimer);syncTimer=setTimeout(()=>auth.flush().catch(()=>{}),1600)},
 async flush(){if(!user||paused)return false;if(syncing){dirty=true;return false}clearTimeout(syncTimer);if(!dirty)return true;syncing=true;dirty=false;emit();const data=dataSnapshot();try{const res=await request('/api/state',{method:'PUT',body:{revision,data}});revision=res.revision;lastError='';return true}catch(err){dirty=true;lastError=err.status===409?'Dữ liệu trên một thiết bị khác đã thay đổi. Xuất bản sao lưu trước khi tải lại từ tài khoản.':err.message;notice(lastError);if(err.status===409)paused=true;return false}finally{syncing=false;emit();if(dirty&&!paused)clearTimeout(syncTimer),syncTimer=setTimeout(()=>auth.flush().catch(()=>{}),3000)}},
 async reloadCloud(){if(!user)throw Error('Bạn cần đăng nhập trước.');if(!window.confirm('Tải dữ liệu tài khoản sẽ thay thế nhật ký và yêu thích trên thiết bị này. Bạn đã sao lưu dữ liệu chưa?'))return;paused=false;dirty=false;const cloud=await fetchCloud();if(cloud){importCloud(cloud);goReload()}else{purgeData();localStorage.setItem(OWNER_KEY,user.id);goReload()}},
 async forceUpload(){if(!user)throw Error('Bạn cần đăng nhập trước.');if(!window.confirm('Ghi dữ liệu trên thiết bị này lên tài khoản? Dữ liệu đang lưu trên tài khoản sẽ bị thay thế.'))return;paused=false;const res=await request('/api/state');revision=res.revision;dirty=true;const ok=await auth.flush();if(!ok)throw Error(lastError||'Không thể đồng bộ.');localStorage.setItem(OWNER_KEY,user.id);emit();return true},
};
window.addEventListener('mtc:changed',()=>{if(!hydrating)auth.queue()});
window.addEventListener('online',()=>{if(dirty&&!paused)auth.flush().catch(()=>{})});
window.addEventListener('pagehide',()=>{if(user&&dirty&&!paused)auth.flush().catch(()=>{})});
