import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.locator('.intro').waitFor({state:'detached',timeout:5000});
 for(const id of ['home','development','modeling','football','contact']){
  await page.locator('#'+id).scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({path:`qa/v5.3-correction/${name}-${id}.png`});
 }
 await page.close();
}
await browser.close();
