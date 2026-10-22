import React,{useEffect,useRef,useState} from 'react';
import {X,RotateCcw,Move3d,Info,Minus,Plus,ChevronRight,ExternalLink,ScanEye} from 'lucide-react';
import {VehicleScene} from './Vehicle';
import {parts,type PartId} from './data';
import {bounds,initialSim,adjust,report,type SimKey,type SimState} from './simulation';
import {narratePart,stopNarration} from './audio';
type Shared={onClose:()=>void;sim:SimState;setSim:React.Dispatch<React.SetStateAction<SimState>>;theme:'dark'|'light'};
function Stepper({name,sim,setSim}:{name:SimKey;sim:SimState;setSim:React.Dispatch<React.SetStateAction<SimState>>}){const v=sim[name],b=bounds[name];const val=name==='efficiency'?Math.round(v*100)+'%':v.toLocaleString('en-US')+' '+b.unit;return <div className="control-stepper"><span className="stepper-label">{b.title}</span><div className="stepper-bar"><button aria-label={'Decrease '+b.title} disabled={v<=b.min} onClick={()=>setSim(s=>adjust(s,name,-1))}><Minus size={17}/></button><output>{val}</output><button aria-label={'Increase '+b.title} disabled={v>=b.max} onClick={()=>setSim(s=>adjust(s,name,1))}><Plus size={17}/></button></div><div className="stepper-limits"><small>{name==='efficiency'?'40%':b.min+' '+b.unit}</small><small>{name==='efficiency'?'85%':b.max+' '+b.unit}</small></div></div>}
const sceneControls=['body','fans','vessel','thrusters','wheels','computer'] as PartId[];
function LabShell({onClose,title,tag,children,theme}:{onClose:()=>void;title:string;tag:string;children:React.ReactNode;theme:'dark'|'light'}){
 const dialog=useRef<HTMLDivElement>(null);
 const handleClose=useRef(onClose);handleClose.current=onClose;
 useEffect(()=>{
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const root=dialog.current;
  root?.querySelector<HTMLButtonElement>('button[aria-label="Close laboratory"]')?.focus();
  const keys=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();handleClose.current();return}
   if(event.key!=='Tab'||!root)return;
   const controls=Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(el=>el.getClientRects().length>0);
   if(!controls.length)return;
   const first=controls[0],last=controls[controls.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  };
  document.addEventListener('keydown',keys);
  return()=>{document.removeEventListener('keydown',keys);previous?.focus()};
 },[]);
 return <div ref={dialog} className={'overlay-screen lab-revamp '+(theme==='light'?'theme-light':'theme-dark')} role="dialog" aria-modal="true" aria-label={title}>
  <header className="lab-header">
   <div className="lab-heading"><div className="eyebrow">{tag}</div><h2>{title}<span className="accent">.</span></h2><span className="lab-creator">Made by Raj Suhandani</span></div>
   <button className="round-control" onClick={onClose} aria-label="Close laboratory"><X size={22}/></button>
  </header>
  {children}
 </div>
}
export function ExploreLab({onClose,audioOn,sim,setSim,theme}:Shared&{audioOn:boolean}){const[part,setPart]=useState<PartId>('fans'),[exploded,setExploded]=useState(false);const[inspection,setInspection]=useState(true);const p=parts.find(x=>x.id===part)!;
 const focus=(id:PartId)=>{setPart(id);setInspection(true);setExploded(false);if(audioOn)narratePart(id)};
 useEffect(()=>()=>stopNarration(),[]);
 const r=report(sim);
 return <LabShell onClose={()=>{stopNarration();onClose()}} theme={theme} title="ANATOMY OF THE MACHINE" tag="RESEARCH FACILITY / EXPLODED SYSTEMS / LAB 01"><div className="explore-layout"><div className="explore-stage high-fidelity-stage"><VehicleScene focus={part} exploded={exploded} interactive inspection={inspection} onSelect={focus} sim={sim} theme={theme}/><div className="stage-overlay-top"><span className="live-dot"/> DETAIL MODE <span className="stage-divider"/> CLICK COMPONENT · DRAG TO ORBIT</div><div className="inspection-indicator"><span>ISOLATED OBJECT</span><strong>{p.code}</strong><small>{inspection?'FOREGROUND INSPECTION ACTIVE':'ASSEMBLY MODE'}</small></div><div className="stage-buttons"><button className="ghost-button" onClick={()=>setInspection(x=>!x)}><ScanEye size={16}/>{inspection?'VIEW COMPLETE CAR':'ISOLATE SELECTION'}</button><button onClick={()=>{setExploded(x=>!x);setInspection(false)}} className="ghost-button"><Move3d size={16}/>{exploded?'REASSEMBLE':'EXPLODE COMPONENTS'}</button><button onClick={()=>{setPart('body');setInspection(false);setExploded(false)}} className="ghost-button"><RotateCcw size={16}/> RESET CAMERA SUBJECT</button></div></div><aside className="parts-panel new-parts-panel"><div className="eyebrow">SUBSYSTEM SELECTOR / SIX INTERACTIVE OBJECTS</div><div className="parts-list">{parts.map(item=><button key={item.id} className={'part-button '+(part===item.id?'selected':'')} onClick={()=>focus(item.id)}><span>{item.code}</span><strong>{item.name}</strong><ChevronRight size={16}/></button>)}</div><div className="selected-part"><div className="eyebrow">PRIMARY OBJECT / {p.principle}</div><h3>{p.name}</h3><p>{p.summary}</p><p className="note"><Info size={14}/> Inspection graphics are independently authored representations, not Tesla CAD.</p><div className="compact-lab-metrics"><span>SIMULATED SUCTION FORCE</span><strong>{Math.round(r.suctionNewtons).toLocaleString()} N</strong></div><Stepper name="pressure" sim={sim} setSim={setSim}/><Stepper name="fanPower" sim={sim} setSim={setSim}/><div className="stepper-crosslink">These settings also drive the animated suction system and remain saved when you switch into Future Lab.</div></div></aside></div></LabShell>}
