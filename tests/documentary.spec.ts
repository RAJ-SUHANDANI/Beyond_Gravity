import {test,expect} from '@playwright/test';
test('opening plays as a cinematic entry and exposes an accessible enter control',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('button',{name:/enter documentary experience/i})).toBeVisible();
 await expect(page.getByText(/Made by Raj Suhandani/i).first()).toBeVisible();
});
test('enter documentary, navigate chapters and open science theater',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await expect(page.locator('.film-root')).toBeVisible();
 await page.waitForTimeout(1200);
 await expect(page.getByRole('heading',{name:/THE IMPOSSIBLE MOMENT/i})).toBeVisible();
 await page.getByRole('button',{name:/DECODE THE SCIENCE/i}).click();
 await expect(page.getByRole('dialog',{name:/Technical documentary/i})).toBeVisible();
 await expect(page.getByText(/THE SCIENCE BEHIND THE STORY/i)).toBeVisible();
 await page.getByRole('button',{name:/Close science theater/i}).click();
 await page.getByRole('button',{name:/Next chapter/i}).click();
 await expect(page.getByRole('heading',{name:/ANATOMY OF AN IDEA/i})).toBeVisible({timeout:10000});
});
test('physics laboratory can change a parameter without a slider',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:/enter documentary experience/i}).click();
 await page.waitForTimeout(1200);
 await page.getByRole('button',{name:/Go to chapter 11/i}).click();
 await expect(page.getByRole('heading',{name:/MAKE PHYSICS VISIBLE/i})).toBeVisible();
 await page.getByRole('button',{name:/OPEN SIMULATOR/i}).click();
 const dlg=page.getByRole('dialog',{name:/THE FUTURE LAB/i});
 await expect(dlg).toBeVisible();
 await expect(dlg.locator('input[type="range"]')).toHaveCount(0);
 await expect(dlg.getByRole('img',{name:/Estimated electrical hover power curve/i})).toBeVisible();
 await dlg.getByRole('button',{name:/Increase ROTOR DISK AREA/i}).click();
 await expect(dlg.getByRole('img',{name:/At 16 square meters/i})).toBeVisible();
 await dlg.getByRole('button',{name:/Increase AIRCRAFT MASS/i}).click();
 await expect(dlg.getByText(/1,000 kg/)).toBeVisible();
 await dlg.getByRole('button',{name:/Close laboratory/i}).click();
});
test('buttons stay within viewport when shown, including reduced-motion mode',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 const enter=page.getByRole('button',{name:/enter documentary experience/i});
 await expect(enter).toBeVisible();
 await enter.click();
 await page.waitForTimeout(1200);
 const action=page.getByRole('button',{name:/DECODE THE SCIENCE/i});
 await action.scrollIntoViewIfNeeded();
 await expect(action).toBeInViewport();
 await expect(page.locator('.film-root')).toHaveAttribute('data-theme','dark');
});
