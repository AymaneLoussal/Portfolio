(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const {projects,gallery}=window.portfolioContent;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  $('#year').textContent=new Date().getFullYear();
  // A finite decorative opening: content loads normally and any navigation exits it.
  const intro=$('.intro'),introEvents=new AbortController();
  let introTimer,introFrame=0;
  function dismissIntro(){
    clearTimeout(introTimer);cancelAnimationFrame(introFrame);introEvents.abort();
    const restore=intro?.contains(document.activeElement);
    intro?.remove();if(restore)document.querySelector('.brand')?.focus();
  }
  try{
    if(sessionStorage.getItem('portfolio-v5-intro')||motion.matches||location.hash||scrollY>0)dismissIntro();
    else{
      sessionStorage.setItem('portfolio-v5-intro','seen');
      intro.classList.add('show');intro.removeAttribute('aria-hidden');$('#skip-intro').tabIndex=0;
      const options={signal:introEvents.signal};
      $('#skip-intro').addEventListener('click',dismissIntro,options);
      document.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='Tab')dismissIntro();},options);
      window.addEventListener('hashchange',dismissIntro,options);
      window.addEventListener('scroll',dismissIntro,{...options,passive:true});
      window.addEventListener('pagehide',dismissIntro,options);
      motion.addEventListener('change',dismissIntro,options);
      intro.addEventListener('pointermove',e=>{
        if(introFrame)return;
        introFrame=requestAnimationFrame(()=>{introFrame=0;intro.style.setProperty('--intro-x',((e.clientX/innerWidth-.5)*12)+'px');intro.style.setProperty('--intro-y',((e.clientY/innerHeight-.5)*8)+'px');});
      },{...options,passive:true});
      introTimer=setTimeout(dismissIntro,3600);
    }
  }catch{dismissIntro();}
  function sound(type){window.portfolioSound?.play(type);}

  const menu=$('#mobile-menu-drawer'),toggle=$('#mobile-menu-toggle');
  function closeMenu(restore=false){menu.hidden=true;toggle.setAttribute('aria-expanded','false');if(restore)toggle.focus();}
  toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)menu.querySelector('a').focus();});
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden)closeMenu(true);});
  document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('.site-header'))closeMenu();});
  matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

  // Native dialogs supply focus containment and inert background behavior.
  let opener=null, current=0;
  function openDialog(dialog,trigger){hideCursor();opener=trigger;dialog.showModal();dialog.querySelector('.close-dialog').focus();}
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
    if(p.repository){const link=document.createElement('a');link.href=p.repository;link.textContent='Read the source on GitHub ↗';link.className='text-link';link.target='_blank';link.rel='noopener noreferrer';body.append(link);}
    openDialog($('#project-dialog'),button);
  }));
  const lightbox=$('#lightbox');let imageAnimation;
  function revealImage(){imageAnimation?.cancel();if(!motion.matches)imageAnimation=$('#lightbox-img').animate([{opacity:.45,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:300,easing:'cubic-bezier(.22,.68,.2,1)'});}
  $('#lightbox-img').addEventListener('load',revealImage);
  lightbox.addEventListener('close',()=>imageAnimation?.cancel());
  motion.addEventListener('change',()=>imageAnimation?.cancel());
  function showImage(index){current=(index+gallery.length)%gallery.length;const g=gallery[current];$('#lightbox-img').src=g.src;$('#lightbox-img').alt=g.alt;$('#lightbox-title').textContent=g.title;$('#lightbox-subtitle').textContent=g.subtitle;$('#lightbox-counter').textContent=`${current+1} / ${gallery.length}`;}
  $$('.editorial-card').forEach(button=>button.addEventListener('click',e=>{e.preventDefault();showImage(Number(button.dataset.gallery));openDialog(lightbox,button);}));
  $('.lightbox-prev').addEventListener('click',()=>showImage(current-1));$('.lightbox-next').addEventListener('click',()=>showImage(current+1));
  lightbox.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();showImage(current-1);}if(e.key==='ArrowRight'){e.preventDefault();showImage(current+1);}});
  let touch=null;
  lightbox.addEventListener('touchstart',e=>{if(e.touches.length===1)touch={x:e.touches[0].clientX,y:e.touches[0].clientY};else touch=null;},{passive:true});
  lightbox.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5)showImage(current+(dx<0?1:-1));touch=null;},{passive:true});
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close();});

  const positions={winger:{label:'WIDE CHANNELS / WINGER',description:'Winger — the wide channels. Creating width, carrying the ball forward, and supporting attacks from either flank.',alt:'Football pitch showing the wide attacking channels for a winger'},midfielder:{label:'CENTRAL SPACES / MIDFIELDER',description:'Midfielder — the central spaces. Connecting defense and attack, offering passing options, and helping the team keep its shape.',alt:'Football pitch showing the central spaces for a midfielder'}};
  $$('.position-controls button').forEach(button=>{
    button.addEventListener('click',()=>{const key=button.dataset.position,data=positions[key];$('.pitch').dataset.position=key;$('.pitch svg').setAttribute('aria-label',data.alt);$('#pitch-role-display').textContent=data.label;$('#position-description').textContent=data.description;$$('.position-controls button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));});
  });

  let copyTimer;
  $('#copy-email-btn').addEventListener('click',async()=>{
    clearTimeout(copyTimer);const status=$('#copy-feedback-toast');
    try{await navigator.clipboard.writeText($('#copy-email-target').textContent);status.textContent='Email copied.';$('#copy-email-btn').textContent='Copied ✓';}
    catch{status.textContent='Select the email to copy, or click it to open your mail app.';}
    copyTimer=setTimeout(()=>{status.textContent='';$('#copy-email-btn').textContent='Copy ↗';},4000);
  });

  // Native pointer is retained. Context label is decorative and never intercepts clicks.
  const cursor=$('.cursor-label');let cursorFrame=0,targetX=0,targetY=0,cx=0,cy=0;
  function moveCursor(){cursorFrame=0;cx+=(targetX-cx)*.22;cy+=(targetY-cy)*.22;cursor.style.transform=`translate3d(${cx+18}px,${cy+20}px,0)`;if(cursor.classList.contains('active')&&Math.abs(targetX-cx)+Math.abs(targetY-cy)>.5)cursorFrame=requestAnimationFrame(moveCursor);}
  document.addEventListener('pointermove',e=>{if(!finePointer.matches||motion.matches)return;const target=e.target.closest('[data-cursor]');cursor.classList.toggle('active',Boolean(target));if(target){cursor.textContent=target.dataset.cursor;targetX=e.clientX;targetY=e.clientY;if(!cursorFrame)cursorFrame=requestAnimationFrame(moveCursor);}},{passive:true});
  function hideCursor(){cursor.classList.remove('active');cancelAnimationFrame(cursorFrame);cursorFrame=0;}
  document.addEventListener('pointerleave',hideCursor);
  window.addEventListener('scroll',hideCursor,{passive:true});
  window.addEventListener('blur',hideCursor);
  $$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{if(!finePointer.matches||motion.matches)return;const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.1}px)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});
  $$('[data-tilt]').forEach(el=>{el.addEventListener('pointermove',e=>{if(!finePointer.matches||motion.matches)return;const r=el.getBoundingClientRect();el.style.transform=`perspective(900px) rotateX(${-(e.clientY-r.top-r.height/2)*.012}deg) rotateY(${(e.clientX-r.left-r.width/2)*.012}deg)`;});el.addEventListener('pointerleave',()=>el.style.transform='');});
  motion.addEventListener('change',()=>{cursor.classList.remove('active');$$('.magnetic,[data-tilt]').forEach(el=>el.style.transform='');});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(cursorFrame);});
})();
