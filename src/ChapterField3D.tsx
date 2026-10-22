import React,{useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Group} from 'three';
import type {SimState} from './simulation';

/**
 * Authored engineering visualization, not measured CFD or disclosed Tesla CAD.
 * Force arrows, exhaust momentum rings and control-state scans are conceptual.
 * Pure geometry, no particles, textures, internet services or GPU shaders.
 */
function VectorArrow({x,y,z,direction=1,length=0.8,color='#a7edd9'}:{x:number;y:number;z:number;direction?:1|-1;length?:number;color?:string}){
 return <group position={[x,y,z]} rotation={[0,0,direction<0?Math.PI:0]}>
  <mesh position={[0,length*.32,0]}>
   <cylinderGeometry args={[.018,.018,length*.65,9]}/>
   <meshBasicMaterial color={color} transparent opacity={.69} depthWrite={false}/>
  </mesh>
  <mesh position={[0,length*.73,0]}>
   <coneGeometry args={[.082,length*.21,12]}/>
   <meshBasicMaterial color={color} transparent opacity={.85} depthWrite={false}/>
  </mesh>
 </group>
}
export function ChapterField3D({chapter,sim}:{chapter:number;sim?:SimState}){
 const rings=useRef<(Group|null)[]>([]);
 const exhaustRings=useRef<(Group|null)[]>([]);
 const span=(sim?.fanPower??70)/100;
 useFrame(({clock})=>{
  for(let i=0;i<rings.current.length;i++){
   const ring=rings.current[i];if(!ring)continue;
   const p=(clock.elapsedTime*.36+i*.23)%1;
   ring.scale.setScalar(.5+p*.85);
   ring.position.y=-.72;
   ring.position.z=(i%2===0?-1:1)*.65;
   // Animate intensity gently without exposing an unverified aerodynamic model.
   ring.rotation.z=clock.elapsedTime*.12;
  }
  exhaustRings.current.forEach((ring,i)=>{if(!ring)return;const phase=(clock.elapsedTime*.63+(i%4)*.23)%1;ring.position.z=3.07+phase*1.25;ring.scale.setScalar(.75+phase*.65);});
 });
 if(chapter===2)return <group>
  {[-.9,0,.9].flatMap(z=>[-1,1].map(side=><VectorArrow key={z+','+side} x={side*1.6} y={.42} z={z} direction={-1} length={.48+span*.28} color="#a7ffdf"/>))}
  {[0,1,2,3].map((i)=><group key={'pressure-'+i} ref={r=>{rings.current[i]=r}}>
   <mesh rotation={[Math.PI/2,0,0]}>
    <torusGeometry args={[.7,.012,8,48]}/>
    <meshBasicMaterial color="#b1f2d8" transparent opacity={.26} depthWrite={false}/>
   </mesh>
  </group>)}
 </group>;
 if(chapter===3)return <group>
  {[-.7,.7].flatMap(x=>[0,1,2,3].map((i)=><group key={x+'-'+i} ref={r=>{exhaustRings.current[(x<0?0:4)+i]=r}} position={[x,-.06,3.07+i*.28]}><mesh>
   <torusGeometry args={[.13,.012,6,32]}/>
   <meshBasicMaterial color="#b8eef6" transparent opacity={.3*(1-i/5)} depthWrite={false}/>
  </mesh></group>))}
  {[-1.65,1.65].map(x=><VectorArrow key={x} x={x} y={.25} z={1.7} direction={1} length={.5} color="#f7c1a6"/>)}
 </group>;
 if(chapter===4)return <group>
  <VectorArrow x={-1.9} y={-.48} z={.35} length={1.2} color="#adf4e0"/>
  <VectorArrow x={1.9} y={.9} z={.35} direction={-1} length={1.2} color="#facaaa"/>
 </group>;
 if(chapter===5)return <group>
  {[.35,.62,.91].map((scale,i)=><mesh key={scale} position={[0,.35,-.45]} rotation={[Math.PI/2,0,0]} scale={scale}>
   <torusGeometry args={[.6,.012,6,48]}/>
   <meshBasicMaterial color="#a5ffee" transparent opacity={.25-i*.05} depthWrite={false}/>
  </mesh>)}
 </group>;
 return null;
}
