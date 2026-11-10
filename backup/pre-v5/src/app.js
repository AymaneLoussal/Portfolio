(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const {projects,gallery}=window.portfolioContent;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  $('#year').textContent=new Date().getFullYear();
  // A short, non-intercepting entrance. No timer ever gates access to the page.
  try{if(!sessionStorage.getItem('portfolio-intro')&&!motion.matches){$('.intro').classList.add('show');sessionStorage.setItem('portfolio-intro','seen');setTimeout(()=>$('.intro')?.remove(),1250);}}catch{}
  document.addEventListener('keydown',()=>$('.intro')?.remove(),{once:true});
  document.addEventListener('pointerdown',()=>$('.intro')?.remove(),{once:true});

  const menu=$('#mobile-menu-drawer'),toggle=$('#mobile-menu-toggle');
  function closeMenu(restore=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(restore)toggle.focus();}
  toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)menu.querySelector('a').focus();});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true);});
  document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('.site-header'))closeMenu();});
  matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

  // Native dialogs supply focus containment and inert background behavior.
  let opener=null, current=0;
  function openDialog(dialog,trigger){opener=trigger;dialog.showModal();dialog.querySelector('.close-dialog').focus();sound('open');}
  $$('dialog').forEach(dialog=>{
    dialog.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('keydown',e=>{
      if(e.key!=='Tab')return;
      const controls=[...dialog.querySelectorAll('button:not(:disabled),a[href],[tabindex="0"]')].filter(el=>el.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    });
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
    dialog.addEventListener('close',()=>opener?.focus());
  });
  $$('[data-open-project]').forEach(button=>button.addEventListener('click',()=>{
    const p=projects.find(p=>p.id===button.dataset.openProject);
    $('#project-category').textContent=p.category;$('#project-title').textContent=p.name;$('#project-overview').textContent=p.overview;
    const diagram=$('.case-diagram');diagram.replaceChildren();p.diagram.forEach((label,i)=>{if(i){const arrow=document.createElement('i');arrow.textContent='→';arrow.setAttribute('aria-hidden','true');diagram.append(arrow);}const box=document.createElement('span');box.textContent=label;diagram.append(box);});
    const body=$('.case-body');body.replaceChildren();
    [['Context',p.context],['Technical approach',p.architecture],['Project focus',p.focus]].forEach(([title,text])=>{const h=document.createElement('h3'),para=document.createElement('p');h.textContent=title;para.textContent=text;body.append(h,para);});
    const note=document.createElement('p');note.className='verification';note.textContent=p.note;body.append(note);
    const stack=document.createElement('ul');stack.className='stack';p.stack.forEach(t=>{const li=document.createElement('li');li.textContent=t;stack.append(li);});body.append(stack);
    openDialog($('#project-dialog'),button);
  }));
  const lightbox=$('#lightbox');
  function showImage(index){current=(index+gallery.length)%gallery.length;const g=gallery[current];$('#lightbox-img').src=g.src;$('#lightbox-img').alt=g.alt;$('#lightbox-title').textContent=g.title;$('#lightbox-subtitle').textContent=g.subtitle;$('#lightbox-counter').textContent=`${current+1} / ${gallery.length}`;}
  $$('.editorial-card').forEach(button=>button.addEventListener('click',()=>{showImage(Number(button.dataset.gallery));openDialog(lightbox,button);}));
  $('.lightbox-prev').addEventListener('click',()=>showImage(current-1));$('.lightbox-next').addEventListener('click',()=>showImage(current+1));
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showImage(current-1);}if(e.key==='ArrowRight'){e.preventDefault();showImage(current+1);}});
  let touch=null;
  lightbox.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null;},{passive:true});
  lightbox.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)showImage(current+(dx<0?1:-1));touch=null;},{passive:true});
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});

  $$('.tactical-node').forEach(node=>{
    node.setAttribute('tabindex','0');node.setAttribute('role','button');node.setAttribute('aria-label',node.dataset.role);
    const select=()=>{$('#pitch-role-display').textContent=node.dataset.role;$('#pitch-pass-lines').setAttribute('opacity','.9');};
    node.addEventListener('pointerenter',select);node.addEventListener('focus',select);node.addEventListener('click',select);
    node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});
  });

  let copyTimer;
  $('#copy-email-btn').addEventListener('click',async()=>{
    clearTimeout(copyTimer);const status=$('#copy-feedback-toast');
    try{await navigator.clipboard.writeText($('#copy-email-target').textContent);status.textContent='Email copied.';$('#copy-email-btn').textContent='Copied ✓';}
    catch{status.textContent='Select the email to copy, or click it to open your mail app.';}
    copyTimer=setTimeout(()=>{status.textContent='';$('#copy-email-btn').textContent='Copy ↗';},4000);
  });

  // Silent on each new visit. Saved preference only changes after a user gesture.
  let audio=null,enabled=false,lastSound=0;
  const soundButton=$('#sound-toggle-btn');
  soundButton.addEventListener('click',async()=>{
    try{
      if(!enabled){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('Unsupported');audio??=new Audio();await audio.resume();}
      enabled=!enabled;soundButton.setAttribute('aria-pressed',String(enabled));soundButton.setAttribute('aria-label',enabled?'Disable sound':'Enable sound');$('#sound-status-text').textContent=enabled?'Sound on':'Sound off';
      try{localStorage.setItem('portfolio-sound',String(enabled));}catch{}
      if(enabled)sound('open');else if(audio)await audio.suspend();
    }catch{$('#sound-status-text').textContent='Sound unavailable';enabled=false;soundButton.setAttribute('aria-pressed','false');}
  });
  function sound(type='click'){
    if(!enabled||!audio||audio.state!=='running'||performance.now()-lastSound<90)return;lastSound=performance.now();
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    oscillator.type='sine';oscillator.frequency.setValueAtTime(type==='open'?330:650,now);oscillator.frequency.exponentialRampToValueAtTime(180,now+.09);gain.gain.setValueAtTime(.018,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.12);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.13);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  document.addEventListener('click',e=>{if(e.target.closest('a,button'))sound();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio?.suspend();else if(enabled)audio?.resume().catch(()=>{});});

  // Elements stay visible by default: observer failure cannot hide content.
  if('IntersectionObserver'in window){
    const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!motion.matches)e.target.classList.add('reveal');reveal.unobserve(e.target);}}),{threshold:.08});
    $$('.section-heading,.project,.gallery-item,.about-copy,.sport-copy').forEach(el=>reveal.observe(el));
    const active=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){$$('.desktop-nav a').forEach(a=>a.removeAttribute('aria-current'));const target=['modeling','athletics','parkour'].includes(e.target.id)?'dimensions':e.target.id;document.querySelector('.desktop-nav a[href="#'+target+'"]')?.setAttribute('aria-current','location');}}),{rootMargin:'-15% 0px -55% 0px'});
    $$('main section[id]').forEach(el=>active.observe(el));
  }
  // Native pointer is retained. Context label is decorative and never intercepts clicks.
  const cursor=$('.cursor-label');let cursorFrame=0,targetX=0,targetY=0,cx=0,cy=0;
  function moveCursor(){cursorFrame=0;cx+=(targetX-cx)*.22;cy+=(targetY-cy)*.22;cursor.style.transform=`translate3d(${cx+18}px,${cy+20}px,0)`;if(cursor.classList.contains('active')&&Math.abs(targetX-cx)+Math.abs(targetY-cy)>.5)cursorFrame=requestAnimationFrame(moveCursor);}
  document.addEventListener('pointermove',e=>{if(!finePointer.matches||motion.matches)return;const target=e.target.closest('.project-open,.editorial-card');cursor.classList.toggle('active',Boolean(target));if(target){cursor.textContent=target.matches('.editorial-card')?'EXPLORE':'VIEW PROJECT';targetX=e.clientX;targetY=e.clientY;if(!cursorFrame)cursorFrame=requestAnimationFrame(moveCursor);}},{passive:true});
  document.addEventListener('pointerleave',()=>cursor.classList.remove('active'));
  $$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!finePointer.matches||motion.matches)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.1}px)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});
  motion.addEventListener('change',()=>{cursor.classList.remove('active');$$('.magnetic').forEach(el=>el.style.transform='');});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(cursorFrame);audio?.suspend();});
})();
