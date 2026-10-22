import {hoverPower,suctionForce} from './physics';
export type SimState={mass:number;area:number;efficiency:number;pressure:number;fanPower:number};
export type SimKey=keyof SimState;
export const initialSim:SimState={mass:950,area:15,efficiency:.67,pressure:2700,fanPower:70};
export const bounds:{[K in SimKey]:{min:number;max:number;step:number;unit:string;title:string}}={
 mass:{min:400,max:2400,step:50,unit:'kg',title:'AIRCRAFT MASS'},
 area:{min:4,max:40,step:1,unit:'m²',title:'ROTOR DISK AREA'},
 efficiency:{min:.4,max:.85,step:.05,unit:'',title:'PROPULSION EFFICIENCY'},
 pressure:{min:0,max:6000,step:250,unit:'Pa',title:'UNDERBODY PRESSURE DIFFERENCE'},
 fanPower:{min:0,max:100,step:10,unit:'%',title:'SUCTION FAN COMMAND'}
};
export function adjust(s:SimState,k:SimKey,delta:number){const b=bounds[k];return {...s,[k]:Math.min(b.max,Math.max(b.min,+(s[k]+delta*b.step).toFixed(2)))}}
export function report(s:SimState){
 // Explicit teaching assumption: the specified pressure difference is the
 // system's ideal full-command potential. At zero fan command there is no
 // maintained underbody pressure differential. Real fan curves are nonlinear.
 const effectivePressure=s.pressure*Math.min(1,Math.max(0,s.fanPower/100));
 return {...hoverPower(s.mass,s.area,s.efficiency),effectivePressure,suctionNewtons:suctionForce(effectivePressure,1.5),rotorScale:Math.sqrt(s.area/15)};
}
