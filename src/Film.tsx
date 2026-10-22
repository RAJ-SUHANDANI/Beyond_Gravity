import React,{useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {Play,Pause,ChevronRight,ChevronLeft,Volume2,VolumeX,Move3d,FlaskConical,BookOpen,ExternalLink,Info,Subtitles,ArrowUpRight,SkipForward,RotateCcw,X,Video,Clapperboard} from 'lucide-react';
import {Intro} from './Intro';
/* Expensive WebGL, laboratories and OrbitControls are fetched only after
   the visitor enters the film; the cinematic first frame remains lightweight. */
const VehicleScene=React.lazy(()=>import('./Vehicle').then(m=>({default:m.VehicleScene})));
const ExploreLab=React.lazy(()=>import('./Lab').then(m=>({default:m.ExploreLab})));
const ExperimentLab=React.lazy(()=>import('./Lab').then(m=>({default:m.ExperimentLab})));
import {chapters} from './data';
import {evidence,officialHistoric,recentDemonstration,eventReplayURL,eventSegments} from './research';
import {narrateChapter,narrateIntro,stopNarration,pauseNarration,resumeNarration,narrationPosition,setNarrationMuted,setNarrationPlaybackRate} from './audio';
import {initialSim,type SimState} from './simulation';
import {BeatVisualizer,ScienceStudio} from './ScienceStudio';
import {Soundscape} from './soundscape';
type Overlay='explore'|'experiment'|'proof'|'science'|'event'|null;
const videoHref='https://www.tesla.com/roadster';
const ival=(n:number)=>String(n+1).padStart(2,'0');
const clock=(seconds:number)=>{if(!Number.isFinite(seconds)||seconds<0)return '0:00';const value=Math.floor(seconds);return Math.floor(value/60)+':'+String(value%60).padStart(2,'0')};
export default function Film(){
 const theme:'dark'='dark';const [sim,setSim]=useState<SimState>(initialSim);const [spokenCue,setSpokenCue]=useState('');const [playbackTime,setPlaybackTime]=useState<{position:number,duration:number}|null>(null);const [beat,setBeat]=useState(0);const [eventStart,setEventStart]=useState(363);const [speed,setSpeed]=useState(1);const [intro,setIntro]=useState(true),[chapter,setChapter]=useState(0),[playing,setPlaying]=useState(false),[muted,setMuted]=useState(false),[captions,setCaptions]=useState(true),[dossier,setDossier]=useState(false),[overlay,setOverlay]=useState<Overlay>(null),[ready,setReady]=useState(false),[finished,setFinished]=useState(false),[auto,setAuto]=useState(true);
 const chapterRef=useRef(0),transitionRef=useRef(false),autoRef=useRef(true),mutedRef=useRef(false),overlayRef=useRef<Overlay>(null),touchY=useRef(0),timer=useRef<number|undefined>(undefined),wasPlayingBeforeOverlay=useRef(false);
 const soundtrack=useRef<Soundscape|null>(null);const current=chapters[chapter];
 useEffect(()=>{autoRef.current=auto},[auto]);
 useEffect(()=>{if(intro)return;const id=window.setInterval(()=>setPlaybackTime(narrationPosition()),500);return()=>window.clearInterval(id)},[intro]);
 useEffect(()=>{overlayRef.current=overlay;if(overlay){wasPlayingBeforeOverlay.current=playing;pauseNarration();soundtrack.current?.setPaused(true);setPlaying(false);setReady(false)}},[overlay]);
 useEffect(()=>{mutedRef.current=muted;setNarrationMuted(muted);soundtrack.current?.setMuted(muted)},[muted]);
 useEffect(()=>()=>{stopNarration();window.clearTimeout(timer.current);soundtrack.current?.stop()},[]);
 const onNarrationEnd=(i:number,audible:boolean)=>{if(chapterRef.current!==i||overlayRef.current)return;setReady(true);setPlaying(false);soundtrack.current?.setNarrating(false);if(autoRef.current&&audible){timer.current=window.setTimeout(()=>move(1,true),1050)}};
 function narrate(i:number){window.clearTimeout(timer.current);soundtrack.current?.setPaused(false);soundtrack.current?.setChapter(i);setPlaying(true);soundtrack.current?.setNarrating(true);setReady(false);narrateChapter(i,(audible)=>onNarrationEnd(i,audible),(phrase,index,count)=>{setSpokenCue(phrase);setBeat(Math.min(2,Math.floor(index/Math.max(1,count)*3)))})}
 function move(step:number,automatic=false){const value=chapterRef.current;if(transitionRef.current||overlayRef.current)return;if(automatic&&!autoRef.current)return;const next=value+step;if(next>chapters.length-1){setFinished(true);stopNarration();soundtrack.current?.setNarrating(false);return}if(next<0)return;transitionRef.current=true;window.clearTimeout(timer.current);stopNarration();setPlaying(false);setSpokenCue('');setBeat(0);setDossier(false);setReady(false);timer.current=window.setTimeout(()=>{chapterRef.current=next;setChapter(next);soundtrack.current?.setChapter(next);transitionRef.current=false;narrate(next)},850)}
 function begin(){soundtrack.current??=new Soundscape();soundtrack.current.start();soundtrack.current.setPaused(false);soundtrack.current.setChapter(0);soundtrack.current.setNarrating(true);setIntro(false);setReady(false);setMuted(false);mutedRef.current=false;setPlaying(true);narrateIntro(()=>narrate(0),(phrase)=>setSpokenCue(phrase))}
 useEffect(()=>{if(intro)return;const key=(e:KeyboardEvent)=>{if(overlayRef.current)return;if(e.target instanceof HTMLElement&&e.target.closest('button,a,input,textarea,select,[contenteditable="true"]'))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();move(1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();move(-1)}else if(e.key===' '){e.preventDefault();if(playing){pauseNarration();soundtrack.current?.setPaused(true);setPlaying(false)}else{if(resumeNarration()){soundtrack.current?.setPaused(false);soundtrack.current?.setNarrating(true);setPlaying(true);setReady(false)}else narrate(chapterRef.current)}}else if(e.key==='Escape'){setDossier(false);setOverlay(null)}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[intro,playing]);
 // Each wheel gesture advances a discrete film chapter; the previous chapter completes its exit first.
 useEffect(()=>{if(intro)return;let acc=0;const wheel=(e:WheelEvent)=>{if(overlayRef.current)return;if(e.target instanceof Element&&e.target.closest('.film-dossier'))return;const pane=document.querySelector<HTMLElement>('[data-film-scroll]');if(pane&&pane.scrollHeight>pane.clientHeight+2){const remainingDown=pane.scrollTop+pane.clientHeight<pane.scrollHeight-2;const remainingUp=pane.scrollTop>2;if((e.deltaY>0&&remainingDown)||(e.deltaY<0&&remainingUp)){e.preventDefault();pane.scrollTop+=e.deltaY;acc=0;return}}e.preventDefault();acc+=e.deltaY;if(Math.abs(acc)>170){if(acc>0){if(ready)move(1);else if(!playing)move(1)}else move(-1);acc=0}};const options:{passive:boolean}={passive:false};window.addEventListener('wheel',wheel,options);return()=>window.removeEventListener('wheel',wheel)},[intro,ready,playing]);
 const pointerDown=(e:React.TouchEvent)=>{touchY.current=e.changedTouches[0]?.clientY??0};
 const pointerUp=(e:React.TouchEvent)=>{if(overlay)return;const d=touchY.current-(e.changedTouches[0]?.clientY??0);if(Math.abs(d)>80){if(d>0){if(ready||!playing)move(1)}else move(-1)}};
 const togglePlayback=()=>{if(playing){pauseNarration();soundtrack.current?.setPaused(true);setPlaying(false);window.clearTimeout(timer.current)}else{setMuted(false);mutedRef.current=false;soundtrack.current?.setPaused(false);if(resumeNarration()){soundtrack.current?.setNarrating(true);setPlaying(true);setReady(false)}else narrate(chapterRef.current)}};
 const toggleMute=()=>{setMuted(x=>!x)};
 const closeOverlay=()=>{
  const prior=overlayRef.current;
  overlayRef.current=null;setOverlay(null);
  if(prior==='explore'||prior==='experiment')stopNarration();
  if(wasPlayingBeforeOverlay.current){
    if((prior==='science'||prior==='proof'||prior==='event')&&resumeNarration()){
      soundtrack.current?.setPaused(false);setPlaying(true);setReady(false);
    }else{
      narrate(chapterRef.current);
    }
  }else{
    soundtrack.current?.setPaused(false);setReady(true);
  }
  wasPlayingBeforeOverlay.current=false;
 };
 useEffect(()=>{
  if(overlay!=='event'&&overlay!=='proof')return;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const panel=document.querySelector<HTMLElement>('.film-video-proof');
  const close=panel?.querySelector<HTMLButtonElement>('button[aria-label="Close video theater"]');
  close?.focus();
  const keys=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();closeOverlay();return}
   if(e.key!=='Tab'||!panel)return;
   const controls=Array.from(panel.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],iframe,[tabindex]:not([tabindex="-1"])')).filter(x=>x.getClientRects().length>0);
   if(!controls.length)return;
   const first=controls[0],last=controls[controls.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',keys);
  return()=>{document.removeEventListener('keydown',keys);previous?.focus()};
 },[overlay]);
 const stage=chapter===0?recentDemonstration:chapter===1?officialHistoric:chapter===2?[{value:'4 × 20',label:'FAN POWER · kW (REPORTED)'},{value:'ΔP × A',label:'FORCE MODEL'}]:chapter===3?[{value:'N₂',label:'COMPRESSED NITROGEN'},{value:'FINITE',label:'GAS ENDURANCE'}]:[{value:current.stat,label:current.statLabel}];
 return <>{intro?<Intro onEnter={begin}/>:<div className="film-root" onTouchStart={pointerDown} onTouchEnd={pointerUp} data-theme={theme} onPointerMove={e=>{const t=e.currentTarget;t.style.setProperty("--cursor-x",String(e.clientX/window.innerWidth));t.style.setProperty("--cursor-y",String(e.clientY/window.innerHeight));}}>
  {!overlay&&<div className="scene-fixed"><React.Suspense fallback={<div className="film-3d-fallback" role="status"><span>BEYOND GRAVITY / 3D STUDIO</span><strong>REVEALING THE MACHINE</strong><i/></div>}><VehicleScene sim={sim} theme={theme} chapter={chapter} exploded={[1,2,3,5].includes(chapter)} focus={chapter===2?'fans':chapter===3?'thrusters':chapter===5?'computer' :'body'}/></React.Suspense></div>}<div className="film-overlay-dark"/><BeatVisualizer chapter={chapter} beat={beat} sim={sim} onOpen={()=>setOverlay('science')}/>
  <div className="film-chapter-label">BG<span>BEYOND GRAVITY / INTERACTIVE DOCUMENTARY</span></div>
  <div className="film-progress-segments" aria-label="Film chapters">{chapters.map((c,i)=><button key={c.id} className={i<chapter?'complete':i===chapter?'active':''} onClick={()=>{if(i===chapter)return;transitionRef.current=false;chapterRef.current=i;setChapter(i);soundtrack.current?.setChapter(i);setReady(false);stopNarration();narrate(i)}} title={c.title} aria-label={'Go to chapter '+(i+1)}/>)}</div>
  <div className="film-top-actions"><button className="film-glass-button" aria-expanded={dossier} aria-controls="chapter-field-notes" onClick={()=>setDossier(v=>!v)}><BookOpen size={16}/><span>FIELD NOTES</span></button><button className="film-glass-button" onClick={()=>setCaptions(v=>!v)} aria-label={captions?'Hide captions':'Show captions'}><Subtitles size={17}/></button><button className="film-glass-button film-speed-control" aria-label="Change narration playback speed" title="Change playback speed" onClick={()=>{const next=speed===1?1.25:speed===1.25?1.5:speed===1.5 ? 0.75 : 1;setSpeed(next);setNarrationPlaybackRate(next)}}>{speed}×</button><button className="film-glass-button" onClick={toggleMute} aria-label={muted?'Enable narration':'Mute narration'}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button></div>
  <AnimatePresence mode="wait" initial={false}><motion.section className="film-stage" key={chapter} initial={{opacity:0,scale:1.025}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:.985}} transition={{duration:.82,ease:[.2,.75,.2,1]}}><div className="film-reveal-curtain"/><div className="film-reveal-line"/><div className="film-stage-content" data-film-scroll>
    <motion.div className="film-num" initial={{y:26,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.6,delay:.25}}>{current.kicker} <span style={{color:'#8cb5bf'}}> / {ival(chapter)}—12</span></motion.div>
    <div className="filmtag">{current.tag} <span style={{padding:'0 10px'}}>·</span> RESEARCH LED / VISUAL INTERPRETATION</div>
    <motion.h1 initial={{y:95,opacity:0,filter:'blur(10px)'}} animate={{y:0,opacity:1,filter:'blur(0px)'}} transition={{duration:1,delay:.15,ease:[.15,.8,.2,1]}}>{current.title}</motion.h1>
    <motion.h2 initial={{y:32,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.8,delay:.4}}>{current.subtitle}</motion.h2>
    <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1,delay:.6}}>{current.description}</motion.p>
    <motion.div className="film-facts" initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{delay:.7,duration:.5}}>{stage.map((s,i)=><button type="button" onClick={()=>setDossier(true)} className="film-fact" key={s.value+i}><strong>{s.value}</strong><span>{s.label}</span></button>)}</motion.div>
    <div className="film-embed-card"><button className="film-glass-button deep-dive-cta" onClick={()=>setOverlay('science')}><BookOpen size={17}/> DECODE THE SCIENCE <ArrowUpRight size={15}/></button>
      {chapter===0&&<button className="film-glass-button" onClick={()=>{setEventStart(363);setOverlay('event')}}><Video size={16}/> WATCH THE ACTUAL 2026 DEMONSTRATION</button>}
      {chapter===1&&<button className="film-glass-button" onClick={()=>setOverlay('proof')}><Clapperboard size={16}/> WATCH TESLA'S ARCHIVAL ROADSTER UNVEIL</button>}
      {chapter>1&&<button className="film-glass-button" onClick={()=>setOverlay(chapter===10?'experiment':'explore')}>{chapter===10?<FlaskConical size={17}/>:<Move3d size={17}/>} {chapter===10?'OPEN SIMULATOR':'INSPECT THE 3D MECHANISM'}</button>}
    </div>
  </div></motion.section></AnimatePresence>
  <button className="mobile-science-shortcut" onClick={()=>setOverlay('science')} aria-label="Open animated science diagrams"><BookOpen size={14}/> DIAGRAMS <ArrowUpRight size={14}/></button>
  <div className="film-scroll-hint">SCROLL TO ADVANCE <ChevronRight size={15}/></div>
  {captions&&spokenCue&&!dossier&&!overlay&&<div className="film-script" aria-live="off"><div className="film-script-label">DOCUMENTARY CAPTIONS</div>{spokenCue}</div>}
  <AnimatePresence>{dossier&&<motion.aside id="chapter-field-notes" className="film-dossier" role="region" aria-label="Chapter Field Notes" initial={{x:36,opacity:0}} animate={{x:0,opacity:1}} exit={{x:36,opacity:0}} transition={{duration:.3}}><div className="dossier-header"><div className="filmtag">SOURCEBOOK / {ival(chapter)}</div><button type="button" onClick={()=>setDossier(false)} aria-label="Close Field Notes"><X size={18}/><span>CLOSE</span></button></div><h3>{evidence[chapter].heading}</h3><ul>{evidence[chapter].bullets.map(b=><li key={b}>{b}</li>)}</ul><div className="filmtag" style={{marginTop:20}}>VERIFY THE SOURCES</div>{evidence[chapter].sources.map(s=><a key={s.url} target="_blank" rel="noreferrer" href={s.url}>{s.name}<ArrowUpRight size={14}/></a>)}<div className="film-links"><button onClick={()=>setDossier(false)}>CLOSE SOURCEBOOK</button></div></motion.aside>}</AnimatePresence>
  <div className="film-bottom"><div className="film-counter">CHAPTER {ival(chapter)} / {chapters.length} <span style={{display:'block',marginTop:5,color:'#8eb9bc'}}> {ready?'READY TO CONTINUE':playing?'DOCUMENTARY IN PROGRESS':'PAUSED'}</span></div><div className="film-transport"><button className="film-glass-button" onClick={()=>move(-1)} aria-label="Previous chapter"><ChevronLeft size={20}/></button><button className="transport-main" onClick={togglePlayback} aria-label={playing?'Pause narration':'Resume narration'}>{playing?<Pause size={19} fill="currentColor"/>:<Play size={19} fill="currentColor"/>}</button><button className="film-glass-button" onClick={()=>move(1)} aria-label="Next chapter"><ChevronRight size={20}/></button><button className="film-glass-button" onClick={()=>setAuto(x=>!x)} title={auto?'Disable automatic chapter progression':'Enable automatic chapter progression'}>{auto?'AUTO ON':'AUTO OFF'}</button></div><div className="film-activity"><div className="film-player-status"><b/>{playing?'AUDIO RUNNING':ready?'READY FOR NEXT CHAPTER':'DOCUMENTARY'}</div><span className="film-audio-clock">{playbackTime?clock(playbackTime.position)+' / '+clock(playbackTime.duration):'NARRATION READY'}</span><span className="film-creator-credit">Made by Raj Suhandani</span></div><div className="film-track" role="progressbar" aria-label="Documentary progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((chapter+(playbackTime&&playbackTime.duration>0?playbackTime.position/playbackTime.duration:0))/chapters.length*100)}><span style={{width:((chapter+(playbackTime&&playbackTime.duration>0?playbackTime.position/playbackTime.duration:0))/chapters.length*100)+'%'}}/></div></div>
  <div className="film-small-legal">INDEPENDENT EDUCATIONAL WORK · NOT AFFILIATED WITH TESLA, SPACEX OR NETFLIX</div>
  {overlay==='science'&&<ScienceStudio chapter={chapter} sim={sim} onClose={closeOverlay}/>}
  {overlay==='explore'&&<React.Suspense fallback={<div className="film-modal-loading" role="status">PREPARING THE ENGINEERING LABORATORY…</div>}><ExploreLab audioOn={!muted} onClose={closeOverlay} sim={sim} setSim={setSim} theme={theme}/></React.Suspense>}
  {overlay==='experiment'&&<React.Suspense fallback={<div className="film-modal-loading" role="status">PREPARING THE ENGINEERING LABORATORY…</div>}><ExperimentLab onClose={closeOverlay} sim={sim} setSim={setSim} theme={theme}/></React.Suspense>}
  {overlay==='event'&&<div className="film-video-proof" role="dialog" aria-modal="true" aria-label="Official Tesla Roadster 2026 demonstration footage">
   <div className="proof-inner">
    <div className="proof-top"><strong>TESLA ROADSTER · OFFICIAL 2026 UNVEILING</strong><button className="film-glass-button" onClick={closeOverlay} aria-label="Close video theater"><X size={20}/> CLOSE</button></div>
    <div className="film-official-video">
     <iframe key={eventStart} title="Tesla official Roadster 2026 launch livestream" src={`https://www.youtube-nocookie.com/embed/qt5p-_tE8d0?start=${eventStart}&rel=0&playsinline=1`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/>
    </div>
    <div className="event-segments">
      {eventSegments.map(segment=>{
       const [minutes,seconds]=segment.time.split(':').map(Number);const at=minutes*60+seconds;
       return <button className={eventStart===at?'selected':''} key={segment.time} onClick={()=>setEventStart(at)} aria-label={`Jump to ${segment.title} at ${segment.time}`}><span>{segment.time}</span>{segment.title}</button>
      })}
    </div>
    <p className="event-rights-note">Publisher-hosted official Tesla event, 15 October 2026. The event footage remains Tesla’s intellectual property. Beyond Gravity is independent; this documentary does not download or republish the footage.</p>
    <a className="event-source-link" href="https://www.youtube.com/live/qt5p-_tE8d0" target="_blank" rel="noreferrer">OPEN ORIGINAL TESLA VIDEO ON YOUTUBE <ArrowUpRight size={14}/></a>
   </div>
  </div>}
  {overlay==='proof'&&<div className="film-video-proof" role="dialog" aria-modal="true" aria-label="Archival Tesla unveiling footage"><div className="proof-inner"><div className="proof-top"><strong>OFFICIAL TESLA ROADSTER UNVEIL / ARCHIVE FROM 2017</strong><button className="film-glass-button" onClick={closeOverlay} aria-label="Close video theater"><X size={20}/> CLOSE</button></div><iframe title="Tesla Roadster 2017 official unveiling video" src="https://player.vimeo.com/video/249563752?dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/><p style={{fontSize:11,color:'#a9bbc5',lineHeight:1.5}}>Video embedded from the Vimeo player featured on Tesla's Roadster website. It predates the October 2026 flight demonstration.</p></div></div>}
  {finished&&<div className="film-end-overlay"><div className="filmtag">THIS IS NOT THE END OF THE STORY</div><h2>BEYOND<br/>GRAVITY.</h2><p>The Roadster's stunt showed what's possible for a moment. The future asks how to make flight safe, practical, and repeatable.</p><div className="film-links"><button onClick={()=>{setFinished(false);chapterRef.current=0;setChapter(0);narrate(0)}}><RotateCcw size={16}/> REPLAY THE DOCUMENTARY</button><button onClick={()=>{setFinished(false);setOverlay('experiment')}}>ENTER THE FUTURE LAB ↗</button><a href="https://github.com/RAJ-SUHANDANI/Beyond_Gravity" target="_blank" rel="noreferrer" style={{border:'1px solid #a9e1d355',padding:'13px',fontSize:11}}>VIEW THE SOURCE ↗</a></div></div>}
 </div>}</>
}
