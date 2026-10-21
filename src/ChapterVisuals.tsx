import React,{useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowDown,ArrowUp,ArrowUpRight,BrainCircuit,Check,ChevronLeft,ChevronRight,Compass,Gauge,Layers,MoveUpRight,Radio,ShieldAlert,Wind,Zap} from 'lucide-react';
import {report,type SimState} from './simulation';

const architectures=[
 {name:'THRUSTER ASSIST',detail:'Fast bursts · finite stored gas',type:'IMPULSE'},
 {name:'MULTICOPTER eVTOL',detail:'Vertical lift · high hover power',type:'ROTOR'},
 {name:'ROADABLE AIRPLANE',detail:'Wingborne cruise · runway need',type:'WING'},
 {name:'MODULAR FLIGHT',detail:'Separate air and road systems',type:'MODULAR'}
];
export function ChapterVisuals({chapter,sim,onExplore,onExperiment}:{chapter:number;sim:SimState;onExplore:()=>void;onExperiment:()=>void}){
 const [architecture,setArchitecture]=useState(0);
 const r=report(sim);
 return <div className="chapter-visuals" aria-label="Animated scientific chapter visuals">
  <AnimatePresence mode="wait">
   <motion.div key={chapter} initial={{opacity:0,y:24,filter:'blur(8px)'}} animate={{opacity:1,y:0,filter:'blur(0px)'}} exit={{opacity:0,y:-14}} transition={{delay:.6,duration:.7}} className="visual-scene">
    <div className="visual-header"><span className="visual-live"/><span>{['EVENT RECONSTRUCTION','VEHICLE SECTION SCAN','UNDERBODY PRESSURE','REACTION PROPULSION','FORCE BALANCE','DIGITAL CONTROL','ENGINEERING PROCESS','DESIGN LIMITATIONS','ARCHITECTURE COMPARISON','RESEARCH HORIZON','SIMULATED HOVER','EPILOGUE'][chapter]}</span><span>BG / {String(chapter+1).padStart(2,'0')}</span></div>
    {chapter===0&&<div className="viz-event"><div className="viz-signal"/><strong>NOT THE SAME AS SUSTAINED FLIGHT</strong><p>Airborne for a moment. Engineering for the next century.</p><span className="viz-event-year">OCT / 2026</span></div>}
    {chapter===1&&<div className="viz-blueprint"><div className="scan-line"/><span>EXTERIOR / EXPLODED ASSEMBLY</span><button onClick={onExplore}><Layers size={16}/> ISOLATE COMPONENTS <ArrowUpRight size={16}/></button></div>}
    {chapter===2&&<div className="viz-force"><div className="viz-force-vectors">{Array.from({length:5},(_,i)=><i key={i} style={{animationDelay:`${i*.18}s`}}><ArrowDown size={20}/></i>)}</div><strong>ΔP × A</strong><span>LOWER PRESSURE · GREATER TRACTION</span><button onClick={onExplore}>TEST FAN COMMAND <ArrowUpRight size={15}/></button></div>}
    {chapter===3&&<div className="viz-force thrust"><div className="viz-nozzle"><div className="viz-nozzle-jet"/></div><strong>ACTION ↔ REACTION</strong><span>GAS MOMENTUM / OPPOSITE FORCE</span><button onClick={onExplore}>INSPECT THE THRUSTER <ArrowUpRight size={15}/></button></div>}
    {chapter===4&&<div className="viz-balance"><div className="viz-center"><span>m</span><ArrowUp/><ArrowDown/></div><div><span>LIFT ↑</span><strong>T ≈ mg</strong><span>WEIGHT ↓</span></div><small>NET FORCE  /  TORQUE  /  ATTITUDE</small></div>}
    {chapter===5&&<div className="viz-control"><div><Radio size={23}/> SENSE</div><span>→</span><div><BrainCircuit size={23}/> COMPUTE</div><span>→</span><div><Zap size={23}/> CORRECT</div><small>THE LOOP NEVER STOPS</small></div>}
    {chapter===6&&<div className="viz-process">{['REQUIREMENTS','SIMULATION','SUBSYSTEM TEST','VALIDATION'].map((s,i)=><div key={s}><span>0{i+1}</span><strong>{s}</strong><Check size={15}/></div>)}</div>}
    {chapter===7&&<div className="viz-limits">{[['MASS','↗'],['ENERGY','↗'],['ENDURANCE','↘'],['RISK','↗']].map(([n,v])=><div key={n}><span>{n}</span><strong>{v}</strong></div>)}<small><ShieldAlert size={15}/> NO SINGLE METRIC TELLS THE WHOLE STORY</small></div>}
    {chapter===8&&<div className="viz-compare"><strong>{architectures[architecture].name}</strong><p>{architectures[architecture].detail}</p><div className="viz-compare-controls"><button aria-label="Previous architecture" onClick={()=>setArchitecture(x=>(x+3)%4)}><ChevronLeft size={18}/></button><span>{architecture+1} / 4</span><button aria-label="Next architecture" onClick={()=>setArchitecture(x=>(x+1)%4)}><ChevronRight size={18}/></button></div><small>AN INTERACTIVE COMPARISON OF DESIGN FAMILIES</small></div>}
    {chapter===9&&<div className="viz-future"><Wind size={30}/><strong>EFFICIENCY</strong><span>WEIGHT</span><span>RESILIENCE</span><span>REPEATABILITY</span><small>PROBLEMS WORTH SOLVING</small></div>}
    {chapter===10&&<div className="viz-power"><span>ELECTRICAL POWER ESTIMATE</span><strong>{Math.round(r.electricalKW)} <small>kW</small></strong><div className="viz-power-bars">{Array.from({length:11},(_,i)=><i key={i} style={{height:`${15+(i+1)*Math.min(7,r.electricalKW/130)}%`}}/>)}</div><button onClick={onExperiment}>CHANGE THE AIRCRAFT <ArrowUpRight size={16}/></button></div>}
    {chapter===11&&<div className="viz-finale"><Compass size={46}/><strong>THE FUTURE IS UNWRITTEN.</strong><span>OBSERVE. TEST. UNDERSTAND.</span></div>}
   </motion.div>
  </AnimatePresence>
 </div>
}
