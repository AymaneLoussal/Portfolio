import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});const evidence=[];
try{
for(const width of [1440,390]){
const page=await browser.newPage({viewport:{width,height:1000}});
await page.goto('http://127.0.0.1:4173/#development',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
for(const kind of ['editorial','stadium','reconnect']){
 const bridge=page.locator('[data-transition="'+kind+'"]');let previous;
 for(const p of [0,.25,.5,.75,1]){
  await bridge.evaluate((el,{p,mobile})=>scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*(mobile?.4:.22)+p*innerHeight*(mobile?.35:.38),behavior:'instant'}),{p,mobile:width<=760});
  await page.waitForTimeout(100);
  const actual=Number(await bridge.getAttribute('data-progress'));assert(Math.abs(actual-p)<.015,JSON.stringify({width,kind,p,actual}));
  const shot=await page.screenshot({path:'qa/scroll-correction/'+width+'-'+kind+'-'+p+'.png'});
  if(previous)assert(!previous.equals(shot));previous=shot;
  evidence.push({width,kind,p,color:await bridge.evaluate(e=>getComputedStyle(e).backgroundColor)});
 }
}
for(const p of [0,.25,.45,.6,.75,1]){
 await page.locator('.football-frame').evaluate((el,p)=>scrollTo({top:el.getBoundingClientRect().top+scrollY-innerHeight*.72+p*innerHeight*.48,behavior:'instant'}),p);
 await page.waitForTimeout(80);const opacity=await page.locator('.athlete-photo').evaluate(e=>Number(getComputedStyle(e).opacity));
 assert(Math.abs(opacity-(p<=.45?0:p>=.75?1:.5))<.02);
 await page.screenshot({path:'qa/scroll-correction/'+width+'-football-'+p+'.png'});
}
assert.equal(await page.locator('.world-nav a').count(),3);
for(const a of await page.locator('.world-nav a').all()){
 await a.click();await page.waitForFunction(h=>document.body.dataset.world===h.slice(1),await a.getAttribute('href'));assert.equal(await a.getAttribute('aria-current'),'location');
 const r=await a.boundingBox();assert(r.width>=44&&r.height>=44);
}
await page.close();
}
await writeFile('qa/scroll-correction/stages.json',JSON.stringify(evidence,null,2));console.log('Rendered stage captures, scroll progress, football hold/reveal and world links passed.');
}finally{await browser.close();}
