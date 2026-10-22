import {test,expect} from '@playwright/test';

test('Field Notes have a dedicated close target and do not trap chapter navigation',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await page.getByRole('button',{name:/Go to chapter 2/i}).click();
 const notes=page.getByRole('button',{name:/FIELD NOTES/i});
 await notes.click();
 const aside=page.getByRole('region',{name:'Chapter Field Notes'});
 await expect(aside).toBeVisible();
 await expect(notes).toHaveAttribute('aria-expanded','true');
 const close=page.getByRole('button',{name:'Close Field Notes'});
 await expect(close).toBeInViewport();
 await close.click();
 await expect(aside).toHaveCount(0);
 await expect(notes).toHaveAttribute('aria-expanded','false');
 await page.getByRole('button',{name:/Go to chapter 3/i}).click();
 await expect(page.locator('.film-stage h1')).toContainText(/SUCTION/i);
});
test('important captions and controls do not collide with playback or research visual',async({page},info)=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await expect(page.locator('.film-root')).toBeVisible();
 const overlaps=(a:{x:number;y:number;width:number;height:number},b:{x:number;y:number;width:number;height:number})=>
  Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*
  Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
 const footer=await page.locator('.film-bottom').boundingBox();
 expect(footer).not.toBeNull();
 const captions=page.locator('.film-script');
 if(await captions.isVisible().catch(()=>false)){
  const captionRect=await captions.boundingBox();
  if(captionRect&&footer)expect(overlaps(captionRect,footer),'captions must never cover transport controls').toBeLessThan(2);
  const diagram=page.locator('.beat-visual');
  if(await diagram.isVisible()){
   const area=await diagram.boundingBox();
   if(captionRect&&area)expect(overlaps(captionRect,area),'captions must avoid the engineering drawings').toBeLessThan(2);
  }
 }
 if(info.project.name==='mobile-chromium'){
  const btn=page.getByRole('button',{name:'Open animated science diagrams'});
  await expect(btn).toBeInViewport();
 }
 await page.getByRole('button',{name:/FIELD NOTES/i}).click();
 await expect(captions).toHaveCount(0);
 await page.getByRole('button',{name:'Close Field Notes'}).click();
});
