import {test,expect} from '@playwright/test';

test('director cut: screenshot and safe hit targets at desktop or mobile dimensions',async({page},testInfo)=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await expect(page.getByRole('heading',{name:/THE IMPOSSIBLE MOMENT/i})).toBeVisible();
 await page.waitForTimeout(1450);
 const action=page.getByRole('button',{name:/DECODE THE SCIENCE/i});
 await action.scrollIntoViewIfNeeded();
 await expect(action).toBeInViewport();
 const rect=await action.boundingBox();
 const controls=await page.locator('.film-bottom').boundingBox();
 expect(rect,'chapter action must be measurable').not.toBeNull();
 expect(controls,'player must be measurable').not.toBeNull();
 if(rect&&controls)expect(rect.y+rect.height).toBeLessThan(controls.y+3);
 if(testInfo.project.name==='mobile-chromium'){
   // SwiftShader may stall when trying to composite the WebGL canvas into
   // a retina-resolution element snapshot. Hide only the canvas during this
   // layout capture; another test captures the live 3D Future Lab separately.
   await page.addStyleTag({content:'.scene-fixed canvas,.film-root:before{visibility:hidden!important}'});
   await page.locator('.film-stage-content').screenshot({path:'docs/qa/'+testInfo.project.name+'-documentary.png',animations:'disabled',timeout:18000});
 }else{
   await page.screenshot({path:'docs/qa/'+testInfo.project.name+'-documentary.png',animations:'disabled',timeout:20000});
 }
 await action.click();
 await expect(page.getByRole('dialog',{name:/Technical documentary/i})).toBeVisible();
 if(testInfo.project.name==='mobile-chromium'){
   const rect=await page.locator('.science-stage').boundingBox();
   const size=page.viewportSize();
   expect(rect,'mobile diagram must have a measurable bounding box').not.toBeNull();
   expect(size,'mobile viewport must be measurable').not.toBeNull();
   if(rect&&size){
     expect(rect.x).toBeGreaterThanOrEqual(-1);
     expect(rect.x+rect.width).toBeLessThanOrEqual(size.width+1);
   }
 }
 await page.screenshot({path:'docs/qa/'+testInfo.project.name+'-science-theater.png',animations:'disabled'});
 await page.getByRole('button',{name:/Close science theater/i}).click();
});

test('screenshot of future laboratory without scroll slider',async({page},testInfo)=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await page.getByRole('button',{name:/Go to chapter 11/i}).click();
 await expect(page.getByRole('heading',{name:/MAKE PHYSICS VISIBLE/i})).toBeVisible({timeout:12000});
 await page.waitForTimeout(1000);
 await page.getByRole('button',{name:/OPEN SIMULATOR/i}).click();
 const dlg=page.getByRole('dialog',{name:/THE FUTURE LAB/i});
 await expect(dlg).toBeVisible();
 await expect(dlg.locator('input[type="range"]')).toHaveCount(0);
 const stage=dlg.locator('.live-sim-3d');
 await expect(stage).toHaveAttribute('data-model-ready','true',{timeout:24000});
 await page.waitForTimeout(480);
 if(testInfo.project.name==='desktop-chromium'){
   // Catch regressions where the WebGL scene is technically mounted but visually blank.
   const snapshot=await stage.screenshot({timeout:24000});
   const redPixels=await page.evaluate(async b64=>{
     const image=new Image();
     image.src='data:image/png;base64,'+b64;
     await image.decode();
     const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
     const ctx=canvas.getContext('2d',{willReadFrequently:true});
     if(!ctx)return 0;
     ctx.drawImage(image,0,0);
     const rgba=ctx.getImageData(0,0,canvas.width,canvas.height).data;
     let found=0;
     for(let i=0;i<rgba.length;i+=4){
       const [r,g,b]=[rgba[i],rgba[i+1],rgba[i+2]];
       if(r>70&&r>g*1.22&&r>b*1.09)found++;
     }
     return found;
   },Buffer.from(snapshot).toString('base64'));
   expect(redPixels,'Future Lab must actually render its red 3D vehicle, not a blank viewport').toBeGreaterThan(150);
 }
 await page.screenshot({path:'docs/qa/'+testInfo.project.name+'-future-lab.png',animations:'disabled'});
});
