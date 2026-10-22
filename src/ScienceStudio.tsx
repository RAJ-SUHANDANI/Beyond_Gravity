import React,{useEffect,useMemo,useState} from 'react';
import {AnimatePresence,motion} from 'motion/react';
import {ArrowLeft,ArrowRight,ArrowUpRight,BookOpen,ChevronLeft,ChevronRight,Maximize2,X,Compass,Layers,FlaskConical} from 'lucide-react';
import {story,type Beat} from './story';
import {chapters} from './data';
import {report,type SimState} from './simulation';

type GraphicProps={chapter:number;beat:number;sim:SimState;large?:boolean};
const outline=(x:string,y:string)=>({x,y});
function EngineeringGraphic({chapter,beat,sim,large=false}:GraphicProps){
 const active=story[chapter]?.[beat];const type=active?.visual||'timeline';
 const r=report(sim);
 const points=Array.from({length:9},(_,i)=>{const area=5+i*4;const e=report({...sim,area});return {area,power:e.electricalKW}});
 const chart=points.map((p,i)=>`${i?'L':'M'} ${65+i*70} ${285-Math.min(220,p.power/5)}`).join(' ');
 const glows=Array.from({length:8},(_,i)=>i);
 return <svg viewBox="0 0 720 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label={active?.why||'Engineering educational diagram'} className={'science-graphic '+(large?'large':'')}>
 <defs>
  <linearGradient id="ribbonX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#62abaf" stopOpacity=".18"/><stop offset=".55" stopColor="#b5f8e7" stopOpacity=".9"/><stop offset="1" stopColor="#62abaf" stopOpacity=".2"/></linearGradient>
  <linearGradient id="nozzleX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8ec8c5" stopOpacity=".9"/><stop offset="1" stopColor="#c8ffff" stopOpacity="0"/></linearGradient>
  <filter id="softX"><feGaussianBlur stdDeviation="5"/></filter>
  <pattern id="scienceGrid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 L 0 0 0 34" fill="none" stroke="#6bada8" strokeWidth=".55" opacity=".3"/></pattern>
 </defs>
 <rect width="720" height="360" fill="#07131c"/><rect width="720" height="360" fill="url(#scienceGrid)"/>
 <g stroke="#80c9bf" opacity=".35" strokeWidth="1"><path d="M45 44H130 M45 44V105"/><path d="M675 44H590 M675 44V105"/><path d="M45 316H130 M45 316V255"/><path d="M675 316H590 M675 316V255"/></g>
 {type==='timeline'&&<g>
  <path d="M70 205H640" stroke="#86bbb5" strokeWidth="2" strokeDasharray="6 8"/>
  {[0,1,2,3].map((i)=><g key={i}><circle cx={125+i*155} cy={205} r={16} fill="#09202b" stroke={i===beat?'#d4fff3':'#629a9e'} strokeWidth="2"/><text x={125+i*155} y={210} textAnchor="middle" fill="#c8fff3" fontSize="13">{i+1}</text></g>)}
  <g><path d="M100 147 C210 112 280 135 355 147 S510 167 610 127" fill="none" stroke="url(#ribbonX)" strokeWidth="4"/><circle className="glow-marker" cx={340+beat*55} cy="143" r="7" fill="#dcfff4"/></g>
  <text x="75" y="90" fill="#f1fff9" fontSize="22" fontWeight="700">DEMONSTRATION</text><text x="75" y="277" fill="#a3d8d3" fontSize="14">OBSERVATION → MODEL → VERIFICATION → CERTIFICATION</text>
 </g>}
 {type==='cutaway'&&<g>
   <path d="M95 212 Q150 182 200 181 L265 132 Q290 118 345 120 L448 123 Q490 126 525 166 L612 185 Q627 190 630 212Z" fill="#183742" stroke="#a3ebda" strokeWidth="3"/>
   <path d="M235 176 L280 135 L432 133 L465 176Z" fill="#2a5964" stroke="#8db8bd" strokeWidth="2"/>
   {[195,534].map((x)=><g key={x}><circle cx={x} cy="217" r="38" fill="#03090e" stroke="#b5ebdf" strokeWidth="9"/><circle cx={x} cy="217" r="19" fill="#395762" stroke="#b5ebdf" strokeWidth="2"/></g>)}
   {[0,1,2].map((i)=><g key={i} className="cutaway-float" style={{animationDelay:`${i*.2}s`}}><rect x={275+i*57} y={178-i*19} width="45" height="34" rx="3" fill="none" stroke={i===beat?'#d4fff3':'#7da9b3'} strokeWidth="2"/><path d={`M${297+i*57} ${174-i*19}V${104-i*22}`} stroke="#98d5cb" strokeDasharray="3 5"/></g>)}
   <text x="76" y="67" fill="#d5f9ed" fontSize="18" fontWeight="700">ILLUSTRATIVE ASSEMBLY</text><text x="76" y="315" fill="#a0c4cb" fontSize="12">NOT A MANUFACTURER CAD MODEL</text>
 </g>}
 {type==='pressure'&&<g>
   <path d="M105 163H620L586 209H142Z" fill="#214550" stroke="#b4f7e2" strokeWidth="2"/>
   <path d="M142 209H586V271H142Z" fill="#08232c" stroke="#8bc3bf" strokeDasharray="5 8"/>
   {[190,268,350,432,510].map((x,i)=><g key={x} className="science-arrow" style={{animationDelay:`${i*.2}s`}}><path d={`M${x} 86V149`} stroke="#b9f9e6" strokeWidth="3"/><path d={`M${x-9} 136L${x} 151L${x+9} 136`} fill="none" stroke="#b9f9e6" strokeWidth="3"/></g>)}
   {[170,260,350,440,530].map(x=><g key={x}><path d={`M${x} 257V223`} stroke="#56bac3" strokeWidth="2" strokeDasharray="5 6"/><path d={`M${x-6} 229L${x} 221L${x+6} 229`} fill="none" stroke="#56bac3" strokeWidth="2"/></g>)}
   <text x="115" y="54" fill="#d6fff3" fontSize="18">ATMOSPHERIC PRESSURE ↓</text><text x="174" y="306" fill="#91bbc9" fontSize="17">LOWER UNDERBODY PRESSURE ↑</text>
 </g>}
 {type==='thruster'&&<g>
   <path d="M112 134L332 134L375 166L332 199L112 199Z" fill="#274954" stroke="#b4f7e8" strokeWidth="2"/>
   <path d="M375 158H418L450 176L418 191H375Z" fill="#758f9e" stroke="#c1e4e0" strokeWidth="2"/>
   {[0,1,2,3,4,5,6].map(i=><path key={i} className="gas-jet" style={{animationDelay:`${i*.16}s`}} d={`M${475+i*24} ${167-i%3*9}h${40+i%3*12}`} stroke="#b1f7f7" strokeWidth={1+i%3} opacity={.7}/>)}
   <path d="M175 256H340M185 248L173 256L185 264" fill="none" stroke="#b8f8e3" strokeWidth="4"/>
   <text x="110" y="89" fill="#e9fff7" fontSize="19">GAS STORAGE</text><text x="452" y="114" fill="#a8e8df" fontSize="16">EXHAUST →</text><text x="176" y="295" fill="#a8e8df" fontSize="16">← REACTION FORCE</text>
 </g>}
 {type==='forces'&&<g>
   <path d="M265 147L350 116L439 147L448 210L352 241L259 213Z" fill="#213e4e" stroke="#aeeedf" strokeWidth="2"/>
   <circle cx="350" cy="178" r="13" fill="#baf8e8"/>
   <path d="M350 164V68M350 193V298" stroke="#caffee" strokeWidth="4"/>
   <path d="M338 82L350 61L362 82M338 282L350 303L362 282" fill="none" stroke="#caffee" strokeWidth="3"/>
   <text x="370" y="81" fill="#ceffed" fontSize="17">LIFT</text><text x="369" y="297" fill="#ceffed" fontSize="17">WEIGHT</text>
   <path d="M525 183C525 145 480 115 449 115" fill="none" stroke="#77ccd4" strokeWidth="3" strokeDasharray="7 8"/>
   <text x="510" y="131" fill="#a4d1d2" fontSize="18">TORQUE</text>
 </g>}
 {type==='feedback'&&<g>
   {['SENSE','ESTIMATE','CORRECT'].map((t,i)=><g key={t}><rect x={55+i*220} y="105" width="170" height="104" rx="10" fill="#183943" stroke={i===beat?'#d5fff1':'#88bdbc'} strokeWidth="2"/><text x={140+i*220} y="158" fontSize="20" textAnchor="middle" fill="#d5fff1" fontWeight="700">{t}</text><text x={140+i*220} y="185" fontSize="12" textAnchor="middle" fill="#9bc6cc">STATE {i+1}</text>{i<2&&<path className="flow-link" d={`M${225+i*220} 158h49`} stroke="#b7ffe5" strokeWidth="3"/>}</g>)}
   <path d="M580 225V264H145V218" stroke="#8cbdb9" strokeWidth="2" strokeDasharray="7 7" fill="none"/>
   <text x="352" y="292" fill="#9acac4" textAnchor="middle" fontSize="15">MEASURE THE RESPONSE AGAIN</text>
 </g>}
 {type==='testing'&&<g>{['REQUIREMENTS','SIMULATE','BENCH TEST','FLIGHT TEST'].map((t,i)=><g key={t}><rect x={70+i*150} y={100+i*26} width="132" height="80" rx="6" stroke={i===beat?'#dbfff5':'#699fa0'} fill="#15313c" strokeWidth="2"/><text x={136+i*150} y={145+i*26} fontSize="13" textAnchor="middle" fill="#dbfff3">{t}</text>{i<3&&<path d={`M${203+i*150} ${142+i*26}h17`} stroke="#a4f9e7" strokeWidth="2"/>}</g>)}</g>}
 {type==='limits'&&<g>{[['MASS','+ WEIGHT'],['ENERGY','+ STORAGE'],['SAFETY','+ REDUNDANCY'],['OPERATIONS','+ CONSTRAINTS']].map((x,i)=><g key={i}><rect x={72+(i%2)*295} y={76+Math.floor(i/2)*132} width="262" height="104" rx="6" fill="#112c39" stroke="#7eadaa"/><text x={97+(i%2)*295} y={113+Math.floor(i/2)*132} fill="#d2f8ee" fontSize="17" fontWeight="700">{x[0]}</text><text x={97+(i%2)*295} y={149+Math.floor(i/2)*132} fill="#96ccd2" fontSize="13">{x[1]}</text></g>)}</g>}
 {type==='compare'&&<g>{['THRUSTER','ROTOR','WING','MODULAR'].map((t,i)=><g key={i}><circle cx={120+i*156} cy={160} r={i===beat?53:44} fill="#18323e" stroke={i===beat?'#c3fff0':'#86bcb6'} strokeWidth="2"/><path d={`M${120+i*156-30} 160H${120+i*156+30}`} stroke="#b4eee4" strokeWidth="3"/><text x={120+i*156} y="252" textAnchor="middle" fontSize="14" fill="#d7f7ef">{t}</text></g>)}</g>}
 {type==='future'&&<g>{['EFFICIENCY','MATERIALS','CONTROL'].map((t,i)=><g key={i}><path d={`M${116+i*210} 255L${187+i*210} 112L${258+i*210} 255Z`} fill="#173643" stroke={i===beat?'#c5ffeb':'#79b4bd'} strokeWidth="2"/><text x={187+i*210} y="285" textAnchor="middle" fontSize="14" fill="#d8fff4">{t}</text></g>)}</g>}
 {type==='power'&&<g>
   <path d="M70 70V285H667" fill="none" stroke="#8bb6b7" strokeWidth="2"/>
   <path d={chart} fill="none" stroke="#b8f9dd" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
   {points.map((p,i)=><circle key={i} cx={65+i*70} cy={285-Math.min(220,p.power/5)} r="5" fill="#dcffec" stroke="#0a1e23" strokeWidth="2"/>)}
   <text x="95" y="46" fill="#d7fff0" fontSize="18" fontWeight="700">POWER vs ROTOR DISK AREA</text><text x="94" y="320" fill="#9ccacb" fontSize="14">INCREASING DISK AREA →</text><text x="20" y="190" fill="#9ccacb" fontSize="14" transform="rotate(-90 20 190)">kW</text>
   <rect x="480" y="64" width="169" height="58" rx="4" fill="#142d35" stroke="#669f9f"/><text x="493" y="84" fill="#a3cfc9" fontSize="11">CURRENT ESTIMATE</text><text x="493" y="110" fill="#d6ffed" fontSize="21" fontWeight="700">{Math.round(r.electricalKW)} kW</text>
 </g>}
 {type==='epilogue'&&<g><circle cx="358" cy="180" r="110" fill="none" stroke="#85bbb9" strokeWidth="2"/><circle cx="358" cy="180" r="66" fill="none" stroke="#b2f1de" strokeDasharray="9 10" strokeWidth="2" className="orbiting"/><path d="M258 180H458M358 80V280" stroke="#a1e8da" strokeWidth="1"/><text x="358" y="190" textAnchor="middle" fontWeight="700" fontSize="21" fill="#dffff0">WHAT NEXT?</text></g>}
 <text x="45" y="346" fill="#6d9ca8" fontSize="10" letterSpacing="2">BEYOND GRAVITY   /   TECHNICAL VISUALIZATION   /   NOT CERTIFIED ENGINEERING DATA</text>
 </svg>
}

