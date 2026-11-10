/* Event-driven native scroll choreography: no interception, scroll delays or pinning library. */
(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width:760px)');
  const sections=[...document.querySelectorAll('main section[data-world]')];
  const bridges=[...document.querySelectorAll('[data-transition]')];
  const links=[...document.querySelectorAll('.desktop-nav a,.world-nav a')];
  const hero=document.querySelector('.hero');
  let frame=0,world='';
  const clamp=n=>Math.max(0,Math.min(1,n));
  function update(){
    frame=0;
    const height=innerHeight;
    let current='home';
    // Last world whose top has passed the reading line. Stable through intervening bridges.
    for(const section of sections){if(section.getBoundingClientRect().top<height*.45)current=section.dataset.world;}
    if(current!==world){world=current;document.body.dataset.world=world;links.forEach(a=>{if(a.hash==='#'+world)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});document.dispatchEvent(new CustomEvent('portfolio:world',{detail:{world}}));}
    const heroProgress=motion.matches?0:clamp(-hero.getBoundingClientRect().top/height);
    hero.style.setProperty('--hero-progress',heroProgress.toFixed(4));
    for(const bridge of bridges){const r=bridge.getBoundingClientRect();if(r.bottom<0||r.top>height)continue;const progress=motion.matches?.5:clamp((height-r.top)/(height+r.height));bridge.style.setProperty('--progress',progress.toFixed(4));bridge.dataset.progress=progress.toFixed(4);}
  }
  function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
  motion.addEventListener('change',schedule);compact.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();});
  document.fonts?.ready.then(schedule);addEventListener('pageshow',schedule);schedule();
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(!motion.matches)entry.target.classList.add('reveal');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.project-copy,.gallery-item,.athlete-profile,.contact-path').forEach(e=>observer.observe(e));addEventListener('pagehide',e=>{if(!e.persisted)observer.disconnect();});}
  addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
})();
