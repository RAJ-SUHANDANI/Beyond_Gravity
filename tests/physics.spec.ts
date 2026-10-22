import {test,expect} from '@playwright/test';
import {initialSim,adjust,report,bounds} from '../src/simulation';

test('suction fan command changes the visualized force and turns suction off at zero command',()=>{
 const none=report({...initialSim,fanPower:0});
 const half=report({...initialSim,fanPower:50});
 const full=report({...initialSim,fanPower:100});
 expect(none.suctionNewtons).toBe(0);
 expect(half.suctionNewtons).toBeCloseTo(full.suctionNewtons/2,5);
 expect(full.effectivePressure).toBeCloseTo(initialSim.pressure);
});
test('larger rotor area reduces ideal hover power with mass and efficiency fixed',()=>{
 expect(report({...initialSim,area:30}).electricalKW).toBeLessThan(report({...initialSim,area:10}).electricalKW);
});
test('hover power increases with vehicle mass, and bounds remain enforced',()=>{
 expect(report({...initialSim,mass:1500}).electricalKW).toBeGreaterThan(report({...initialSim,mass:800}).electricalKW);
 expect(adjust({...initialSim,mass:bounds.mass.max},'mass',1).mass).toBe(bounds.mass.max);
 expect(adjust({...initialSim,mass:bounds.mass.min},'mass',-1).mass).toBe(bounds.mass.min);
});
