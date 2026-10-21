import {chapters,parts,type PartId} from './data';
type Role='male'|'female';
let currentAudio:HTMLAudioElement|null=null;
let token=0;
export function stopNarration(){token++;currentAudio?.pause();currentAudio=null;if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel()}
function selectVoice(role:Role):SpeechSynthesisVoice|null{
 if(typeof window==='undefined'||!('speechSynthesis'in window))return null;
 const all=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en'));
 if(!all.length)return null;
 // Premium OS neural voice is preferred; unsupported voices cannot be magically replaced with one.
 // Do not distort stock voices with extreme synthetic pitch or slow playback.
 const fav=role==='female'
 ? ['Microsoft Jenny Online','Microsoft Aria Online','Google UK English Female','Samantha','Karen','Victoria','Zira']
 : ['Microsoft Guy Online','Microsoft Ryan Online','Google UK English Male','Daniel','Alex','David'];
 for(const name of fav){const v=all.find(x=>x.name.toLowerCase().includes(name.toLowerCase()));if(v)return v;}
 const neural=all.filter(v=>/neural|natural|enhanced|premium|online/i.test(v.name));
 if(neural.length>0)return neural[role==='male'?0:Math.min(1,neural.length-1)];
 return all[role==='male'?0:Math.min(1,all.length-1)];
}
function mp3Asset(filename:string){return import.meta.env.BASE_URL+'audio/'+filename+'.mp3'}
export async function speak(text:string,role:Role,asset:string,onEnd?:()=>void){
 stopNarration();const active=token;
 // Prefer locally rendered, mastered, legally usable neural clips.
 const audio=new Audio(asset);audio.preload='auto';audio.volume=1;currentAudio=audio;
 try{
  await audio.play();
  if(active!==token){audio.pause();return}
  audio.onended=()=>{if(active===token){currentAudio=null;onEnd?.()}};
  audio.onerror=()=>{if(active===token)fallback()};
  return;
 }catch{audio.pause();if(active!==token)return;currentAudio=null;}
 function fallback(){
  if(active!==token)return;
  if(!('speechSynthesis'in window)){onEnd?.();return}
  window.speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.voice=selectVoice(role);
  utterance.lang=utterance.voice?.lang||'en-US';
  utterance.rate=role==='male'?.96:1.03;
  utterance.pitch=1;
  utterance.volume=1;
  utterance.onend=()=>{if(active===token)onEnd?.()};
  utterance.onerror=()=>{if(active===token)onEnd?.()};
  window.speechSynthesis.speak(utterance);
 }
 fallback();
}
export function narrateChapter(index:number,onEnd?:()=>void){const chapter=chapters[index];if(chapter)return speak(chapter.narration,'male',mp3Asset('male-'+String(index).padStart(2,'0')),onEnd)}
export function narratePart(id:PartId,onEnd?:()=>void){const part=parts.find(p=>p.id===id);if(part)return speak(part.female,'female',mp3Asset('female-'+id),onEnd)}
export function narrateIntro(onEnd?:()=>void){return speak('Beyond Gravity. An interactive journey into the science of flying cars. Enter the story and experience the machine.','female',mp3Asset('female-intro'),onEnd)}
