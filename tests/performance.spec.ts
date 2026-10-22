import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('measure live documentary frame cadence and navigation responsiveness',async({page},testInfo)=>{
 await page.goto('/');
 const intro=await page.evaluate(()=>performance.getEntriesByType('navigation').map(x=>({
  duration:Math.round(x.duration),domContentLoaded:Math.round((x as PerformanceNavigationTiming).domContentLoadedEventEnd),
  responseEnd:Math.round((x as PerformanceNavigationTiming).responseEnd)
 })));
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 const model=page.locator('.scene-fixed canvas');
 await expect(model).toBeVisible();
 const measurement=await page.evaluate(async()=>{
  // Renderer and headless CI share a CPU/GPU budget. This is an observed
  // synthetic browser sample, not a user-device FPS guarantee.
  const readings:number[]=[];
  let previous=performance.now(),started=previous;
  await new Promise<void>(resolve=>{
   let count=0;const run=(now:number)=>{
    readings.push(now-previous);previous=now;
    if(++count>=72||now-started>5500)resolve();
    else requestAnimationFrame(run)
   };requestAnimationFrame(run)
  });
  readings.shift();readings.sort((a,b)=>a-b);
  const q=(p:number)=>readings[Math.min(readings.length-1,Math.floor(p*readings.length))]||0;
  const average=readings.reduce((a,v)=>a+v,0)/Math.max(1,readings.length);
  const navigation=performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming|undefined;
  const resources=performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  return {averageFps:Math.round(1000/Math.max(1,average)*10)/10,p95FrameMs:Math.round(q(.95)*10)/10,medianFrameMs:Math.round(q(.5)*10)/10,
   observedFrames:readings.length,domContentLoadedMs:Math.round(navigation?.domContentLoadedEventEnd||0),trackedResourceCount:resources.length,
   transferBytesReported:Math.round(resources.reduce((n,r)=>n+(r.transferSize||0),0))};
 });
 // Record poor CI frame cadence transparently; software-rendered CI is not a GPU FPS target.
 expect(measurement.observedFrames).toBeGreaterThan(0);
 if(measurement.averageFps<24)console.warn('SOFTWARE_WEBGL_CI_LOW_FPS: '+measurement.averageFps+'; real-device FPS remains unverified');
 const report={commit:process.env.GITHUB_SHA||'local',viewport:testInfo.project.name,observations:measurement,intro: intro[0]||null,limitations:'Chromium CI synthetic; not a physical device benchmark or Lighthouse Core Web Vitals.'};
 const dest=path.join('docs','qa','performance-'+testInfo.project.name+'.json');
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2));
 await testInfo.attach('performance-sample',{body:JSON.stringify(report,null,2),contentType:'application/json'});
 console.log('MEASURED_CHAPTER_FRAME_CADENCE '+JSON.stringify(report.observations));
});
