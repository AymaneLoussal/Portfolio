import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('qa',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});
const page=await context.newPage();
const errors=[],failedRequests=[],checks=[],httpErrors=[],consoleErrors=[];
page.on('response',r=>{if(r.status()>=400)httpErrors.push({url:r.url(),status:r.status()});});
page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::ERR_FAILED'))consoleErrors.push(m.text());});
page.on('pageerror',e=>(console.log('PAGEERROR',e.message),errors.push(e.message)));
page.on('requestfailed',r=>failedRequests.push({url:r.url(),failure:r.failure()?.errorText}));
const check=(name,value)=>{assert(value,name);checks.push(name);};
try{
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  await page.locator('.intro').waitFor({state:'detached',timeout:5000});
  check('WebGL renders a frame',await page.locator('#threejs-container').evaluate(e=>e.classList.contains('webgl-ready')));
  check('Sound starts disabled',await page.locator('#sound-toggle-btn').getAttribute('aria-pressed')==='false');
  await page.screenshot({path:'qa/desktop-hero.png'});
  for(const width of [1440,1024,768,390,320]){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(150);
    check(`No horizontal overflow at ${width}px`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-cursor]').first().hover();
  check('Context cursor appears over interactive target',await page.locator('.cursor-label').evaluate(el=>el.classList.contains('active')));
  await page.evaluate(()=>scrollBy({top:100,behavior:'instant'}));await page.waitForTimeout(100);
  check('Context cursor clears on scroll',await page.locator('.cursor-label').evaluate(el=>!el.classList.contains('active')));
  for(const name of ['ToolShare','FTMBALL','LinkUp']){
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
  check('Lightbox previous wraps',await page.locator('#lightbox-counter').textContent()==='5 / 5');
  await page.keyboard.press('ArrowRight');
  check('Lightbox next wraps',await page.locator('#lightbox-counter').textContent()==='1 / 5');
  check('Lightbox image alt changes',await page.locator('#lightbox-img').getAttribute('alt')!=='');
  await page.keyboard.press('Escape');
  check('Gallery focus restored',await page.locator('.editorial-card').first().evaluate(e=>e===document.activeElement));
  for(const img of await page.locator('main img').all()){
    await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
    check(`Image loads uncropped: ${await img.getAttribute('src')}`,await img.evaluate(i=>i.naturalWidth>0&&getComputedStyle(i).objectFit==='contain'));
  }
  await page.locator('#modeling').evaluate(el=>scrollTo({top:el.offsetTop-82,behavior:'instant'}));await page.waitForTimeout(700);await page.screenshot({path:'qa/desktop-gallery.png'});
  await page.locator('button[data-position="midfielder"]').focus();await page.keyboard.press('Enter');
  check('Pitch responds to keyboard', (await page.locator('#pitch-role-display').textContent()).includes('MIDFIELDER'));
  check('Midfielder selection updates pressed state',await page.locator('button[data-position="midfielder"]').getAttribute('aria-pressed')==='true');
  check('Pitch highlights midfield',await page.locator('.pitch').getAttribute('data-position')==='midfielder');
  check('Pitch accessible description updates',(await page.locator('.pitch svg').getAttribute('aria-label')).includes('central spaces'));
  await page.locator('button[data-position="winger"]').click();
  check('Winger selection restores wide channels',await page.locator('.pitch').getAttribute('data-position')==='winger');
  await page.locator('#football').evaluate(el=>scrollTo({top:el.offsetTop-82,behavior:'instant'}));await page.waitForTimeout(200);await page.screenshot({path:'qa/desktop-football.png'});
  await page.locator('#copy-email-btn').click();
  check('Email copy writes clipboard',await page.evaluate(()=>navigator.clipboard.readText())==='aymanloussal552@gmail.com');
  await page.locator('#sound-toggle-btn').click();
  check('Sound can be enabled',await page.locator('#sound-toggle-btn').getAttribute('aria-pressed')==='true');
  for(const world of ['development','modeling','football']){
    await page.locator('.desktop-nav a[href="#'+world+'"]').click();await page.waitForFunction(w=>document.body.dataset.world===w,world);
    check(`${world}: direct world navigation updates indicator`,await page.locator('.desktop-nav a[href="#'+world+'"]').getAttribute('aria-current')==='location');
    check(`${world}: sound palette follows world`,await page.locator('#sound-toggle-btn').getAttribute('data-sound-world')===world);
  }
  await page.locator('#sound-toggle-btn').click();
  check('Sound can be disabled',await page.locator('#sound-toggle-btn').getAttribute('aria-pressed')==='false');
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:'qa/mobile-hero.png'});
  await page.locator('#mobile-menu-toggle').click();
  check('Mobile menu opens',await page.locator('#mobile-menu-toggle').getAttribute('aria-expanded')==='true');
  await page.locator('#mobile-menu-drawer a[href="#football"]').click();
  check('Mobile menu link navigates',new URL(page.url()).hash==='#football');
  check('Mobile menu closes',await page.locator('#mobile-menu-drawer').evaluate(e=>e.hidden));
  await page.locator('.editorial-card').nth(1).click();await page.locator('.lightbox-next').click();
  check('Mobile gallery controls work',await page.locator('#lightbox-counter').textContent()==='3 / 5');
  await page.locator('#lightbox').evaluate(el=>{
    const start=new Touch({identifier:1,target:el,clientX:280,clientY:300});
    const end=new Touch({identifier:1,target:el,clientX:100,clientY:305});
    el.dispatchEvent(new TouchEvent('touchstart',{touches:[start],bubbles:true}));
    el.dispatchEvent(new TouchEvent('touchend',{changedTouches:[end],bubbles:true}));
  });
  check('Gallery swipe handler advances',await page.locator('#lightbox-counter').textContent()==='4 / 5');
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
  check('Fallback does not advertise unavailable dragging',!await page.locator('.drag-hint').isVisible());
  await page.unroute('**/assets/three.min.js');
  await page.evaluate(()=>sessionStorage.removeItem('portfolio-v5-intro'));await page.reload({waitUntil:'domcontentloaded'});await page.keyboard.press('Tab');await page.waitForTimeout(1800);
  check('Early intro dismissal produces no exception',errors.length===0);
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await noJs.newPage();await plain.goto('http://127.0.0.1:4173');
  check('Content readable with JavaScript disabled',await plain.locator('#development .project h3').count()===3&&await plain.locator('.three-fallback').isVisible());await noJs.close();
  check('Correct GitHub URL',await page.locator('.socials a[href="https://github.com/aymaneloussal"]').count()===1);
  check('Correct Instagram URL',await page.locator('.socials a[href="https://www.instagram.com/eeymee_en/"]').count()===1);
  check('All mail links use supplied address',await page.locator('a[href^="mailto:"]').evaluateAll(links=>links.every(a=>a.href.startsWith('mailto:aymanloussal552@gmail.com'))));
  check('Three distinct inquiry subjects',await page.locator('.contact-path').evaluateAll(links=>new Set(links.map(a=>new URL(a.href).searchParams.get('subject'))).size===3));
  check('Verified LinkUp repository link',await page.locator('.repository-link').getAttribute('href')==='https://github.com/AymaneLoussal/linkup');
  check('Retired concepts absent',!await page.locator('body').innerText().then(t=>/beyond code|parkour|four dimensions/i.test(t)));
  check('Team and positions present',(await page.locator('.athlete-profile').textContent()).includes('Difaa Safi')&&(await page.locator('.athlete-profile').textContent()).includes('Winger / Midfielder'));
  await page.setViewportSize({width:1440,height:1000});
  for(const kind of ['editorial','stadium','reconnect']){
    const transition=page.locator('[data-transition="'+kind+'"]');
    await transition.evaluate(el=>scrollTo({top:el.offsetTop-innerHeight*.22,behavior:'instant'}));await page.waitForTimeout(100);
    const a=Number(await transition.getAttribute('data-progress'));
    await page.evaluate(()=>scrollBy({top:300,behavior:'instant'}));await page.waitForTimeout(100);
    const b=Number(await transition.getAttribute('data-progress'));
    check(`${kind}: animation follows native scroll`,b>a);
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#football').evaluate(el=>scrollTo({top:el.offsetTop,behavior:'instant'}));
  check('Reduced motion removes sticky transition scenes',await page.locator('.transition-stage').first().evaluate(el=>getComputedStyle(el).position==='relative'));
  check('No unexpected HTTP errors',httpErrors.length===0);
  check('No console errors',consoleErrors.length===0);
  check('No uncaught JavaScript errors',errors.length===0);
  const report={version:5,date:new Date().toISOString(),checks,errors,consoleErrors,httpErrors,failedRequests,notes:['Intentional Three.js request abort tests fallback. Swipe verified through touch event dispatch, not a physical device.','Browser: installed headless Chrome. No Lighthouse score measured.']};
  await writeFile('qa/results.json',JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}

