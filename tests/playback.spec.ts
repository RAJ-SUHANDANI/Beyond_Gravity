import {test,expect} from '@playwright/test';

test('documentary play and pause use actual paused state',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 const pause=page.getByRole('button',{name:'Pause narration'});
 await expect(pause).toBeVisible({timeout:10000});
 await pause.click();
 await expect(page.getByRole('button',{name:'Resume narration'})).toBeVisible();
 await page.getByRole('button',{name:'Resume narration'}).click();
 await expect(page.getByRole('button',{name:'Pause narration'})).toBeVisible();
});

test('mobile always has a reachable visual science diagram control',async({page},testInfo)=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await expect(page.locator('.film-root')).toBeVisible();
 if(testInfo.project.name==='mobile-chromium'){
   const diagram=page.getByRole('button',{name:'Open animated science diagrams'});
   await expect(diagram).toBeVisible();
   await diagram.click();
   await expect(page.getByRole('dialog',{name:/Technical documentary/i})).toBeVisible();
   await page.getByRole('button',{name:'Close science theater'}).click();
 }else{
   await expect(page.getByRole('button',{name:/DECODE THE SCIENCE/i})).toBeVisible();
 }
});
