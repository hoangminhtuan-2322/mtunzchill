import {tracks} from './data.js';
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
const getSaved=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
export class AudioEngine{
 constructor(){
  this.ctx=null;this.master=null;this.fx=null;this.noiseBuffer=null;this.ambientNodes={};this.listeners=new Set();
  this.trackIndex=0;this.playing=false;this.step=0;this.interval=null;this.muted=false;
  this.volume=clamp(getSaved('mtunzchill_volume',58));const a=getSaved('mtunzchill_ambients',{});
  this.ambients=Object.fromEntries(['rain','wave','wind','fire'].map(k=>[k,clamp(a?.[k])||0]));
  this.sleepDeadline=0;this.sleepMinutes=0;this.sleepTicker=null;
 }
 onChange(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 emit(){const state=this.state();for(const fn of this.listeners){try{fn(state)}catch(e){console.warn('Audio UI listener',e)}}}
 state(){return{playing:this.playing,index:this.trackIndex,track:tracks[this.trackIndex],step:this.step,progress:this.step%16/16,volume:this.volume,ambients:{...this.ambients},muted:this.muted,sleepRemaining:this.sleepDeadline?Math.max(0,Math.ceil((this.sleepDeadline-Date.now())/1000)):0,sleepMinutes:this.sleepMinutes}}
 async initialize(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Trình duyệt không hỗ trợ Web Audio');this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.volume/100;this.master.connect(this.ctx.destination);this.fx=this.ctx.createGain();this.fx.connect(this.ctx.destination);this.noiseBuffer=this.ctx.createBuffer(1,Math.floor(this.ctx.sampleRate*3),this.ctx.sampleRate);const a=this.noiseBuffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}if(this.ctx.state==='suspended')await this.ctx.resume()}
 note(freq,duration=.38,volume=.037,wave='sine'){if(!this.ctx||this.ctx.state!=='running')return;const now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();o.type=wave;o.frequency.setValueAtTime(freq,now);f.type='lowpass';f.frequency.value=1550;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(volume,now+.05);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(f).connect(g).connect(this.master);o.start(now);o.stop(now+duration+.04)}
 click(){if(this.ctx?.state==='running')this.note(610,.105,.012,'sine')}
 tick(){if(!this.playing)return;const t=tracks[this.trackIndex],i=this.step%t.notes.length;this.note(t.notes[i],Math.min(.63,t.tempo/1000*.91),.048,t.wave);if(i%4===0){this.note(t.notes[i]/2,.9,.015,'sine');this.note(t.notes[i]*1.5,.55,.007,'sine')}this.step++;this.emit()}
 async play(index=null){if(index!==null){const next=Number(index);if(Number.isFinite(next)){this.trackIndex=((Math.trunc(next)%tracks.length)+tracks.length)%tracks.length;this.step=0}}await this.initialize();if(this.interval)clearInterval(this.interval);this.playing=true;this.tick();this.interval=setInterval(()=>this.tick(),tracks[this.trackIndex].tempo);this.emit()}
 async toggle(){if(this.playing){this.pause();return}await this.play()}
 pause(){this.playing=false;if(this.interval)clearInterval(this.interval);this.interval=null;this.emit()}
 async setTrack(index){const i=Number(index);if(!Number.isInteger(i))return;const next=((i%tracks.length)+tracks.length)%tracks.length;this.trackIndex=next;this.step=0;if(this.playing)await this.play(next);else this.emit()}
 async next(){return this.setTrack(this.trackIndex+1)}
 async prev(){return this.setTrack(this.trackIndex-1)}
 setVolume(value){this.volume=clamp(value);if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume/100,this.ctx.currentTime,.05);try{localStorage.setItem('mtunzchill_volume',JSON.stringify(this.volume))}catch{}this.emit()}
 toggleMute(){this.muted=!this.muted;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume/100,this.ctx.currentTime,.05);this.emit()}
 makeAmbient(type){const source=this.ctx.createBufferSource();source.buffer=this.noiseBuffer;source.loop=true;const filt=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();filt.type=type==='fire'?'highpass':type==='wind'?'bandpass':'lowpass';filt.frequency.value={rain:1850,wave:340,wind:520,fire:880}[type];filt.Q.value=type==='wind'?.44:.7;gain.gain.value=0;source.connect(filt).connect(gain).connect(this.fx);source.start();let lfo=null,lfoGain=null;if(type==='wave'){lfo=this.ctx.createOscillator();lfoGain=this.ctx.createGain();lfo.frequency.value=.13;lfoGain.gain.value=0;lfo.connect(lfoGain).connect(gain.gain);lfo.start()}return{source,gain,lfo,lfoGain}}
 async setAmbient(type,value){if(!(type in this.ambients))return;const amount=clamp(value);if(amount>0){await this.initialize();if(!this.ambientNodes[type])this.ambientNodes[type]=this.makeAmbient(type)}this.ambients[type]=amount;const node=this.ambientNodes[type];if(node&&this.ctx){const now=this.ctx.currentTime,level={rain:.15,wave:.11,wind:.075,fire:.065}[type]*amount/100;node.gain.gain.cancelScheduledValues(now);node.gain.gain.setTargetAtTime(level,now,.07);if(node.lfoGain){node.lfoGain.gain.cancelScheduledValues(now);node.lfoGain.gain.setTargetAtTime(.017*amount/100,now,.07)}}try{localStorage.setItem('mtunzchill_ambients',JSON.stringify(this.ambients))}catch{}this.emit()}
 async preset(type){const p=type==='rain'?{rain:67,wave:0,wind:12,fire:0}:type==='beach'?{rain:0,wave:72,wind:23,fire:0}:type==='forest'?{rain:0,wave:0,wind:60,fire:7}:type==='cafe'?{rain:24,wave:0,wind:0,fire:22}:{rain:0,wave:0,wind:0,fire:0};for(const [name,amount] of Object.entries(p))await this.setAmbient(name,amount);this.emit()}
 setSleep(minutes){const m=Number(minutes);clearInterval(this.sleepTicker);this.sleepTicker=null;this.sleepMinutes=Number.isFinite(m)&&m>0?Math.min(m,180):0;this.sleepDeadline=this.sleepMinutes?Date.now()+this.sleepMinutes*60000:0;
  if(this.sleepDeadline){this.sleepTicker=setInterval(()=>{if(Date.now()>=this.sleepDeadline){this.setSleep(0);this.stopAll().catch(()=>{});return}this.emit()},1000)}this.emit()}
 async stopAll(){this.pause();await this.preset('silence');this.setSleep(0)}
 dispose(){clearInterval(this.sleepTicker);if(this.interval)clearInterval(this.interval);this.playing=false;for(const n of Object.values(this.ambientNodes)){try{n.source.stop();n.lfo?.stop()}catch{}}if(this.ctx)this.ctx.close().catch(()=>{});this.ctx=null}
}
export const audio=new AudioEngine();
