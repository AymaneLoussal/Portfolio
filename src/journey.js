/* Event-driven native scroll choreography: no interception, scroll delays or pinning library. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width:760px)');
  const sections=[...document.querySelectorAll('main section[data-world]')];
  const bridges=[...document.querySelectorAll('[data-transition]')];
  const links=[...document.querySelectorAll('.desktop-nav a,#mobile-menu-drawer a,.world-nav a')];
  const hero=document.querySelector('.hero');
  const story=document.querySelector('.football-story');
  story?.classList.add('story-ready');
  let frame=0,world='';
  const clamp=n=>Math.max(0,Math.min(1,n));
  function update(){
    frame=0;
    const height=innerHeight;
    let current='home';
    // Last world whose top has passed the reading line. Stable through intervening bridges.
    for(const section of sections){if(section.getBoundingClientRect().top<height*.45)current=section.dataset.world;}
    if(current!==world){world=current;document.body.dataset.world=world;links.forEach(a=>{if(a.hash==='#'+world)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});document.dispatchEvent(new CustomEvent('portfolio:world',{detail:{world}}));}
    if(story){const r=story.querySelector('.football-frame').getBoundingClientRect();const p=motion.matches?0:clamp((height*.72-r.top)/(height*.48));const reveal=clamp((p-.45)/.3);story.style.setProperty('--story-progress',(reveal*reveal*(3-2*reveal)).toFixed(4));story.dataset.progress=p.toFixed(4);}
    document.body.dataset.navLight=String(current==='modeling');
    const heroProgress=motion.matches?0:clamp(-hero.getBoundingClientRect().top/height);
    hero.style.setProperty('--hero-progress',heroProgress.toFixed(4));
    for(const bridge of bridges){const r=bridge.getBoundingClientRect();if(r.bottom<0||r.top>height)continue;const progress=motion.matches?.5:clamp((height*(compact.matches?.4:.22)-r.top)/(height*(compact.matches?.35:.38)));bridge.style.setProperty('--progress',(progress*progress*(3-2*progress)).toFixed(4));bridge.dataset.progress=progress.toFixed(4);const t=progress*progress*(3-2*progress);const colors={editorial:[[11,14,20],[230,224,212]],stadium:[[230,224,212],[12,23,17]],reconnect:[[12,23,17],[9,11,16]]};const pair=colors[bridge.dataset.transition];const rgb=pair[0].map((v,i)=>Math.round(v+(pair[1][i]-v)*t));bridge.style.backgroundColor='rgb('+rgb.join(',')+')';const light=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722>140;bridge.style.color=light?'#24231f':'#eeeef0';const nav=document.querySelector('.world-nav');const n=nav?.getBoundingClientRect();if(n&&r.top<=n.top+n.height/2&&r.bottom>=n.top+n.height/2)document.body.dataset.navLight=String(light);}
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  motion.addEventListener('change',schedule);compact.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  document.fonts?.ready.then(schedule);addEventListener('pageshow',schedule);schedule();
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!motion.matches)entry.target.classList.add('reveal');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.project-copy,.gallery-item,.athlete-profile,.contact-path').forEach(e=>observer.observe(e));addEventListener('pagehide',e=>{if(!e.persisted)observer.disconnect();});}
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
})();
