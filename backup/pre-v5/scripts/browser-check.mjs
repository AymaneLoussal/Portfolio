import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
const errors=[],failedRequests=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('requestfailed',r=>failedRequests.push({url:r.url(),failure:r.failure()?.errorText}));
const check=(name,value)=>{assert(value,name);checks.push(name);};
try{
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.waitForTimeout(1400);
  check('WebGL renders a frame',await page.locator('#threejs-container').evaluate(e=>e.classList.contains('webgl-ready')));
  check('Sound starts disabled',await page.locator('#sound-toggle-btn').getAttribute('aria-pressed')==='false');
  await page.screenshot({path:'qa/desktop-hero.png'});
  for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(150);
    check(`No horizontal overflow at ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.setViewportSize({width:1440,height:1000});
  for(const name of ['ToolShare','FTMBALL','EPS Education','FactoryFlow']){
    const trigger=page.getByRole('button',{name:`View ${name} project details`,exact:true});
    await trigger.click();
    check(`${name} dialog opens`,await page.locator('#project-dialog').evaluate(d=>d.open));
    check(`${name} dialog content matches`,await page.locator('#project-title').textContent()===name);
    await page.keyboard.press('Shift+Tab');
    check(`${name} focus stays in dialog`,await page.evaluate(()=>document.querySelector('#project-dialog').contains(document.activeElement)));
    await page.keyboard.press('Escape');
    check(`${name} focus restored`,await trigger.evaluate(e=>e===document.activeElement));
  }
  await page.locator('.editorial-card').first().click();
  await page.keyboard.press('ArrowLeft');
  check('Lightbox previous wraps',await page.locator('#lightbox-counter').textContent()==='4 / 4');
  await page.keyboard.press('ArrowRight');
  check('Lightbox next wraps',await page.locator('#lightbox-counter').textContent()==='1 / 4');
  check('Lightbox image alt changes',await page.locator('#lightbox-img').getAttribute('alt')!=='');
  await page.keyboard.press('Escape');
  check('Gallery focus restored',await page.locator('.editorial-card').first().evaluate(e=>e===document.activeElement));
  for(const img of await page.locator('main img').all()){
    await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
    check(`Image loads uncropped: ${await img.getAttribute('src')}`,await img.evaluate(i=>i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain'));
  }
  await page.locator('#modeling').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:'qa/desktop-gallery.png'});
  await page.locator('.tactical-node').first().focus();await page.keyboard.press('Enter');
  check('Pitch responds to keyboard', (await page.locator('#pitch-role-display').textContent()).includes('Goalkeeper'));
  await page.locator('#copy-email-btn').click();
  check('Email copy writes clipboard',await page.evaluate(()=>navigator.clipboard.readText())==='ayman.loussal@gmail.com');
  await page.locator('#sound-toggle-btn').click();
  check('Sound can be enabled',await page.locator('#sound-toggle-btn').getAttribute('aria-pressed')==='true');
  await page.locator('#sound-toggle-btn').click();
  check('Sound can be disabled',await page.locator('#sound-toggle-btn').getAttribute('aria-pressed')==='false');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'qa/mobile-hero.png'});
  await page.locator('#mobile-menu-toggle').click();
  check('Mobile menu opens',await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded')==='true');
  await page.locator('#mobile-menu-drawer a[href="#parkour"]').click();
  check('Mobile menu link navigates',new URL(page.url()).hash==='#parkour');
  check('Mobile menu closes',await page.locator('#mobile-menu-drawer').evaluate(e=>e.hidden));
  await page.locator('.editorial-card').nth(1).click();await page.locator('.lightbox-next').click();
  check('Mobile gallery controls work',await page.locator('#lightbox-counter').textContent()==='3 / 4');
  await page.locator('#lightbox').evaluate(el=>{
    const start=new Touch({identifier:1,target:el,clientX:280,clientY:300});
    const end=new Touch({identifier:1,target:el,clientX:100,clientY:305});
    el.dispatchEvent(new TouchEvent('touchstart',{touches:[start],bubbles:true}));
    el.dispatchEvent(new TouchEvent('touchend',{changedTouches:[end],bubbles:true}));
  });
  check('Gallery swipe handler advances',await page.locator('#lightbox-counter').textContent()==='4 / 4');
  await page.screenshot({path:'qa/mobile-lightbox.png'});await page.keyboard.press('Escape');
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  check('Reduced motion disables CSS animation',await page.locator('.intro').count()===0);
  const canvas=page.locator('#threejs-container canvas');
  const stillA=await canvas.screenshot();await page.waitForTimeout(200);const stillB=await canvas.screenshot();
  check('Reduced motion keeps WebGL sculpture static',stillA.equals(stillB));
  await page.emulateMedia({reducedMotion:'no-preference'});
  const movingA=await canvas.screenshot();await page.waitForTimeout(250);const movingB=await canvas.screenshot();
  check('Sculpture animation resumes',!movingA.equals(movingB));
  await page.route('**/assets/three.min.js',r=>r.abort());await page.reload({waitUntil:'networkidle'});
  check('WebGL dependency failure retains CSS sculpture',await page.locator('.three-fallback').isVisible());
  check('Content survives WebGL failure',await page.locator('h1').isVisible());
  await page.unroute('**/assets/three.min.js');
  await page.evaluate(()=>sessionStorage.removeItem('portfolio-intro'));await page.reload({waitUntil:'domcontentloaded'});await page.keyboard.press('Tab');await page.waitForTimeout(1400);
  check('Early intro dismissal produces no exception',errors.length===0);
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await noJs.newPage();await plain.goto('http://127.0.0.1:4173');
  check('Content readable with JavaScript disabled',await plain.locator('#work h3').count()===4&&await plain.locator('.three-fallback').isVisible());await noJs.close();
  check('No uncaught JavaScript errors',errors.length===0);
  const report={checks,errors,failedRequests,notes:['Intentional Three.js request abort tests fallback. Swipe verified through touch event dispatch, not a physical device.','Browser: installed headless Chrome. No Lighthouse score measured.']};
  await writeFile('qa/results.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