function HoverPowerCurve({sim}:{sim:SimState}){
 const values=Array.from({length:19},(_,i)=>{
  const area=4+i*2;
  return {area,power:report({...sim,area}).electricalKW};
 });
 const chartW=620,chartH=214,left=49,right=22,top=19,bottom=34;
 const minArea=4,maxArea=40;
 const yMax=Math.max(100,Math.ceil(Math.max(...values.map(v=>v.power))/100)*100);
 const x=(a:number)=>left+(a-minArea)/(maxArea-minArea)*(chartW-left-right);
 const y=(p:number)=>top+(1-p/yMax)*(chartH-top-bottom);
 const path=values.map((v,i)=>`${i?'L':'M'}${x(v.area).toFixed(2)},${y(v.power).toFixed(2)}`).join(' ');
 const current=report(sim).electricalKW;
 return <div className="hover-curve">
  <div className="eyebrow">LIVE EXPERIMENT / INDUCED POWER VS ROTOR DISK AREA</div>
  <svg viewBox="0 0 620 214" role="img" aria-label={`Estimated electrical hover power curve. At ${sim.area} square meters, ${Math.round(current)} kilowatts.`}>
   <defs><linearGradient id="hover-area-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a7f4df" stopOpacity=".24"/><stop offset="1" stopColor="#a7f4df" stopOpacity="0"/></linearGradient></defs>
   {[0,.25,.5,.75,1].map((v,i)=><g key={i}>
     <path d={`M${left},${y(yMax*v)} H${chartW-right}`} stroke="#5d8d96" opacity=".3" strokeWidth="1"/>
     <text x={left-9} y={y(yMax*v)+4} fill="#94bec7" fontSize="11" textAnchor="end">{Math.round(yMax*v)}</text>
   </g>)}
   <path d={`M${left},${top}V${chartH-bottom}H${chartW-right}`} fill="none" stroke="#8ab9b9" strokeWidth="1"/>
   <path d={path+` L${x(maxArea)},${chartH-bottom} L${x(minArea)},${chartH-bottom}Z`} fill="url(#hover-area-shade)"/>
   <path d={path} fill="none" stroke="#b6ffe8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
   <path d={`M${x(sim.area)},${top}V${chartH-bottom}`} stroke="#b6ffe8" strokeDasharray="4 5" opacity=".55"/>
   <circle cx={x(sim.area)} cy={y(current)} r="7" fill="#d3fff1" stroke="#13434c" strokeWidth="3"/>
   {[4,12,20,28,36,40].map(a=><text key={a} x={x(a)} y={chartH-12} fill="#9cbec4" fontSize="11" textAnchor="middle">{a}</text>)}
   <text x={chartW-right} y={chartH-1} fill="#a8dcd6" fontSize="10" textAnchor="end">DISK AREA (m²)</text>
   <text x={left} y="12" fill="#a8dcd6" fontSize="11">kW</text>
  </svg>
  <div className="hover-curve-caption"><span>CURRENT: {Math.round(current)} kW at {sim.area} m²</span><span>MODELLED AT FIXED MASS & EFFICIENCY</span></div>
 </div>
}
export function ExperimentLab({onClose,sim,setSim,theme}:Shared){const [modelReady,setModelReady]=useState(false);const r=report(sim);const stats=[['HOVER THRUST',(r.thrust/1000).toFixed(1),'kN'],['IDEAL HOVER POWER',r.idealKW.toFixed(0),'kW'],['EST. ELECTRICAL POWER',r.electricalKW.toFixed(0),'kW'],['TEN-MINUTE HOVER ENERGY',r.tenMinuteKWh.toFixed(1),'kWh']];return <LabShell onClose={onClose} theme={theme} title="THE FUTURE LAB" tag="SIMULATION SUITE / FLIGHT DYNAMICS / LAB 02"><div className="simulation-layout revamped-sim-layout"><div className="simulation-visual live-sim-3d" data-model-ready={modelReady?'true':'false'}><VehicleScene interactive variant="evtol" sim={sim} theme={theme} onReady={()=>setModelReady(true)}/>{!modelReady&&<div className="scene-warmup" role="status" aria-live="polite">INITIALIZING 3D VEHICLE<span>ENGINEERING VIEWPORT</span></div>}<div className="stage-overlay-top"><span className="live-dot"/> LIVE 3D MODEL <span className="stage-divider"/> EDUCATIONAL eVTOL CONCEPT</div><div className="sim-caption">ANIMATED ROTOR DIAMETER AND HOVER RESPONSE<small>Engineering visualization, not a validated flight model</small></div><div className="sim-live-strip"><span>ROTOR AREA / {sim.area} m²</span><span>MASS / {sim.mass} kg</span><span>EFFICIENCY / {Math.round(sim.efficiency*100)}%</span></div></div><div className="experiment-controls"><div className="eyebrow">INTERACTIVE PARAMETERS / SHARED WITH THE CAR LAB</div><h3>Change the physics.<br/>Watch the machine respond.</h3><div className="preset-buttons">{[{label:'LIGHTWEIGHT',mass:550,area:20,efficiency:.8},{label:'BALANCED',mass:950,area:15,efficiency:.67},{label:'HEAVY',mass:1650,area:9,efficiency:.5}].map(p=><button key={p.label} onClick={()=>setSim(s=>({...s,...p}))}>{p.label}</button>)}</div><div className="stepper-grid"><Stepper name="mass" sim={sim} setSim={setSim}/><Stepper name="area" sim={sim} setSim={setSim}/><Stepper name="efficiency" sim={sim} setSim={setSim}/><Stepper name="fanPower" sim={sim} setSim={setSim}/></div><div className="sim-results">{stats.map(([name,value,unit])=><div className="sim-result" key={name}><span>{name}</span><strong>{value} <small>{unit}</small></strong></div>)}</div><HoverPowerCurve sim={sim}/><p className="note"><Info size={15}/> Educational momentum-theory model at 1.225 kg/m³, with simplified efficiency. This eVTOL visual represents a conceptual rotor aircraft, not the Tesla Roadster cold-gas system or flight certification data.</p><button className="ghost-button" onClick={()=>setSim(initialSim)}><RotateCcw size={16}/> RESTORE BASELINE</button></div></div></LabShell>}
