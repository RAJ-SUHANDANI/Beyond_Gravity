import React,{useEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows} from '@react-three/drei';
import {ChapterField3D} from './ChapterField3D';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import * as THREE from 'three';
import type{Group,Mesh} from 'three';
import type{PartId} from './data';
import type{SimState} from './simulation';
const bodyRed='#9a2634',c='#b4e9e3';
type Select=(id:PartId)=>void;
// Original low-poly-to-smooth procedural reconstruction informed by a low modern Roadster silhouette.
// No Tesla factory CAD and no 3rd-party model asset is used.
const longitudinal=[
 [-2.81,-.10,.22,.09],[-2.68,-.08,.69,.23],[-2.34,-.07,1.02,.31],[-1.9,-.06,1.16,.38],[-1.45,-.035,1.22,.40],
 [-.72,-.01,1.19,.41],[.05,-.04,1.16,.4],[.84,-.05,1.2,.39],[1.6,-.07,1.17,.4],[2.24,-.08,1.0,.35],[2.63,-.12,.70,.22],[2.83,-.13,.28,.08]
] as const;
function loft(stations:readonly (readonly [number,number,number,number])[],facets=48){
 // Original sculpted longitudinal loft. Catmull-Rom interpolation preserves
 // broad aero surfaces without introducing polygonal kinks at control stations.
 const smooth=(a:number,b:number,c:number,d:number,t:number)=>{
   const t2=t*t,t3=t2*t;
   return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3);
 };
 const profiles:[number,number,number,number][]=[];
 for(let i=0;i<stations.length-1;i++){
   for(let sub=0;sub<5;sub++){
     const t=sub/5;
     const row=[0,1,2,3].map(field=>{
       const before=stations[Math.max(0,i-1)][field];
       const a=stations[i][field],b=stations[i+1][field];
       const after=stations[Math.min(stations.length-1,i+2)][field];
       return smooth(before,a,b,after,t);
     });
     profiles.push([row[0],row[1],Math.max(.035,row[2]),Math.max(.025,row[3])]);
   }
 }
 profiles.push([...stations[stations.length-1]] as [number,number,number,number]);
 const verts:number[]=[],idx:number[]=[];
 for(const [z,cy,w,h] of profiles){
   for(let j=0;j<facets;j++){
     const angle=2*Math.PI*j/facets;
     verts.push(w*Math.cos(angle),cy+h*Math.sin(angle),z);
   }
 }
 for(let i=0;i<profiles.length-1;i++){
   for(let j=0;j<facets;j++){
     const next=(j+1)%facets;
     const a=i*facets+j,b=i*facets+next,c=(i+1)*facets+j,d=(i+1)*facets+next;
     idx.push(a,b,c,b,d,c);
   }
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
 geo.setIndex(idx);geo.computeVertexNormals();
 return geo;
}
function RacingWheel({x,z}:{x:number;z:number}){
 const wheel=useRef<Group>(null);
 useFrame((_,dt)=>{if(wheel.current)wheel.current.rotation.z+=dt*.13});
 const outFacing=x<0?-Math.PI/2:Math.PI/2;
 return <group position={[x,-.37,z]} rotation={[0,outFacing,0]}>
  <group ref={wheel}>
   <mesh rotation={[Math.PI/2,0,0]} castShadow>
    <cylinderGeometry args={[.46,.46,.33,64]}/>
    <meshStandardMaterial color="#0e1114" roughness={.95}/>
   </mesh>
   {[-.164,.164].map(side=><mesh key={side} position={[0,0,side]}>
    <torusGeometry args={[.378,.081,18,64]}/>
    <meshStandardMaterial color="#171a1d" roughness={.88}/>
   </mesh>)}
   {Array.from({length:16},(_,i)=>{
    const angle=i*Math.PI*2/16;
    return <mesh key={'tread-'+i} position={[Math.cos(angle)*.457,Math.sin(angle)*.457,0]} rotation={[0,0,angle]}>
     <boxGeometry args={[.018,.064,.318]}/>
     <meshStandardMaterial color="#1b2022" roughness={1}/>
    </mesh>
   })}
   <mesh position={[0,0,.183]} rotation={[Math.PI/2,0,0]}>
    <cylinderGeometry args={[.314,.314,.032,48]}/>
    <meshStandardMaterial color="#45535c" metalness={.84} roughness={.32}/>
   </mesh>
   <mesh position={[0,0,.212]} rotation={[Math.PI/2,0,0]}>
    <cylinderGeometry args={[.268,.268,.018,48]}/>
    <meshStandardMaterial color="#1d272d" metalness={.75} roughness={.35}/>
   </mesh>
   {Array.from({length:10},(_,i)=><mesh key={'spoke-'+i} rotation={[0,0,i*Math.PI/5]} position={[0,0,.235]}>
     <boxGeometry args={[.052,.47,.035]}/>
     <meshStandardMaterial color="#8c9da6" metalness={.94} roughness={.21}/>
   </mesh>)}
   <mesh position={[0,0,.264]} rotation={[Math.PI/2,0,0]}>
    <cylinderGeometry args={[.105,.105,.046,32]}/>
    <meshStandardMaterial color="#c3d1d5" metalness={.92} roughness={.22}/>
   </mesh>
   {Array.from({length:5},(_,i)=>{const angle=i*Math.PI*2/5;
    return <mesh key={'lug-'+i} position={[Math.sin(angle)*.088,Math.cos(angle)*.088,.288]}>
     <sphereGeometry args={[.018,10,10]}/>
     <meshStandardMaterial color="#2a353d" metalness={.95}/>
    </mesh>
   })}
  </group>
 </group>
}
function AirFan({x,z,focus,onSelect,power}:{x:number,z:number,focus:boolean,onSelect?:Select,power?:number}){const rotor=useRef<Group>(null);useFrame((_,dt)=>{if(rotor.current)rotor.current.rotation.y+=dt*(focus?17:6)*(Math.max(.05,power??70)/70)});return <group position={[x,-.58,z]} onClick={e=>{e.stopPropagation();onSelect?.('fans')}} onPointerOver={()=>{document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}><mesh><cylinderGeometry args={[.31,.31,.11,36]}/><meshStandardMaterial color="#212e35" metalness={.9} roughness={.27}/></mesh><mesh position={[0,-.07,0]}><torusGeometry args={[.3,.017,8,40]}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={focus?2:.6}/></mesh><group ref={rotor}>{Array.from({length:7},(_,i)=><mesh key={i} rotation={[0,i*Math.PI*2/7,0]} position={[.125,-.055,0]}><boxGeometry args={[.25,.023,.07]}/><meshStandardMaterial color="#9fc2c4" metalness={.82}/></mesh>)}</group></group>}
function Nozzle({x,z,onSelect,focus}:{x:number,z:number,onSelect?:Select,focus:boolean}){const jet=useRef<Mesh>(null);useFrame(s=>{if(jet.current)jet.current.scale.y=focus?1+Math.sin(s.clock.elapsedTime*18)*.17:.33});return <group position={[x,-.07,z]} rotation={[Math.PI/2,0,0]} onClick={e=>{e.stopPropagation();onSelect?.('thrusters')}}><mesh><cylinderGeometry args={[.115,.17,.34,30]}/><meshStandardMaterial color="#556874" metalness={.96} roughness={.2}/></mesh><mesh position={[0,.19,0]}><torusGeometry args={[.16,.025,8,30]}/><meshStandardMaterial color="#d7ecf1" metalness={.8}/></mesh><mesh ref={jet} position={[0,.40,0]}><coneGeometry args={[.12,.45,24]}/><meshBasicMaterial color="#afeefa" transparent opacity={focus?.38:.11} depthWrite={false}/></mesh></group>}
function TubeLine({points,color='#b3cbd1',radius=.012}:{points:[number,number,number][],color?:string,radius?:number}){const path=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),[points]);return <mesh><tubeGeometry args={[path,45,radius,7,false]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.26} metalness={.42}/></mesh>}
export /* Roadster-inspired independent exterior surfacing: deliberately no Tesla badges,
   proprietary CAD, decal downloads, or claims that hypothetical internals are OEM. */
