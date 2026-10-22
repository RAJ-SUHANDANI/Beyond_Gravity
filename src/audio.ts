import {chapters,parts,type PartId} from './data';
import {fullNarration} from './story';

/**
 * Documentary audio director.
 * Local, legally generated neural narration takes precedence over OS voices.
 * Captions are derived from the same script and advanced by speech boundaries.
 * For supplied audio, distribute precise VTT cue files for studio-grade timing;
 * without them, word-weight timing is an explicit approximation.
 */
type Role='male'|'female';
type Cue={text:string,start:number,end:number};
type CueHandler=(text:string,index:number,count:number)=>void;
let active:HTMLAudioElement|null=null;
let narratorMuted=false;
let fallbackUtterance:SpeechSynthesisUtterance|null=null;
export function setNarrationMuted(value:boolean){narratorMuted=value;if(active)active.muted=value;if(fallbackUtterance)fallbackUtterance.volume=value?0:1;}
let serial=0;
let cancelFallback:undefined|(()=>void);
export function stopNarration(){serial++;active?.pause();active=null;cancelFallback?.();cancelFallback=undefined;fallbackUtterance=null;if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()}
/** Pause and resume the actual recording position; chapter navigation remains a full stop. */
export function pauseNarration():boolean{
 if(active && !active.paused){active.pause();return true}
 if(typeof window!=='undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking && !window.speechSynthesis.paused){
  window.speechSynthesis.pause();return true
 }
 return false
}
export function resumeNarration():boolean{
 if(active && active.paused){void active.play().catch(()=>{});return true}
 if(typeof window!=='undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused){
  window.speechSynthesis.resume();return true
 }
 return false
}
export function narrationPosition():{position:number,duration:number}|null{
 if(!active || !Number.isFinite(active.duration) || active.duration<=0)return null
 return {position:active.currentTime,duration:active.duration}
}


export function makeCues(script:string):Cue[]{
 const words=[...script.matchAll(/\S+/g)];
 const cues:Cue[]=[];
 for(let i=0;i<words.length;){
   const start=words[i].index??0;let end=i;let length=0;
   while(end<words.length && end-i<15){
     const w=words[end][0];length+=w.length+1;end++;
     if(/[.!?]$/.test(w)&&end-i>=5)break;
     if(length>=88 && end-i>=9)break;
   }
   const last=words[end-1];const finish=(last.index??start)+last[0].length;
   cues.push({text:script.slice(start,finish).trim(),start,end:finish});
   i=end;
 }
 return cues.length?cues:[{text:script,start:0,end:script.length}];
}
export function getNarrationCues(index:number){const c=chapters[index];return makeCues(c?fullNarration(index,c.narration):'')}

