import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:4173');await page.waitForTimeout(2000);
const result=await page.evaluate(async()=>{
 const samples=[];let last=performance.now();
 await new Promise(resolve=>{function tick(now){samples.push(now-last);last=now;if(samples.length<120)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
 samples.sort((a,b)=>a-b);return {frames:samples.length,medianMs:samples[60],p95Ms:samples[114],resourceBytes:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0)};
});
await writeFile('qa/v5.2/'+(process.argv[2]||'baseline')+'-performance.json',JSON.stringify(result,null,2));console.log(result);await browser.close();