export function BeatVisualizer({chapter,beat,sim,onOpen}:{chapter:number;beat:number;sim:SimState;onOpen:()=>void}){
 const info=story[chapter]?.[beat]||story[0][0];
 return <motion.aside className="beat-visual" key={chapter+':'+beat} initial={{opacity:0,y:23}} animate={{opacity:1,y:0}} transition={{duration:.55}} aria-label="Current animated engineering illustration">
 <div className="beat-graphic"><EngineeringGraphic chapter={chapter} beat={beat} sim={sim}/></div>
 <div className="beat-visual-lower"><span>FIGURE {String(chapter+1).padStart(2,'0')}.{beat+1} / {info.title}</span><button onClick={onOpen} aria-label="Open full visual breakdown"><Maximize2 size={15}/><span>EXPAND</span></button></div>
 </motion.aside>
}

export function ScienceStudio({chapter,sim,onClose}:{chapter:number;sim:SimState;onClose:()=>void}){
 const [beat,setBeat]=useState(0);
 useEffect(()=>setBeat(0),[chapter]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight')setBeat(x=>Math.min(2,x+1));if(e.key==='ArrowLeft')setBeat(x=>Math.max(0,x-1))};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[onClose]);
 const item=story[chapter][beat];
 return <div className="science-theater" role="dialog" aria-modal="true" aria-label={'Technical documentary: '+chapters[chapter].title}>
   <header className="science-header"><div className="science-brand"><span>BG / RESEARCH CINEMA</span><strong>THE SCIENCE BEHIND THE STORY</strong></div><button onClick={onClose} aria-label="Close science theater"><X size={21}/></button></header>
   <div className="science-heading"><div className="science-counter">CHAPTER {String(chapter+1).padStart(2,'0')} / {chapters[chapter].title}</div><h2>{item.title}<span>.</span></h2><p>{item.why}</p></div>
   <div className="science-main">
      <AnimatePresence mode="wait"><motion.div key={chapter+'-'+beat} className="science-stage" initial={{opacity:0,x:35,filter:'blur(8px)'}} animate={{opacity:1,x:0,filter:'blur(0px)'}} exit={{opacity:0,x:-25}} transition={{duration:.45}}>
        <EngineeringGraphic chapter={chapter} beat={beat} sim={sim} large/>
        <div className="science-equation">{item.equation}</div>
      </motion.div></AnimatePresence>
      <div className="science-reading"><div className="science-label">EXPLAINED / {beat+1} OF 3</div><p>{item.voice}</p><div className="science-source-note"><BookOpen size={16}/> Educational illustration · refer to Field Notes for independent reporting and sources</div></div>
   </div>
   <footer className="science-footer"><div className="science-steps">{story[chapter].map((b,i)=><button key={b.title} className={i===beat?'selected':''} onClick={()=>setBeat(i)}><span>{i+1}</span>{b.title}</button>)}</div><div className="science-pager"><button disabled={beat===0} onClick={()=>setBeat(x=>x-1)}><ChevronLeft size={19}/> PREVIOUS</button><button disabled={beat===2} onClick={()=>setBeat(x=>x+1)}>NEXT EXPLANATION <ChevronRight size={19}/></button></div></footer>
   <div className="science-credit">Made by Raj Suhandani</div>
 </div>
}