function ExteriorDetailing(){
 return <group>
  {/* Sculpted hood creases and split nose in dark clearcoat, in the studio lighting. */}
  {[-1,1].map(side=><group key={'body-detail-'+side}>
   <TubeLine color="#c0646b" radius={.009} points={[[side*.31,.30,-2.49],[side*.46,.36,-2.15],[side*.65,.44,-1.64],[side*.66,.49,-1.16]]}/>
   <TubeLine color="#25151d" radius={.012} points={[[side*.80,.24,-.74],[side*1.02,.23,-.25],[side*1.11,.16,.54],[side*.98,.12,1.30]]}/>
   <TubeLine color="#51242f" radius={.008} points={[[side*.77,.10,-1.55],[side*1.06,.13,-.82],[side*1.13,.07,.65]]}/>
   {/* Headlamp has recessed dark housing, frosted lens and a sharply drawn light strip. */}
   <mesh position={[side*.76,.08,-2.37]} rotation={[.11,side*.16,0]} scale={[.38,.065,.23]}>
    <sphereGeometry args={[1,20,12]}/>
    <meshPhysicalMaterial color="#101b22" metalness={.65} roughness={.14} clearcoat={1}/>
   </mesh>
   <mesh position={[side*.78,.13,-2.40]} rotation={[.07,side*.15,0]} scale={[.24,.026,.11]}>
    <sphereGeometry args={[1,20,12]}/>
    <meshPhysicalMaterial color="#e6f7f7" emissive="#e9ffff" emissiveIntensity={1.5} roughness={.18} clearcoat={1}/>
   </mesh>
   <TubeLine color="#d7f6f5" radius={.014} points={[[side*.58,.145,-2.51],[side*.72,.147,-2.49],[side*.91,.136,-2.36]]}/>
   {/* Side intakes / door handles; low contrast like real automotive detailing. */}
   <mesh position={[side*1.08,-.025,.61]} rotation={[0,side*.16,0]} scale={[.055,.068,.34]}>
    <sphereGeometry args={[1,16,12]}/>
    <meshStandardMaterial color="#121920" roughness={.45} metalness={.68}/>
   </mesh>
   <mesh position={[side*1.11,.19,.14]} rotation={[0,side*.16,0]}>
    <boxGeometry args={[.026,.018,.22]}/><meshStandardMaterial color="#657177" roughness={.28} metalness={.95}/>
   </mesh>
   <mesh position={[side*1.13,.27,-.45]} rotation={[0,side*.24,0]} scale={[.055,.042,.12]}>
    <sphereGeometry args={[1,18,12]}/><meshPhysicalMaterial color="#a7c2c2" metalness={.82} roughness={.17}/>
   </mesh>
   {/* Rear light signature and integrated diffuser vanes. */}
   <mesh position={[side*.66,.10,2.48]}>
    <boxGeometry args={[.51,.046,.048]}/>
    <meshStandardMaterial color="#aa1423" emissive="#ec2b36" emissiveIntensity={1.15}/>
   </mesh>
   <mesh position={[side*.58,-.36,2.56]} rotation={[0,0,side*.06]}>
    <boxGeometry args={[.035,.14,.20]}/>
    <meshStandardMaterial color="#0c151b" roughness={.45} metalness={.65}/>
   </mesh>
   {/* Carbon look wheel-arch trim, independent of rotating wheel geometry. */}
   {[-1.67,1.64].map(z=><mesh key={z} position={[side*1.14,-.37,z]} rotation={[0,side*Math.PI/2,0]}>
    <torusGeometry args={[.487,.019,9,60,Math.PI]}/>
    <meshStandardMaterial color="#111c25" metalness={.52} roughness={.39}/>
   </mesh>)}
  </group>)}
  <mesh position={[0,-.26,-2.57]}><boxGeometry args={[1.19,.09,.055]}/>
    <meshStandardMaterial color="#080f14" metalness={.6} roughness={.5}/></mesh>
  <mesh position={[0,.22,2.44]}><boxGeometry args={[1.55,.018,.08]}/>
    <meshStandardMaterial color="#090f16" metalness={.56} roughness={.46}/></mesh>
  {[-.36,0,.36].map(x=><mesh key={'rear-vent-'+x} position={[x,-.28,2.58]}>
    <boxGeometry args={[.28,.025,.026]}/>
    <meshStandardMaterial color="#38434b" metalness={.7} roughness={.3}/>
  </mesh>)}
 </group>
}
function Car({focus='body',exploded=false,interactive=false,onSelect,sim,inspection=false}:{focus?:PartId;exploded?:boolean;interactive?:boolean;onSelect?:Select;sim?:SimState;inspection?:boolean}){
 const root=useRef<Group>(null),shell=useRef<Group>(null),rotors=useRef<Group>(null),tank=useRef<Group>(null),exhaust=useRef<Group>(null),controller=useRef<Group>(null);
 const hull=useMemo(()=>loft(longitudinal),[]);const canopy=useMemo(()=>loft([[-1.42,.34,.46,.08],[-1.13,.46,.71,.23],[-.85,.55,.83,.26],[-.18,.60,.86,.27],[.58,.60,.79,.23],[1.12,.46,.61,.1]]),[]);
 useFrame((s,dt)=>{if(!root.current)return;root.current.rotation.y+=interactive?0:dt*.045;root.current.position.y=interactive?0:Math.sin(s.clock.elapsedTime*.62)*.045;
 const movement=(ref:React.RefObject<Group|null>,x:number,y:number,z:number)=>{if(!ref.current)return;ref.current.position.x=THREE.MathUtils.damp(ref.current.position.x,x,3,dt);ref.current.position.y=THREE.MathUtils.damp(ref.current.position.y,y,3,dt);ref.current.position.z=THREE.MathUtils.damp(ref.current.position.z,z,3,dt)};
 movement(shell,0,exploded?.67:0,0);movement(rotors,0,exploded?-.72:0,0);movement(tank,0,exploded?.21:0,exploded?.8:0);movement(exhaust,0,0,exploded?1.22:0);movement(controller,0,exploded?1.35:0,0)});
 return <group ref={root} rotation={[0,-.24,0]}>
  <group ref={shell} visible={!(inspection&&focus==='body')} onClick={e=>{e.stopPropagation();onSelect?.('body')}}>
   <mesh geometry={hull} castShadow receiveShadow><meshPhysicalMaterial color={bodyRed} metalness={.91} roughness={.18} clearcoat={1} clearcoatRoughness={.08} side={THREE.DoubleSide}/></mesh>
   <ExteriorDetailing/><mesh geometry={canopy} castShadow><meshPhysicalMaterial color="#0a1820" metalness={.63} roughness={.07} clearcoat={1} transmission={.15} transparent opacity={.97} side={THREE.DoubleSide}/></mesh>
   <mesh position={[0,.65,-.8]} rotation={[.24,0,0]}><boxGeometry args={[1.25,.012,.018]}/><meshStandardMaterial color="#a4b2b7" metalness={.96}/></mesh>
   {[-1,1].map(side=><group key={side}>
      <TubeLine color="#4d151b" radius={.05} points={[[side*.86,-.16,-2.34],[side*1.17,-.28,-1.62],[side*1.18,-.28,.45],[side*1.12,-.25,1.96]]}/>
      <TubeLine color="#dde0e0" radius={.014} points={[[side*.67,.05,-2.51],[side*1.06,.1,-1.71],[side*1.09,.08,-.6],[side*1.11,.03,.72],[side*.86,.04,2.28]]}/>
      <mesh position={[side*.96,.03,-2.39]} rotation={[0,side*.26,0]}><boxGeometry args={[.33,.06,.34]}/><meshStandardMaterial color="#eff9fc" emissive="#c8f9ff" emissiveIntensity={1.85}/></mesh>
      <mesh position={[side*.93,.04,2.40]}><boxGeometry args={[.35,.055,.21]}/><meshStandardMaterial color="#e32d30" emissive="#c51e28" emissiveIntensity={1.2}/></mesh>
      <mesh position={[side*1.13,.25,-.45]} rotation={[0,side*.23,0]}><boxGeometry args={[.14,.065,.28]}/><meshPhysicalMaterial color="#11181f" metalness={.75}/></mesh>
      {!(inspection&&focus==='wheels')&&<><RacingWheel x={side*1.14} z={-1.67}/><RacingWheel x={side*1.15} z={1.64}/></>}
      <mesh position={[side*.6,-.38,0]}><boxGeometry args={[.75,.062,4.55]}/><meshStandardMaterial color="#0d1219" metalness={.52} roughness={.43}/></mesh>
    </group>)}
   <mesh position={[0,-.24,-2.55]}><boxGeometry args={[1.44,.065,.37]}/><meshStandardMaterial color="#0c1016" metalness={.55}/></mesh>
   <mesh position={[0,-.25,2.51]}><boxGeometry args={[1.65,.065,.32]}/><meshStandardMaterial color="#10151e" metalness={.55}/></mesh>
   <mesh position={[0,.18,2.28]} rotation={[.02,0,0]}><boxGeometry args={[1.84,.055,.09]}/><meshStandardMaterial color="#121b25" metalness={.77}/></mesh>
  </group>
  <group ref={rotors} visible={!(inspection&&focus==='fans')}>{[-.65,.65].flatMap(x=>[-.66,.66].map(z=><AirFan key={x+','+z} x={x} z={z} focus={focus==='fans'} onSelect={onSelect} power={sim?.fanPower}/>))}<mesh position={[0,-.64,0]}><boxGeometry args={[1.68,.06,2.8]}/><meshStandardMaterial color="#101e25" transparent opacity={exploded?.25:.65}/></mesh></group>
  <group ref={tank} visible={!(inspection&&focus==='vessel')} onClick={e=>{e.stopPropagation();onSelect?.('vessel')}}><mesh rotation={[Math.PI/2,0,0]} position={[0,-.1,.44]}><cylinderGeometry args={[.21,.21,1.6,48]}/><meshStandardMaterial color="#263d49" metalness={.93} roughness={.28}/></mesh>{[-.3,.44,1.14].map(z=><mesh key={z} rotation={[Math.PI/2,0,0]} position={[0,-.1,z]}><torusGeometry args={[.215,.025,9,40]}/><meshStandardMaterial color="#b9e4e1" metalness={.78} emissive="#56a9a6" emissiveIntensity={focus==='vessel'?1.4:.3}/></mesh>)}</group>
  <group ref={exhaust} visible={!(inspection&&focus==='thrusters')}>{[-.67,.67].map(x=><Nozzle key={x} x={x} z={2.79} onSelect={onSelect} focus={focus==='thrusters'}/>)}</group>
  <group ref={controller} visible={!(inspection&&focus==='computer')} onClick={e=>{e.stopPropagation();onSelect?.('computer')}}><mesh position={[0,.11,-.4]}><boxGeometry args={[.56,.12,.69]}/><meshStandardMaterial color="#122b33" emissive={focus==='computer'?'#438f88':'#092427'} emissiveIntensity={1}/></mesh>{[-.19,0,.19].map(x=><mesh key={x} position={[x,.19,-.4]}><boxGeometry args={[.05,.02,.44]}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={focus==='computer'?2:.65}/></mesh>)}</group>
 </group>
}
/** Twelve independent, cinematic shot paths; chapter selection changes the framing. */
const shots:readonly [number,number,number][]=[
 [3.65,1.50,6.55],[-3.5,2.4,5.6],[3.5,-.55,5.8],[-2.9,.95,6.0],
 [2.5,4.05,4.95],[2.65,1.6,5.35],[5.5,1.5,-1.5],[4.2,1.05,5.95],
 [-5.5,2.65,1.75],[4.25,1.55,-2.3],[1.25,4.4,4.95],[3.55,1.35,6.2]
];
function CameraRig({chapter}:{chapter:number}){
 const prev=useRef(chapter),began=useRef(0);
 useFrame(({camera,clock},dt)=>{
  if(prev.current!==chapter){prev.current=chapter;began.current=clock.elapsedTime}
  const shot=shots[Math.min(shots.length-1,chapter)];
  const reduced=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t=reduced?0:Math.max(0,clock.elapsedTime-began.current);
  const drift=Math.min(1,t/12);
  const move=drift*Math.sin(Math.min(1,t/12)*Math.PI/2);
  const x=shot[0]+Math.sin(t*.14+chapter)*.36*move;
  const y=shot[1]+Math.sin(t*.10+.5)*.12*move;
  const z=shot[2]+Math.cos(t*.11+chapter)*.25*move;
  camera.position.set(
   THREE.MathUtils.damp(camera.position.x,x,1.05,dt),
   THREE.MathUtils.damp(camera.position.y,y,1.05,dt),
   THREE.MathUtils.damp(camera.position.z,z,1.05,dt)
  );
  camera.lookAt(0,0,0);
 });
 return null;
}
function SceneFrameProbe({onReady}:{onReady?:()=>void}){const frames=useRef(0),fired=useRef(false);useFrame(()=>{if(!fired.current&&++frames.current>=26){fired.current=true;onReady?.()}});return null}
function CinematicReflections(){const{gl,scene}=useThree();useEffect(()=>{const pmrem=new THREE.PMREMGenerator(gl);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.035);const old=scene.environment;scene.environment=env.texture;scene.environmentIntensity=1.15;return()=>{scene.environment=old;env.texture.dispose();room.dispose();pmrem.dispose()};},[gl,scene]);return null}
function Studio(){return <group><mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.02,0]} receiveShadow><planeGeometry args={[120,120]}/><meshBasicMaterial color="#08131c"/></mesh>{[-1,1].map(s=><mesh key={s} position={[s*5,3.1,-4]} rotation={[0,s*.29,0]}><planeGeometry args={[.06,7.8]}/><meshBasicMaterial color="#a6f6e6" transparent opacity={.28}/></mesh>)}<gridHelper args={[23,16,'#183a44','#11212a']} position={[0,-1.006,0]}/></group>}
function FocusPart({part,sim}:{part:PartId;sim?:SimState}){const g=useRef<Group>(null);const body=useMemo(()=>loft(longitudinal),[]);const canopy=useMemo(()=>loft([[-1.42,.34,.46,.08],[-1.13,.46,.71,.23],[-.85,.55,.83,.26],[-.18,.60,.86,.27],[.58,.60,.79,.23],[1.12,.46,.61,.1]]),[]);
useFrame((st,dt)=>{if(g.current){g.current.position.x=THREE.MathUtils.damp(g.current.position.x,1.25,3,dt);g.current.position.y=.36+Math.sin(st.clock.elapsedTime*.72)*.08;g.current.rotation.y+=dt*.13}});
return <group ref={g} position={[0,0,0]} scale={part==='body'?.70:part==='wheels'?2.3:2.1}>
{part==='wheels'&&<RacingWheel x={0} z={0}/>}
{part==='fans'&&<group position={[0,.64,0]}><AirFan x={0} z={0} focus power={sim?.fanPower}/></group>}
{part==='thrusters'&&<Nozzle x={0} z={0} focus/>}
{part==='vessel'&&<group><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.21,.21,1.6,48]}/><meshPhysicalMaterial color="#263d49" metalness={.92} roughness={.24} clearcoat={1}/></mesh>{[-.65,0,.65].map(z=><mesh key={z} position={[0,0,z]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.215,.025,9,40]}/><meshStandardMaterial color="#b9e4e1" metalness={.78} emissive="#56a9a6" emissiveIntensity={1}/></mesh>)}</group>}
{part==='computer'&&<group><mesh><boxGeometry args={[.56,.12,.69]}/><meshStandardMaterial color="#122b33" emissive="#438f88" emissiveIntensity={1}/></mesh>{[-.19,0,.19].map(x=><mesh key={x} position={[x,.08,0]}><boxGeometry args={[.05,.02,.44]}/><meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.3}/></mesh>)}</group>}
{part==='body'&&<group><mesh geometry={body}><meshPhysicalMaterial color={bodyRed} metalness={.91} roughness={.18} clearcoat={1} side={THREE.DoubleSide}/></mesh><mesh geometry={canopy}><meshPhysicalMaterial color="#0a1820" metalness={.63} roughness={.08} clearcoat={1} transparent opacity={.94} side={THREE.DoubleSide}/></mesh></group>}
</group>}
function ElectricVTOL({sim}:{sim?:SimState}){
 const root=useRef<Group>(null);
 const spinners=useRef<Group[]>([]);
 const shell=useMemo(()=>loft(longitudinal),[]);
 const glass=useMemo(()=>loft([[-1.45,.36,.42,.09],[-1.10,.47,.66,.21],[-.67,.53,.77,.27],[.10,.59,.83,.26],[.66,.53,.73,.19],[1.23,.39,.55,.05]]),[]);
 const area=sim?.area??15,rotorScale=Math.sqrt(area/15),mass=sim?.mass??950;
 const energy=(sim?.fanPower??70)/100;
 useFrame((s,dt)=>{
  if(root.current){
    root.current.position.y=Math.sin(s.clock.elapsedTime*1.15)*(.065+mass/16000);
    root.current.rotation.z=Math.sin(s.clock.elapsedTime*.5)*.025;
  }
  spinners.current.forEach(o=>{if(o)o.rotation.y+=dt*(5.5+(mass/700))*Math.max(.01,energy)});
 });
 return <group ref={root}>
  <group scale={[.73,.82,.69]} position={[0,.17,0]}>
   <mesh geometry={shell} castShadow>
    <meshPhysicalMaterial color="#8c3c48" metalness={.83} roughness={.17} clearcoat={1} clearcoatRoughness={.1} side={THREE.DoubleSide}/>
   </mesh>
   <mesh geometry={glass}>
    <meshPhysicalMaterial color="#091b24" metalness={.68} roughness={.09} clearcoat={1} transparent opacity={.94} side={THREE.DoubleSide}/>
   </mesh>
   {[-1,1].map(side=><group key={side}>
    <mesh position={[side*.95,.04,-2.32]} rotation={[0,0,0]}>
     <boxGeometry args={[.32,.045,.24]}/>
     <meshStandardMaterial color="#defffb" emissive="#d3fff9" emissiveIntensity={1.15}/>
    </mesh>
    <mesh position={[side*.93,.05,2.30]}>
     <boxGeometry args={[.37,.05,.13]}/>
     <meshStandardMaterial color="#ac1b2b" emissive="#d43842" emissiveIntensity={1.1}/>
    </mesh>
    <mesh position={[side*1.08,-.24,0]}>
     <boxGeometry args={[.085,.09,1.75]}/>
     <meshStandardMaterial color="#1b2d35" roughness={.45} metalness={.64}/>
    </mesh>
   </group>)}
  </group>
  {[-1,1].flatMap((x)=>[-1,1].map((z,i)=>{
   const id=i+(x>0?2:0);
   return <group key={x+','+z} position={[x*1.88,.10,z*1.55]}>
    <mesh position={[-x*.72,-.12,-z*.53]} rotation={[0,Math.atan2(x,z),0]} castShadow>
      <boxGeometry args={[1.47,.13,.16]}/>
      <meshStandardMaterial color="#7c9aa1" metalness={.75} roughness={.31}/>
    </mesh>
    <mesh rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[.72*rotorScale,.055,12,64]}/>
      <meshStandardMaterial color="#c9e4df" metalness={.78} roughness={.26}/>
    </mesh>
    <group ref={r=>{if(r)spinners.current[id]=r}} scale={[rotorScale,1,rotorScale]}>
      {Array.from({length:4},(_,j)=><mesh key={j} rotation={[0,j*Math.PI/2,0]} position={[.30,.02,0]}>
        <boxGeometry args={[.68,.024,.105]}/>
        <meshStandardMaterial color="#b4cdd0" metalness={.8} roughness={.28}/>
      </mesh>)}
    </group>
    <mesh position={[0,-.15,0]}>
      <cylinderGeometry args={[.28*rotorScale,.48*rotorScale,.4,32,1,true]}/>
      <meshBasicMaterial color="#6cbfc0" transparent opacity={.035+energy*.095} depthWrite={false} side={THREE.DoubleSide}/>
    </mesh>
   </group>
  }))}
 </group>
}
export function VehicleScene({chapter=0,focus='body',exploded=false,interactive=false,onSelect,sim,inspection=false,variant='car',theme='dark',onReady}:{chapter?:number;focus?:PartId;exploded?:boolean;interactive?:boolean;onSelect?:Select;sim?:SimState;inspection?:boolean;variant?:'car'|'evtol';theme?:'dark'|'light';onReady?:()=>void}){
 const lowPower=typeof window!=='undefined' && (
  window.innerWidth<720 ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  (typeof navigator!=='undefined' && (
   ((navigator as Navigator & {deviceMemory?:number}).deviceMemory??8)<=4 ||
   !!(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData
  ))
 );
 const deviceDpr=lowPower?[1,1.08]:[1,1.4];
 return <Canvas dpr={deviceDpr as [number,number]} shadows={!lowPower} camera={{position:[4,1.7,7],fov:38}} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.setClearColor('#030609',0)}}><CinematicReflections/><SceneFrameProbe onReady={onReady}/><ambientLight intensity={theme==='light'?2.1:1.25}/><hemisphereLight args={['#e9fbff','#263a48',1.6]}/><directionalLight position={[5,8,4]} intensity={4.2} color="#edf9ff" castShadow={!lowPower} shadow-mapSize={[lowPower?512:1024,lowPower?512:1024]}/><spotLight position={[-5,5,-6]} angle={.62} penumbra={.9} intensity={80} color="#a2e4df"/><pointLight position={[4,1.2,5]} intensity={26} color="#f3b7b7" distance={16}/><Studio/><ContactShadows position={[0,-1.01,0]} opacity={.33} scale={9} blur={2.3} far={7} resolution={lowPower?128:256} frames={1}/>{variant==='evtol'?<ElectricVTOL sim={sim}/>:<group><group position={inspection?[-1.95,-.3,0]:[0,0,0]} scale={inspection?.53:1}><Car focus={focus} exploded={exploded} interactive={interactive} onSelect={onSelect} sim={sim} inspection={inspection}/></group>{!lowPower&&!inspection&&<ChapterField3D chapter={chapter} sim={sim}/>}{inspection&&<FocusPart part={focus} sim={sim}/>}</group>}{interactive?<OrbitControls enablePan={false} minDistance={3} maxDistance={11} maxPolarAngle={Math.PI*.82} target={[0,0,0]}/>:<CameraRig chapter={chapter}/>}</Canvas>}
