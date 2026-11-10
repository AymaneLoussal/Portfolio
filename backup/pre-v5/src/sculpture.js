/* Three.js r128. The CSS sculpture remains available until a frame renders. */
(() => {
  const host = document.getElementById('threejs-container');
  if (!host || !window.THREE) return;
  let renderer, scene, environment, observer, resizeObserver, frame = 0, disposed = false;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  try {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({alpha:true, antialias:true, powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.4 : 1.75));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    host.append(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden','true');
    const camera = new THREE.PerspectiveCamera(36,1,.1,100);
    camera.position.set(0,0,15);
    // Small procedural studio light map; no HDR download or post-processing chain.
    const studio = document.createElement('canvas'); studio.width=512;studio.height=256;
    const ctx=studio.getContext('2d');
    ctx.fillStyle='#10141c';ctx.fillRect(0,0,512,256);
    const light=ctx.createLinearGradient(0,0,512,256);
    light.addColorStop(0,'#d7e5ff');light.addColorStop(.2,'#161e2c');light.addColorStop(.4,'#ffffff');light.addColorStop(.52,'#152239');light.addColorStop(.72,'#668dcc');light.addColorStop(.82,'#f7f5ee');light.addColorStop(1,'#121826');
    ctx.fillStyle=light;ctx.fillRect(0,45,512,150);
    environment=new THREE.CanvasTexture(studio);environment.mapping=THREE.EquirectangularReflectionMapping;
    environment.encoding=THREE.sRGBEncoding;scene.environment=environment;
    scene.add(new THREE.HemisphereLight(0xd7e6ff,0x111725,1.1));
    const key=new THREE.DirectionalLight(0xffffff,2.5);key.position.set(-3,5,6);scene.add(key);
    const rim=new THREE.PointLight(0x528cff,3,30);rim.position.set(4,-1,4);scene.add(rim);
    const sculpture=new THREE.Group();scene.add(sculpture);
    const silver=new THREE.MeshStandardMaterial({color:0xc7cbd3,metalness:.95,roughness:.2,envMapIntensity:1.7});
    const blue=new THREE.MeshStandardMaterial({color:0x477bc2,metalness:.85,roughness:.24,envMapIntensity:1.6});
    const rings=[3.5,2.65,1.85].map((radius,i)=>{
      const ring=new THREE.Mesh(new THREE.TorusGeometry(radius,i===0?.22:.17,16,80),i===2?blue:silver);
      sculpture.add(ring);return ring;
    });
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.83,0),silver);sculpture.add(core);
    const orbit=new THREE.Mesh(new THREE.SphereGeometry(.18,12,12),blue);orbit.position.set(3.5,0,0);rings[0].add(orbit);
    let visible=true, time=0, last=0, x=0,y=0,tx=0,ty=0,scroll=0;
    const render=()=>{
      rings[0].rotation.set(.8+time*.12,.25+time*.08,.4);
      rings[1].rotation.set(1.7,-.65+time*.1,-.5+time*.09);
      rings[2].rotation.set(.3+time*.15,.8,-.4-time*.1);
      core.rotation.set(time*.15+.3,time*.2,.2);
      sculpture.rotation.set(y*.25, x*.3+scroll*.25, -.22);
      sculpture.position.y=motion.matches?0:Math.sin(time*.55)*.12;
      renderer.render(scene,camera);
      host.classList.add('webgl-ready');
    };
    function tick(now){
      frame=0;
      if(disposed || !visible || document.hidden || motion.matches)return;
      time+=Math.min((now-(last||now))/1000,.05);last=now;
      x+=(tx-x)*.045;y+=(ty-y)*.045;
      render();frame=requestAnimationFrame(tick);
    }
    function sync(){
      cancelAnimationFrame(frame);frame=0;last=0;
      if(disposed)return;
      if(motion.matches){x=y=0;render();}
      else if(visible&&!document.hidden)frame=requestAnimationFrame(tick);
    }
    function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);render();}
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(host);
    host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;},{passive:true,signal:events.signal});
    host.addEventListener('pointerleave',()=>{tx=ty=0;},{signal:events.signal});
    window.addEventListener('scroll',()=>{scroll=Math.min(scrollY/innerHeight,1);},{passive:true,signal:events.signal});
    document.addEventListener('visibilitychange',sync,{signal:events.signal});
    motion.addEventListener('change',sync,{signal:events.signal});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();host.classList.remove('webgl-ready');cancelAnimationFrame(frame);frame=0;visible=false;},{signal:events.signal});
    renderer.domElement.addEventListener('webglcontextrestored',()=>{visible=true;resize();sync();},{signal:events.signal});
    window.addEventListener('pagehide',e=>{if(e.persisted){cancelAnimationFrame(frame);frame=0;}else dispose();},{signal:events.signal});
    window.addEventListener('pageshow',sync,{signal:events.signal});
    sync();
  }catch(error){dispose();console.warn('Sculpture fallback active:',error.message);}
  function dispose(){
    if(disposed)return;disposed=true;cancelAnimationFrame(frame);observer?.disconnect();resizeObserver?.disconnect();events.abort();
    const geometries=new Set(),materials=new Set();scene?.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());environment?.dispose();renderer?.dispose();renderer?.domElement.remove();host.classList.remove('webgl-ready');
  }
})();
