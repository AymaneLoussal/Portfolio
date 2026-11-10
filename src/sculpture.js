/* Three.js r128. The CSS sculpture remains available until a frame renders. */
(() => {
  const host = document.getElementById('threejs-container');
  if (!host || !window.THREE) return;
  let renderer, scene, environment, observer, resizeObserver, frame = 0, disposed = false, contextLost=false;
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
    const champagne=new THREE.MeshStandardMaterial({color:0xb7aa8e,metalness:.9,roughness:.25,envMapIntensity:1.5});
    const frameGeometry=()=>{
      const outer=new THREE.Shape();outer.moveTo(-2.4,-2.4);outer.lineTo(2.4,-2.4);outer.lineTo(2.4,2.4);outer.lineTo(-2.4,2.4);outer.closePath();
      const hole=new THREE.Path();hole.moveTo(-2,-2);hole.lineTo(-2,2);hole.lineTo(2,2);hole.lineTo(2,-2);hole.closePath();outer.holes.push(hole);
      const geometry=new THREE.ExtrudeGeometry(outer,{depth:.18,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.1,bevelThickness:.1});geometry.center();return geometry;
    };
    const sharedFrame=frameGeometry();
    const rings=[silver,blue,champagne].map((material,i)=>{
      const ring=new THREE.Mesh(sharedFrame,material);
      ring.scale.setScalar(1-i*.14);
      sculpture.add(ring);return ring;
    });
    let visible=true, time=0, last=0, x=0,y=0,tx=0,ty=0,scroll=0,dragging=false,dragX=0,dragY=0,rotationX=0,rotationY=0;
    const render=()=>{
      rings[0].rotation.set(.55+Math.sin(time*.15)*.1,.4+time*.05,.5);
      rings[1].rotation.set(1.5,-.8+time*.04,-.4);
      rings[2].rotation.set(-.4+time*.04,1.1,.65);
      const progress=motion.matches?0:scroll;
      rings.forEach((ring,i)=>{ring.position.x=(i-1)*progress*2;ring.position.y=(i-1)*progress*.6;});
      camera.position.z=15+progress*2;
      sculpture.rotation.set(y*.25+rotationY, x*.3+progress*.5+rotationX, -.22);
      sculpture.position.y=motion.matches?0:Math.sin(time*.55)*.12;
      renderer.render(scene,camera);
      host.classList.add('webgl-ready');
    };
    function tick(now){
      frame=0;
      if(disposed || contextLost || !visible || document.hidden || motion.matches)return;
      time+=Math.min((now-(last||now))/1000,.05);last=now;
      x+=(tx-x)*.045;y+=(ty-y)*.045;
      render();frame=requestAnimationFrame(tick);
    }
    function sync(){
      cancelAnimationFrame(frame);frame=0;last=0;
      if(disposed||contextLost)return;
      if(motion.matches){x=y=0;render();}
      else if(visible&&!document.hidden)frame=requestAnimationFrame(tick);
    }
    function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h||contextLost)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);render();}
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
    observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(host);
    host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5;if(dragging&&!motion.matches){rotationX+=(e.clientX-dragX)*.008;rotationY+=(e.clientY-dragY)*.008;dragX=e.clientX;dragY=e.clientY;}},{passive:true,signal:events.signal});
    host.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||motion.matches)return;dragging=true;dragX=e.clientX;dragY=e.clientY;host.setPointerCapture(e.pointerId);},{signal:events.signal});
    ['pointerup','pointercancel','lostpointercapture'].forEach(name=>host.addEventListener(name,()=>dragging=false,{signal:events.signal}));
    host.addEventListener('pointerleave',()=>{tx=ty=0;},{signal:events.signal});
    window.addEventListener('scroll',()=>{scroll=Math.min(scrollY/innerHeight,1);},{passive:true,signal:events.signal});
    document.addEventListener('visibilitychange',sync,{signal:events.signal});
    motion.addEventListener('change',sync,{signal:events.signal});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;host.classList.remove('webgl-ready');cancelAnimationFrame(frame);frame=0;},{signal:events.signal});
    renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;resize();sync();},{signal:events.signal});
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
