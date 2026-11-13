/* One quiet synthesized voice; complete envelopes and no autoplay. */
(() => {
  const button=document.getElementById('sound-toggle-btn');
  const label=document.getElementById('sound-status-text');
  let context,voice,envelope,enabled=false,busy=false,world='home',suspendTimer,nextTone=0;
  const palette={home:[220,330,.3],development:[440,330,.18],modeling:[330,392,.32],football:[165,247,.2],contact:[330,220,.34]};
  function hush(){nextTone=0;if(!context)return;const now=context.currentTime;envelope.gain.cancelScheduledValues(now);envelope.gain.setTargetAtTime(0,now,.015);}
  function play(kind='click'){
    if(!enabled||!context||context.state!=='running'||document.hidden)return;
    const [start,end,duration]=palette[world]||palette.home,now=context.currentTime;
    if(now<nextTone)return;nextTone=now+duration+.18;
    // Ignore rapid repeats until the release finishes; no queued sound backlog.
    envelope.gain.cancelScheduledValues(now);envelope.gain.setTargetAtTime(0,now,.008);
    voice.frequency.cancelScheduledValues(now);voice.frequency.setTargetAtTime(start,now,.012);voice.frequency.exponentialRampToValueAtTime(end,now+duration);
    envelope.gain.setTargetAtTime(kind==='world'?.012:.018,now+.025,.015);envelope.gain.setTargetAtTime(0,now+duration,.03);envelope.gain.setValueAtTime(0,now+duration+.17);
  }
  button.addEventListener('click',async()=>{
    if(busy)return;busy=true;clearTimeout(suspendTimer);
    try{
      if(!enabled){
        if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw new Error('No audio support');context=new Audio();voice=context.createOscillator();envelope=context.createGain();voice.type='sine';envelope.gain.value=0;voice.connect(envelope);envelope.connect(context.destination);voice.start();}
        await context.resume();enabled=true;play('intro');
      }else{enabled=false;hush();suspendTimer=setTimeout(()=>{if(!enabled)context.suspend().catch(()=>{});},150);}
      button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Disable sound':'Enable sound');label.textContent=enabled?'Sound on':'Sound off';
      
    }catch{enabled=false;hush();button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Enable sound');label.textContent='Sound unavailable';}
    finally{busy=false;}
  });
  document.addEventListener('portfolio:world',e=>{world=e.detail.world;button.dataset.soundWorld=world;play('world');});
  document.addEventListener('click',e=>{if(e.target.closest('a,button')&&!e.target.closest('#sound-toggle-btn'))play();});
  function resume(){if(!enabled||document.hidden)return;context?.resume().catch(()=>{enabled=false;button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Enable sound');label.textContent='Sound unavailable';});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();context?.suspend().catch(()=>{});}else resume();});
  addEventListener('pagehide',e=>{clearTimeout(suspendTimer);hush();if(e.persisted)context?.suspend().catch(()=>{});else context?.close().catch(()=>{});});
  addEventListener('pageshow',resume);
  window.portfolioSound={play};
})();
