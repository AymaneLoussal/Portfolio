import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const checks=[];
try{
const page=await browser.newPage();await page.emulateMedia({reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:4173');
for(const width of [320,390,430,768,1024,1280,1440,1920,512,640,720,960]){
 await page.setViewportSize({width,height:900});
 for(const id of ['home','development','modeling','football','contact']){
  await page.locator('#'+id).scrollIntoViewIfNeeded();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),width+' overflow '+id);
  if(width>760){
   assert.equal(await page.locator('.world-nav a').count(),3);
   const main=await page.locator('main').boundingBox();
   assert(Math.abs(main.width-width)<1,width+' no gutter '+id);
   await page.locator('.desktop-nav a').first().focus();await page.keyboard.press('Tab');
   assert(await page.locator('.desktop-nav').evaluate(e=>e.contains(document.activeElement)));
   assert(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle!=='none'));
  }
 }
 if(width<=760){
  for(const selector of ['.football-image-links a','.position-controls button','#copy-email-btn','.socials a','#mobile-menu-toggle']){
   for(const el of await page.locator(selector).all()){
    await el.scrollIntoViewIfNeeded();const r=await el.boundingBox();
    assert(r.width>=44&&r.height>=44,selector+' target '+width);
    assert(r.x>=0&&r.x+r.width<=width+.5,selector+' clipped '+width);
   }
  }
 }
 checks.push(width+'px: all sections, overflow, header/focus or mobile targets passed');
}
await writeFile('qa/v5.3-correction/layout-results.json',JSON.stringify({checks,zoom:'200% reflow equivalent CSS viewports: 512,640,720,960; not browser chrome zoom'},null,2));
console.log(checks.join('\n'));
}finally{await browser.close();}
