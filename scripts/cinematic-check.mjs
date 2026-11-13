import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const errors=[];
try{
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:1000},hasTouch:width===390});
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(150);await page.screenshot({path:'qa/v5.3-correction/intro-start-'+width+'.png'});
 assert(await page.locator('#skip-intro').isVisible());
 await page.mouse.move(width*.8,450);
 await page.waitForTimeout(1300);await page.screenshot({path:'qa/v5.3-correction/intro-middle-'+width+'.png'});
 await page.locator('.intro').waitFor({state:'detached',timeout:5000});
 await page.screenshot({path:'qa/v5.3-correction/intro-end-'+width+'.png'});
 for(const [name,selector] of [['artwork','.story-art'],['transition','.football-frame'],['player','.athlete-photo']]){
  await page.locator(selector).scrollIntoViewIfNeeded();await page.waitForTimeout(250);
  await page.screenshot({path:'qa/v5.3-correction/football-'+name+'-'+width+'.png'});
 }
 await page.locator('.athlete-photo').evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight,behavior:'instant'}));await page.waitForTimeout(80);
 const a=Number(await page.locator('.football-story').getAttribute('data-progress'));
 await page.evaluate(()=>scrollBy({top:400,behavior:'instant'}));await page.waitForTimeout(80);
 assert(Number(await page.locator('.football-story').getAttribute('data-progress'))>a);
 for(const selector of ['img.story-art','img.athlete-photo']){
  assert(await page.locator(selector).evaluate(async i=>{await i.decode();return i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain';}));
 }
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.athlete-photo').evaluate(e=>getComputedStyle(e).opacity),'0');
 await page.close();
}
for(const action of ['skip','escape','tab','anchor']){
 const page=await browser.newPage();await page.goto('http://127.0.0.1:4173'+(action==='anchor'?'#football':''),{waitUntil:'domcontentloaded'});
 if(action==='skip')await page.locator('#skip-intro').click();
 if(action==='escape')await page.keyboard.press('Escape');
 if(action==='tab')await page.keyboard.press('Tab');
 assert.equal(await page.locator('.intro').count(),0);await page.close();
}
const plain=await browser.newPage({javaScriptEnabled:false});await plain.goto('http://127.0.0.1:4173/#football');assert(await plain.locator('img.story-art').isVisible());assert(await plain.locator('img.athlete-photo').isVisible());assert.equal(await plain.locator('.athlete-photo').evaluate(e=>getComputedStyle(e).opacity),'0');assert.equal(await plain.locator('.football-image-links a').count(),2);for(const link of await plain.locator('.football-image-links a').all()){const response=await plain.request.get(new URL(await link.getAttribute('href'),plain.url()).href);assert(response.ok());}await plain.close();
 assert.deepEqual(errors,[]);console.log('V5.3 opening, framing, reduced motion, anchors, overflow and screenshot checks passed.');
}finally{await browser.close();}
