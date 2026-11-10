/* One synthesized voice with a replaceable envelope; never layers effects or autoplays. */
(() => {
  const button=document.getElementById('sound-toggle-btn');
  const label=document.getElementById('sound-status-text');
  let context,voice,envelope,enabled=false,busy=false,world='home',suspendTimer;
  const palette={home:[220,330,.3],development:[520,260,.09],modeling:[392,440,.22],football:[160,90,.16],contact:[262,392,.28]};
  function hush(){if(!context)return;const now=context.currentTime;envelope.gain.cancelScheduledValues(now);envelope.gain.setTargetAtTime(0,now,.015);}
  function play(kind='click'){
    if(!enabled||!context||context.state!=='running'||document.hidden)return;
    const [start,end,duration]=palette[world]||palette.home,now=context.currentTime;
    // A single oscillator cannot overlap itself. New gestures replace its current envelope.
    envelope.gain.cancelScheduledValues(now);envelope.gain.setTargetAtTime(0,now,.008);
    voice.frequency.cancelScheduledValues(now);voice.frequency.setTargetAtTime(start,now,.012);voice.frequency.exponentialRampToValueAtTime(end,now+duration);
    envelope.gain.setTargetAtTime(kind==='world'?.012:.018,now+.025,.015);envelope.gain.setTargetAtTime(0,now+duration,.03);
  }
  button.addEventListener('click',async()=>{
    if(busy)return;busy=true;clearTimeout(suspendTimer);
    try{
      if(!enabled){
        if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('No audio support');context=new Audio();voice=context.createOscillator();envelope=context.createGain();voice.type='sine';envelope.gain.value=0;voice.connect(envelope);envelope.connect(context.destination);voice.start();}
        await context.resume();enabled=true;play('intro');
      }else{enabled=false;hush();suspendTimer=setTimeout(()=>{if(!enabled)context.suspend().catch(()=>{});},150);}
      button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Disable sound':'Enable sound');label.textContent=enabled?'Sound on':'Sound off';
      try{localStorage.setItem('portfolio-v5-sound',String(enabled));}catch{}
    }catch{enabled=false;hush();button.setAttribute('aria-pressed','false');label.textContent='Sound unavailable';}
    finally{busy=false;}
  });
  document.addEventListener('portfolio:world',e=>{world=e.detail.world;button.dataset.soundWorld=world;play('world');});
  document.addEventListener('click',e=>{if(e.target.closest('a,button')&&!e.target.closest('#sound-toggle-btn'))play();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();context?.suspend().catch(()=>{});}else if(enabled)context?.resume().catch(()=>{});});
  addEventListener('pagehide',e=>{clearTimeout(suspendTimer);hush();if(e.persisted)context?.suspend();else context?.close();});
  addEventListener('pageshow',()=>{if(enabled)context?.resume().catch(()=>{});});
  window.portfolioSound={play};
})();
