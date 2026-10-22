import {test,expect} from '@playwright/test';
import {chapters} from '../src/data';
import {evidence} from '../src/research';
import {story} from '../src/story';

test('all 12 chapters have independent research and three science beats',()=>{
 expect(chapters).toHaveLength(12);
 expect(evidence).toHaveLength(12);
 expect(story).toHaveLength(12);
 const names=new Set<string>();
 for(let i=0;i<chapters.length;i++){
  const chapter=chapters[i], notes=evidence[i], science=story[i];
  expect(chapter.title.length,`chapter ${i+1} title`).toBeGreaterThan(6);
  expect(names.has(chapter.title),`duplicate chapter title ${chapter.title}`).toBeFalsy();
  names.add(chapter.title);
  expect(notes.heading.length).toBeGreaterThan(6);
  expect(notes.sources.some(s=>/^https?:\/\//.test(s.url)),`chapter ${i+1} source citation`).toBeTruthy();
  expect(science.length,`chapter ${i+1} science beats`).toBe(3);
 }
});
test('all 12 chapter navigation controls reveal the expected heading and active graphic',async({page},info)=>{
 test.skip(info.project.name!=='desktop-chromium','Full chapter browsing in desktop; mobile interactions in layout QA');
 test.slow(); // Twelve animated transitions plus software-rendered Three.js
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 const buttons=page.locator('.film-progress-segments button');
 await expect(buttons).toHaveCount(12);
 for(let i=0;i<chapters.length;i++){
  await buttons.nth(i).click();
  await expect(page.locator('.film-stage h1')).toHaveText(chapters[i].title,{timeout:18000});
 }
 await expect(page.locator('.beat-visual svg[role="img"]')).toBeVisible();
 await page.getByRole('button',{name:'Field Notes',exact:true}).click();
 await expect(page.getByRole('region',{name:'Chapter Field Notes'})).toBeVisible();
 await expect(page.locator('.film-dossier a[href^="http"]')).not.toHaveCount(0);
 await page.getByRole('button',{name:'Close Field Notes'}).click();
 await expect(page.getByRole('region',{name:'Chapter Field Notes'})).toHaveCount(0);
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
