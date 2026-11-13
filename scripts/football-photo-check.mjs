import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
for(const width of [320,390,430,1024,1440]){
const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:4173');
const photo=page.locator('img.athlete-photo');
await photo.scrollIntoViewIfNeeded();await photo.evaluate(i=>i.decode());
assert(await photo.evaluate(i=>i.naturalWidth===3024&&i.naturalHeight===4032&&Math.abs(i.clientWidth/i.clientHeight-.75)<.01));
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('.athlete-layout').screenshot({path:'qa/football-photo/profile-'+width+'.png'});
await page.screenshot({path:'qa/football-photo/viewport-'+width+'.png'});
await page.close();
}
console.log('Original image dimensions, full aspect ratio and overflow checks passed at five widths.');
}finally{await browser.close();}
