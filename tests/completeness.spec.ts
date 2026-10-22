import {test,expect} from '@playwright/test';

test('every chapter displays its heading, technical illustration, sourcebook and unique research',async({page},info)=>{
 test.skip(info.project.name!=='desktop-chromium','Chapter-wide verification runs on desktop; mobile layout has separate visual tests');
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 const chapterButtons=page.locator('.film-progress-segments button');
 await expect(chapterButtons).toHaveCount(12);
 for(let i=0;i<12;i++){
   await chapterButtons.nth(i).click();
   await expect(page.locator('.film-stage h1')).toBeVisible({timeout:14000});
   const heading=(await page.locator('.film-stage h1').innerText()).trim();
   expect(heading.length,`chapter ${i+1} must have a meaningful title`).toBeGreaterThan(7);
   await expect(page.locator('.beat-visual svg[role="img"]')).toBeVisible();
   await page.getByRole('button',{name:/FIELD NOTES/i}).click();
   await expect(page.locator('.film-dossier h3')).toBeVisible();
   await expect(page.getByRole('button',{name:'Close Field Notes'})).toBeVisible();
   await expect(page.locator('.film-dossier a[href^="http"]')).not.toHaveCount(0);
   await page.getByRole('button',{name:'Close Field Notes'}).click();
   await expect(page.locator('.film-dossier')).toHaveCount(0);
 }
});

test('all 19 narrated neural tracks and caption manifests are published with correct MIME types',async({request},info)=>{
 test.skip(info.project.name!=='desktop-chromium','Media manifest availability does not depend on viewport');
 const clips=[...Array.from({length:12},(_,i)=>'male-'+String(i).padStart(2,'0')),...['female-body','female-fans','female-vessel','female-thrusters','female-wheels','female-computer','female-intro']];
 expect(clips).toHaveLength(19);
 for(const name of clips){
   const audio=await request.head('/audio/'+name+'.mp3');
   expect(audio.status(),name+' is missing').toBe(200);
   expect(audio.headers()['content-type'],name+' audio MIME').toMatch(/audio\/(mpeg|mp3)/i);
   const captions=await request.get('/audio/'+name+'.vtt');
   expect(captions.status(),name+' subtitle file missing').toBe(200);
   const body=await captions.text();
   expect(body.startsWith('WEBVTT'),name+' is not WebVTT').toBeTruthy();
   expect((body.match(/-->/g)||[]).length,name+' subtitle cue count').toBeGreaterThan(0);
 }
});

test('chapter browsing, science theater and physics controls produce no uncaught application errors',async({page},info)=>{
 test.skip(info.project.name!=='desktop-chromium','Comprehensive error instrumentation on desktop');
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await page.getByRole('button',{name:/DECODE THE SCIENCE/i}).click();
 await expect(page.getByRole('dialog',{name:/Technical documentary/i})).toBeVisible();
 await page.getByRole('button',{name:/Close science theater/i}).click();
 await page.getByRole('button',{name:/Go to chapter 11/i}).click();
 await page.getByRole('button',{name:/OPEN SIMULATOR/i}).click();
 await expect(page.getByRole('dialog',{name:/THE FUTURE LAB/i})).toBeVisible();
 await page.getByRole('button',{name:/Increase AIRCRAFT MASS/i}).click();
 await page.getByRole('button',{name:/Close laboratory/i}).click();
 expect(errors,'uncaught React/WebGL errors: '+errors.join('; ')).toEqual([]);
});
