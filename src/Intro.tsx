import React,{useEffect,useRef,useState} from 'react';
import {motion,AnimatePresence} from 'motion/react';
import {ArrowUpRight,Volume2,VolumeX,Play,MoveUpRight} from 'lucide-react';

/**
 * The entrance is VIDEO-LED, not a procedural-model preview.
 * Official historic Tesla Roadster unveil is embedded from Tesla's Vimeo player,
 * never mirrored, trimmed, downloaded or republished.
 */
export function Intro({onEnter}:{onEnter:()=>void}){
 const [sound,setSound]=useState(true),[loaded,setLoaded]=useState(false);
 const background=useRef<HTMLDivElement>(null);
 const button=useRef<HTMLButtonElement>(null);
 const [departing,setDeparting]=useState(false);
 const position=useRef({x:0,y:0});
 useEffect(()=>{const id=window.setTimeout(()=>setLoaded(true),400);return()=>window.clearTimeout(id)},[]);
 const move=(e:React.PointerEvent)=>{const x=e.clientX/window.innerWidth-.5,y=e.clientY/window.innerHeight-.5;position.current={x,y};if(background.current){background.current.style.setProperty('--px',String(x));background.current.style.setProperty('--py',String(y));}};
 const magnetic=(e:React.PointerEvent<HTMLButtonElement>)=>{if(!button.current)return;const r=button.current.getBoundingClientRect();button.current.style.setProperty('--mag-x',String((e.clientX-r.left-r.width/2)*.13)+'px');button.current.style.setProperty('--mag-y',String((e.clientY-r.top-r.height/2)*.13)+'px');};
 const enter=()=>{if(departing)return;setDeparting(true);window.setTimeout(onEnter,850)};
 return <div className={'cinema-intro '+(departing?'cinema-departing':'')} onPointerMove={move} ref={background}>
  <div className="intro-video" aria-hidden="true"><iframe src="https://player.vimeo.com/video/249563752?background=1&autoplay=1&muted=1&loop=1&autopause=0&controls=0&dnt=1" title="Tesla 2017 Roadster unveiling archival video" tabIndex={-1} allow="autoplay; fullscreen; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin"/></div>
  <div className="intro-dark"/><div className="intro-cinematic-bars" aria-hidden="true"/><div className="intro-beam"/><div className="intro-glass"/><div className="intro-aperture"/><div className="intro-shadow-sweep"/><div className="intro-edge-light"/>
  <div className="intro-crosshair left" aria-hidden="true">+</div><div className="intro-crosshair right" aria-hidden="true">+</div>
  <div className="intro-top"><div className="intro-monogram">BG<span>—</span>001</div><span>AN INDEPENDENT INTERACTIVE DOCUMENTARY</span><span className="intro-corner">2026 / FLIGHT RESEARCH</span></div>
  <div className="intro-middle">
    <motion.div className="intro-eyebrow" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.05,duration:.8}}>A STORY ABOUT THE MACHINE THAT DEFIED EXPECTATIONS</motion.div>
    <div className="intro-heading-mask"><h1 className="intro-title">BEYOND <em>GRAVITY.</em></h1></div>
    <div className="intro-strap">THE STUNT. <span>THE SCIENCE.</span> THE FUTURE.</div>
  </div>
  <div className="intro-bottom">
    <div className="intro-bottom-left"><span className="intro-index"><i/> EXPERIENCE 001</span><span>TESLA ROADSTER / ENGINEERING / FLIGHT</span><span className="intro-archive">ARCHIVAL OPENING FOOTAGE: TESLA ROADSTER UNVEIL (2017)</span></div>
    <div className="intro-enter-wrap"><span className="intro-enter-caption">A DOCUMENTARY YOU CAN STEP INSIDE</span>
      <button ref={button} onClick={enter} onPointerMove={magnetic} onPointerLeave={()=>{if(button.current){button.current.style.setProperty('--mag-x','0px');button.current.style.setProperty('--mag-y','0px')}}} className="intro-enter" aria-label="Enter documentary experience"><span className="enter-inner"><span className="enter-small">BEGIN THE FILM</span><strong>ENTER EXPERIENCE</strong></span><span className="enter-icon"><ArrowUpRight size={24}/></span></button>
    </div>
  </div>
  <div className="intro-timeline" aria-hidden="true"><span>00:00</span><div><i/></div><span>INTRO</span></div>
  <div className="intro-flash" aria-hidden="true"/>
  <div className="intro-caption-hidden">The opening video is Tesla's 2017 Roadster unveil, not the 2026 flight demo. Beyond Gravity is independent and not endorsed by Tesla or Netflix.</div>
 </div>
}
