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
 await expect(page.getByText('Made by Raj Suhandani')).toBeVisible();
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

test('muting silences narration without stopping or resetting documentary progress',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await expect(page.getByRole('button',{name:'Pause narration'})).toBeVisible();
 await page.getByRole('button',{name:'Mute narration'}).click();
 await expect(page.getByRole('button',{name:'Enable narration'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Pause narration'})).toBeVisible();
 const progress=page.getByRole('progressbar',{name:'Documentary progress'});
 await expect(progress).toBeVisible();
 await page.getByRole('button',{name:'Enable narration'}).click();
 await expect(page.getByRole('button',{name:'Mute narration'})).toBeVisible();
});

test('science theater pauses and resumes an ongoing recording',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await expect(page.getByRole('button',{name:'Pause narration'})).toBeVisible();
 await page.getByRole('button',{name:/DECODE THE SCIENCE/i}).click();
 await expect(page.getByRole('dialog',{name:/Technical documentary/i})).toBeVisible();
 await expect(page.getByRole('button',{name:'Resume narration'})).toBeVisible();
 await page.getByRole('button',{name:'Close science theater'}).click();
 await expect(page.getByRole('button',{name:'Pause narration'})).toBeVisible();
});

test('lab dialog traps focus, closes on Escape and restores the launching control',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await page.getByRole('button',{name:/Go to chapter 11/i}).click();
 const launch=page.getByRole('button',{name:/OPEN SIMULATOR/i});
 await launch.click();
 const dialog=page.getByRole('dialog',{name:/THE FUTURE LAB/i});
 await expect(dialog).toBeVisible();
 await expect(page.getByRole('button',{name:'Close laboratory'})).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await expect(launch).toBeFocused();
});
