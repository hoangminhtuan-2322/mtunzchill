import {tracks} from './data.js';
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
const getSaved=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
export class AudioEngine{
 constructor(){this.ctx=null;this.master=null;this.fx=null;this.noiseBuffer=null;this.ambientNodes={};this.listeners=new Set();this.trackIndex=0;this.playing=false;this.step=0;this.interval=null;this.volume=clamp(getSaved('mtunzchill_volume',58));this.ambients=getSaved('mtunzchill_ambients',{rain:0,wave:0,wind:0,fire:0});this.ambients={rain:clamp(this.ambients.rain),wave:clamp(this.ambients.wave),wind:clamp(this.ambients.wind),fire:clamp(this.ambients.fire)};this.muted=false;}
 onChange(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn)}
 emit(){for(const fn of this.listeners){try{fn(this.state())}catch(e){console.warn('audio listener',e)}}}
 state(){return{playing:this.playing,index:this.trackIndex,track:tracks[this.trackIndex],step:this.step,progress:this.step%16/16,volume:this.volume,ambients:{...this.ambients},muted:this.muted}}
 async initialize(){if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Trình duyệt không hỗ trợ âm thanh Web Audio');this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:this.volume/100;this.master.connect(this.ctx.destination);this.fx=this.ctx.createGain();this.fx.connect(this.ctx.destination);this.noiseBuffer=this.ctx.createBuffer(1,Math.floor(this.ctx.sampleRate*2),this.ctx.sampleRate);let a=this.noiseBuffer.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}if(this.ctx.state==='suspended')await this.ctx.resume()}
 note(freq,duration=.35,gain=.038,wave='sine'){if(!this.ctx||this.ctx.state!=='running')return;let now=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain(),f=this.ctx.createBiquadFilter();o.type=wave;o.frequency.value=freq;f.type='lowpass';f.frequency.value=1450;g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(gain,now+.035);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(f).connect(g).connect(this.master);o.start(now);o.stop(now+duration+.04)}
 click(){if(this.ctx?.state==='running')this.note(610,.095,.013,'sine')}
 tick(){if(!this.playing)return;const t=tracks[this.trackIndex],i=this.step%t.notes.length;this.note(t.notes[i],Math.min(.52,t.tempo/1000*.84),.055,t.wave);if(i%4===0)this.note(t.notes[i]/2,.74,.016,'sine');this.step++;this.emit()}
 async play(index=null){if(index!==null){let next=Number(index);if(Number.isFinite(next)){this.trackIndex=(next+tracks.length)%tracks.length;this.step=0}}
 await this.initialize();if(this.interval)clearInterval(this.interval);this.playing=true;this.tick();this.interval=setInterval(()=>this.tick(),tracks[this.trackIndex].tempo);this.emit()}
 async toggle(){if(this.playing){this.pause();return}await this.play()}
 pause(){this.playing=false;if(this.interval)clearInterval(this.interval);this.interval=null;this.emit()}
 async setTrack(index){let next=(Number(index)+tracks.length)%tracks.length;this.trackIndex=next;this.step=0;if(this.playing)await this.play(next);else this.emit()}
 async next(){await this.setTrack(this.trackIndex+1)}
 async prev(){await this.setTrack(this.trackIndex-1)}
 setVolume(value){this.volume=clamp(value);if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume/100,this.ctx.currentTime,.04);try{localStorage.setItem('mtunzchill_volume',JSON.stringify(this.volume))}catch{}this.emit()}
 toggleMute(){this.muted=!this.muted;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(this.muted?0:this.volume/100,this.ctx.currentTime,.04);this.emit()}
 makeAmbient(type){let source=this.ctx.createBufferSource();source.buffer=this.noiseBuffer;source.loop=true;let filt=this.ctx.createBiquadFilter(),gain=this.ctx.createGain();filt.type=type==='fire'?'highpass':type==='wave'?'lowpass':type==='wind'?'bandpass':'lowpass';filt.frequency.value=type==='rain'?2000:type==='wave'?380:type==='wind'?550:700;filt.Q.value=type==='wind'?.45:.7;gain.gain.value=0;source.connect(filt).connect(gain).connect(this.fx);source.start();let lfo=null;if(type==='wave'){lfo=this.ctx.createOscillator();let lg=this.ctx.createGain();lfo.frequency.value=.15;lg.gain.value=.018;lfo.connect(lg).connect(gain.gain);lfo.start()}return{source,gain,lfo}}
 async setAmbient(type,value){if(!(type in this.ambients))return;const n=clamp(value);if(n>0){await this.initialize();if(!this.ambientNodes[type])this.ambientNodes[type]=this.makeAmbient(type)}this.ambients[type]=n;const node=this.ambientNodes[type];if(node&&this.ctx){let max={rain:.17,wave:.12,wind:.075,fire:.09}[type];node.gain.gain.cancelScheduledValues(this.ctx.currentTime);node.gain.gain.setTargetAtTime(n/100*max,this.ctx.currentTime,.08)}try{localStorage.setItem('mtunzchill_ambients',JSON.stringify(this.ambients))}catch{}this.emit()}
 async preset(type){let p=type==='rain'?{rain:70,wave:0,wind:10,fire:0}:type==='beach'?{rain:0,wave:75,wind:22,fire:0}:type==='forest'?{rain:0,wave:0,wind:65,fire:10}:type==='cafe'?{rain:28,wave:0,wind:0,fire:25}:{rain:0,wave:0,wind:0,fire:0};await this.initialize();await Promise.all(Object.keys(p).map(k=>this.setAmbient(k,p[k])));this.emit()}
 async stopAll(){this.pause();await this.preset('silence')}
 dispose(){this.pause();for(let n of Object.values(this.ambientNodes)){try{n.source.stop();n.lfo?.stop()}catch{}}if(this.ctx)this.ctx.close().catch(()=>{})}
}
export const audio=new AudioEngine();
