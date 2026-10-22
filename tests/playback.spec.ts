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

test('the 2026 demo theater embeds Tesla original without republishing media',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await page.getByRole('button',{name:/WATCH THE ACTUAL 2026 DEMONSTRATION/i}).click();
 const video=page.getByRole('dialog',{name:/Official Tesla Roadster 2026 demonstration footage/i});
 await expect(video).toBeVisible();
 const iframe=video.locator('iframe');
 await expect(iframe).toHaveAttribute('src',/youtube-nocookie\.com\/embed\/qt5p-_tE8d0\?start=363/);
 await video.getByRole('button',{name:/Jump to The mid-air rotation at 10:56/i}).click();
 await expect(iframe).toHaveAttribute('src',/start=656/);
 await video.getByRole('button',{name:'Close video theater'}).click();
 await expect(video).not.toBeVisible();
});

test('official video closes with Escape and returns keyboard focus',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 const open=page.getByRole('button',{name:/WATCH THE ACTUAL 2026 DEMONSTRATION/i});
 await open.click();
 const dialog=page.getByRole('dialog',{name:/Official Tesla Roadster 2026 demonstration footage/i});
 await expect(dialog).toBeVisible();
 await expect(dialog.getByRole('button',{name:'Close video theater'})).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(dialog).not.toBeVisible();
 await expect(open).toBeFocused();
});