function preferredVoice(role:Role){
 if(!('speechSynthesis'in window))return null;
 const list=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en'));
 const female=['Jenny','Aria','Samantha','Karen','Victoria','Zira','Serena'];
 const male=['Guy','Ryan','Daniel','Alex','David','Arthur'];
 const names=role==='female'?female:male;
 for(const name of names){const match=list.find(v=>v.name.toLowerCase().includes(name.toLowerCase()));if(match)return match}
 return list.find(v=>/natural|neural|enhanced|premium/i.test(v.name))||list[role==='female'?Math.min(1,list.length-1):0]||null;
}
function asset(name:string){return import.meta.env.BASE_URL+'audio/'+name+'.mp3'}
type TimedCaption={start:number;end:number;text:string};
function parseVtt(input:string):TimedCaption[]{
 const result:TimedCaption[]=[];
 const timing=/^(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->\s+(\d{2}):(\d{2}):(\d{2})\.(\d{3})/;
 const time=(a:string,b:string,c:string,d:string)=>Number(a)*3600+Number(b)*60+Number(c)+Number(d)/1000;
 const lines=input.split(/\r?\n/);
 for(let i=0;i<lines.length;i++){
  const match=timing.exec(lines[i].trim());
  if(!match)continue;
  const start=time(match[1],match[2],match[3],match[4]);
  const end=time(match[5],match[6],match[7],match[8]);
  let text='';for(let j=i+1;j<lines.length&&lines[j].trim();j++)text+=(text?' ':'')+lines[j].trim();
  if(text&&end>start)result.push({start,end,text});
 }
 return result;
}
function play(script:string,role:Role,src:string,onEnd?:(audible:boolean)=>void,onCue?:CueHandler){
 stopNarration();const mine=serial;const cues=makeCues(script);let timed:TimedCaption[]=[];let lastPhrase='';
 let prev=-1;
 const update=(index:number)=>{if(mine!==serial)return;index=Math.min(Math.max(index,0),cues.length-1);if(index===prev)return;prev=index;lastPhrase=cues[index].text;onCue?.(lastPhrase,index,cues.length)};
 update(0);
 const audio=new Audio(src);audio.preload='auto';audio.muted=narratorMuted;active=audio;
 void fetch(src.replace(/\.mp3(?:\?.*)?$/i,'.vtt')).then(r=>r.ok?r.text():'').then(text=>{if(mine===serial&&text)timed=parseVtt(text)}).catch(()=>{});
 const done=(audible:boolean)=>{if(mine!==serial)return;active=null;fallbackUtterance=null;onEnd?.(audible)};
 let fellBack=false;
 const fallback=()=>{if(fellBack||mine!==serial)return;fellBack=true;audio.pause();active=null;
   if(!('speechSynthesis'in window)){done(false);return}
   const synth=window.speechSynthesis;const sentence=new SpeechSynthesisUtterance(script);fallbackUtterance=sentence;sentence.volume=narratorMuted?0:1;
   sentence.voice=preferredVoice(role);
   sentence.lang=sentence.voice?.lang||'en-US';
   sentence.rate=role==='male'?.96:1.02;
   sentence.pitch=1;
   sentence.onboundary=e=>{if(mine!==serial)return;const charIndex=e.charIndex;let i=0;while(i<cues.length-1&&cues[i].end<=charIndex)i++;update(i)};
   const started=performance.now();sentence.onend=()=>done(performance.now()-started>Math.max(1500,script.length*15));sentence.onerror=()=>done(false);
   synth.cancel();synth.speak(sentence);
   cancelFallback=()=>{sentence.onend=null;sentence.onerror=null;synth.cancel()};
 };
 audio.onended=()=>{update(cues.length-1);done(audio.currentTime>2)};
 audio.onerror=fallback;
 audio.ontimeupdate=()=>{if(mine!==serial||!Number.isFinite(audio.duration)||!audio.duration)return;
   if(timed.length){
     let i=0;while(i<timed.length-1&&timed[i].end<audio.currentTime)i++;
     const cue=timed[i];
     if(lastPhrase!==cue.text){lastPhrase=cue.text;onCue?.(cue.text,i,timed.length)}
     return;
   }
   // Fallback applies only when the audio has no accompanying timed VTT.
   const position=(audio.currentTime/audio.duration)*script.length;
   let i=0;while(i<cues.length-1&&cues[i].end<position)i++;update(i);
 };
 void audio.play().catch(fallback);
 return ()=>{if(mine===serial)stopNarration()};
}
export function narrateChapter(i:number,onEnd?:(audible:boolean)=>void,onCue?:CueHandler){const original=chapters[i]?.narration;const text=original?fullNarration(i,original):undefined;if(!text){onEnd?.(false);return}return play(text,'male',asset('male-'+String(i).padStart(2,'0')),onEnd,onCue)}
export function narratePart(id:PartId,onEnd?:()=>void,onCue?:CueHandler){const p=parts.find(x=>x.id===id);if(!p)return;return play(p.female,'female',asset('female-'+id),onEnd,onCue)}
export function narrateIntro(onEnd?:()=>void,onCue?:CueHandler){return play('Beyond Gravity. A documentary you can step inside. The stunt. The science. The future.','female',asset('female-intro'),onEnd,onCue)}
