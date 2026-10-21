import { chapters,parts,type PartId } from './data';
type VoiceRole='male'|'female';
let currentAudio:HTMLAudioElement|null=null;
let sequence=0;
export const stopNarration=()=>{sequence++;currentAudio?.pause();currentAudio=null;if(typeof window!=='undefined'&&'speechSynthesis'in window)window.speechSynthesis.cancel();};
function voiceFor(role:VoiceRole){const v=window.speechSynthesis.getVoices();const en=v.filter(x=>x.lang.toLowerCase().startsWith('en'));const named=role==='female'?/(samantha|zira|aria|jenny|female|victoria|susan|karen)/i:/(david|guy|daniel|mark|alex|male|fred)/i;return en.find(x=>named.test(x.name))||en[(role==='female'?1:0)%Math.max(1,en.length)]||v[0];}
export async function speak(text:string,role:VoiceRole,asset:string,onEnd?:()=>void){stopNarration();const token=sequence;const audio=new Audio(asset);currentAudio=audio;try{await audio.play();audio.onended=()=>{if(token===sequence)onEnd?.();};return;}catch{audio.pause();if(token!==sequence)return;currentAudio=null;}
if(!('speechSynthesis'in window)){onEnd?.();return;}
const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voiceFor(role)||null;utterance.lang='en-US';utterance.rate=role==='male'?.88:.99;utterance.pitch=role==='male'?.86:1.09;utterance.onend=()=>{if(token===sequence)onEnd?.();};window.speechSynthesis.speak(utterance);
}
export function narrateChapter(index:number,onEnd?:()=>void){const c=chapters[index];if(c)return speak(c.narration,'male',import.meta.env.BASE_URL+'audio/male-'+String(index).padStart(2,'0')+'.mp3',onEnd);}
export function narratePart(id:PartId,onEnd?:()=>void){const p=parts.find(x=>x.id===id);if(p)return speak(p.female,'female',import.meta.env.BASE_URL+'audio/female-'+id+'.mp3',onEnd);}
export function narrateIntro(onEnd?:()=>void){return speak('Beyond Gravity. An interactive journey into the science of flying cars. Start the story, or explore the machine.','female',import.meta.env.BASE_URL+'audio/female-intro.mp3',onEnd);}
