/* Dependency-free 3D scene: perspective projection of box meshes, depth-sorted
   faces, animated camera and station-linked signals. All geometry is procedural. */
window.createFactory = function (canvas, status) {
  const ctx = canvas.getContext('2d');
  if (!ctx) { status('Static scene mode: canvas unavailable.'); return { setScene() {}, setActive() {}, resize() {} }; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const staticMode = new URLSearchParams(location.search).has('static');
  // One illustrative assembly line. World units are metres: each station is
  // a contiguous 6 m interval, not a machine or a proxy for a production line.
  const stationLength = 6, stationCount = 8, halfLine = stationLength * stationCount / 2;
  const stations = Array.from({ length: stationCount }, (_, i) => ({
    x: -halfLine + (i + .5) * stationLength, z: 0
  }));
  const white = '#FFFFFF', blue = '#066FEF';
  let width = 1, height = 1, mode = 'signals', start = performance.now(), raf = 0, selected = 3, active = false;
  const epoch = start;
  let camera = { yaw: .56, pitch: .64, zoom: 1 }, target = { ...camera }, last = start;
  const profiles = {
    signals: { yaw: .56, pitch: .64, zoom: .9 },
    mapping: { yaw: .5, pitch: .73, zoom: .98 },
    heatmap: { yaw: .46, pitch: .86, zoom: 1.03 },
    copilot: { yaw: .57, pitch: .68, zoom: 1.03 },
    hybrid: { yaw: .52, pitch: .74, zoom: .96 },
    coverage: { yaw: .56, pitch: .7, zoom: .86 },
    closing: { yaw: .56, pitch: .64, zoom: .92 }
  };
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (active && (staticMode || reduced.matches)) restart();
  }
  function project(x, y, z) {
    const c = Math.cos(camera.yaw), s = Math.sin(camera.yaw);
    const rx = x * c - z * s, rz = x * s + z * c;
    const cp = Math.cos(camera.pitch), sp = Math.sin(camera.pitch);
    // Camera is above the floor looking down. Positive height projects upward;
    // floor farther from the camera projects upward and has greater depth.
    const py = y * cp + rz * sp, depth = 100 - y * sp + rz * cp;
    // Orthographic overview: all pickups keep the same scale, no hero vehicle.
    const scale = Math.min(width / 67, height / 38) * camera.zoom;
    return { x: width * (width < 900 ? .65 : .72) + rx * scale, y: height * .6 - py * scale, depth };
  }
  function line(points, color, size = 1) {
    ctx.beginPath(); points.forEach((p, i) => { const q = project(...p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
    ctx.strokeStyle = color; ctx.lineWidth = size; ctx.stroke();
  }
  function box(faces, x, y, z, w, h, d, active, material) {
    const vertices = [[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]].map(p => project(...p));
    [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]].forEach((ids, n) => {
      const p = ids.map(i => vertices[i]);
      faces.push({ p, depth: p.reduce((a,b) => a+b.depth,0)/4, fill: active ? 'rgba(6,111,239,.13)' : 'rgba(0,20,46,.68)', stroke: active ? 'rgba(255,255,255,.9)' : material ? 'rgba(6,111,239,.95)' : 'rgba(6,111,239,.55)' });
    });
  }
  function glow(x,y,z,r,alpha) {
    const p = project(x,y,z), g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
    g.addColorStop(0,`rgba(6,111,239,${alpha})`); g.addColorStop(1,'rgba(6,111,239,0)');
    ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2);
  }
  function label(text,x,y,z) {
    const p=project(x,y,z); ctx.font=`400 ${Math.max(13, Math.min(width/100,19))}px Arial, sans-serif`;
    const w=ctx.measureText(text).width; ctx.fillStyle='rgba(0,20,46,.94)'; ctx.fillRect(p.x-8,p.y-21,w+24,34);
    ctx.fillStyle=white;ctx.fillText(text,p.x,p.y+2);
  }
  function person(faces, x, z, active) {
    const clothes=['#00095B','#00095B','#00142E','#FFFFFF','#00095B','#00095B'];
    // 1.75 m person beside the vehicle: two legs, torso, arms and head.
    box(faces,x-.18,.05,z-.14,.14,.72,.25,false,clothes);
    box(faces,x+.06,.05,z-.14,.14,.72,.25,false,clothes);
    box(faces,x-.24,.77,z-.18,.48,.57,.36,active,clothes);
    box(faces,x-.34,.9,z-.14,.12,.43,.2,false,clothes);
    box(faces,x+.22,.95,z-.5,.12,.15,.45,false,clothes);
    box(faces,x-.15,1.37,z-.15,.3,.34,.3,false,['#F0F0F0','#F0F0F0','#FFFFFF','#FFFFFF','#F0F0F0','#F0F0F0']);
  }
  function equipment(faces,s,i,time) {
    // Gantries, tool carts and fixtures surround the line, never replace people.
    for(const z of [-3.3,3.3])box(faces,s.x-2.9,0,z,.12,3.8,.12,false);
    box(faces,s.x-2.9,3.8,-3.3,.12,.12,6.72,false);
    box(faces,s.x-2.8,3.55,-3.15,5.5,.1,.1,false);
    box(faces,s.x-1.3,.2,-4.8,1.6,.85,.8,false);
    box(faces,s.x-1.2,1.05,-4.65,1.4,.1,.55,false);
    for(let k=0;k<3;k++)box(faces,s.x-1.1+k*.45,.35,-4.85,.025,.5,.04,false);
    box(faces,s.x+1.1,.05,4.1,.8,1.1,.65,false);
    box(faces,s.x+1.15,1.15,4.15,.7,.06,.55,false);
    // Small articulated fixture with animated elbow in alternating workstations.
    if(i%2===0) {
      const z=-2.8, lift=Math.sin(time*1.2+i)*.16;
      box(faces,s.x+.4,0,z-.4,.65,.28,.65,false);
      box(faces,s.x+.58,.28,z-.22,.25,1.05,.25,false);
      line([[s.x+.7,1.3,z],[s.x+.15,2+lift,z+.15],[s.x-.45,1.6,z+.7]],blue,3);
      box(faces,s.x-.55,1.5,z+.65,.25,.25,.25,false);
    }
  }
  function pickup(faces,x) {
    const paint=['#F0F0F0','#F0F0F0','#00142E','#FFFFFF','#F0F0F0','#F0F0F0'];
    const glass=['#00142E','#00142E','#00142E','#00095B','#00142E','#00142E'];
    // 5.2 m pickup, nose toward +X: open bed behind cab, hood ahead.
    box(faces,x,.45,-1,5.2,.52,2,false,paint);
    box(faces,x+.08,.97,-.98,1.9,.26,.16,false,paint);
    box(faces,x+.08,.97,.82,1.9,.26,.16,false,paint);
    box(faces,x+.08,.97,-.98,.16,.26,1.96,false,paint);
    box(faces,x+.3,.98,-.76,1.45,.025,1.5,false,glass);
    box(faces,x+2,.97,-.91,1.65,.67,1.82,false,glass);
    box(faces,x+2,1.64,-.95,1.68,.1,1.9,false,paint);
    box(faces,x+3.7,.97,-.94,1.45,.14,1.88,false,paint);
    box(faces,x+5.12,.6,-.75,.08,.25,1.5,false,glass);
    for(const axle of [.8,4.15]) for(const z of [-1.14,1.14]) {
      // Wheel circles make the vehicles legible as pickups rather than blocks.
      const ring=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2;ring.push(project(x+axle+Math.cos(a)*.4,.52+Math.sin(a)*.4,z));}
      faces.push({p:ring,depth:ring.reduce((a,p)=>a+p.depth,0)/16,fill:'#00142E',stroke:blue});
    }
  }
  function draw(now) {
    if(!active || document.hidden)return;
    const dt=Math.min((now-last)/1000,.05);last=now;
    const quiet=staticMode || reduced.matches;
    const k=quiet ? 1 : 1-Math.exp(-dt*3);
    for(const key of ['yaw','pitch','zoom']) camera[key]+=(target[key]-camera[key])*k;
    const time=quiet ? 2 : (now-start)/1000;
    ctx.clearRect(0,0,width,height);
    const bg=ctx.createRadialGradient(width*.76,height*.56,0,width*.76,height*.56,width*.6);
    bg.addColorStop(0,'#00095B');bg.addColorStop(1,'#00142E');ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
    for(let x=-30;x<=30;x+=2) line([[x,-.25,-12],[x,-.25,12]],'rgba(6,111,239,.12)');
    for(let z=-12;z<=12;z+=2) line([[-30,-.25,z],[30,-.25,z]],'rgba(6,111,239,.12)');
    // Overhead utility rails run the full length of the production line.
    for(const z of [-3.3,3.3])for(const y of [3.85,4.2])line([[-halfLine,y,z],[halfLine,y,z]],'rgba(6,111,239,.55)',1);
    // Continuous conveyor and pedestrian working area, segmented every 6 m.
    line([[-halfLine,0,-1.35],[halfLine,0,-1.35]],blue,2);
    line([[-halfLine,0,1.35],[halfLine,0,1.35]],blue,2);
    line([[-halfLine,0,3.4],[halfLine,0,3.4]],'rgba(255,255,255,.3)',1);
    const faces=[];
    stations.forEach((s,i) => {
      const active = mode!=='signals' && i===selected;
      if(active) glow(s.x,.05,0,Math.min(width,height)*.09,.45);
      box(faces,s.x-3,-.13,-1.25,6,.12,2.5,active);
      line([[s.x-3,.02,-2.2],[s.x-3,.02,3.4]],'rgba(255,255,255,.45)',1);
      person(faces,s.x+.5,2.25,active);
      equipment(faces,s,i,time);
    });
    line([[halfLine,.02,-2.2],[halfLine,.02,3.4]],'rgba(255,255,255,.45)',1);
    // Same continuous vehicle train across slides; 6 m pitch, 5.2 m vehicles.
    const travel=quiet ? .3 : ((now-epoch)/1000*.85)%6;
    canvas.dataset.travel=travel.toFixed(3);
    canvas.dataset.frame=String(now);
    for(let i=-1;i<=stationCount;i++) {
      const x=-halfLine+i*6+travel;
      if(x>=-halfLine-6 && x+5.2<=halfLine+6) pickup(faces,x);
    }
    faces.sort((a,b)=>b.depth-a.depth).forEach(f=>{
      ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
      ctx.fillStyle=f.fill;ctx.fill();ctx.strokeStyle=f.stroke;ctx.lineWidth=.8;ctx.stroke();
    });
    if(mode==='signals' || mode==='mapping') {
      for(let i=0;i<64;i++) {
        const s=stations[i%stationCount], blend=mode==='mapping' ? Math.min(time/2,1) : 0;
        const x=s.x+(Math.sin(i*9.7+time*.3)*4)*(1-blend), z=s.z+Math.cos(i*3.1)*4*(1-blend), y=1+(i%5)*.85*(1-blend);
        const p=project(x,y,z);ctx.fillStyle=i%3 ? 'rgba(255,255,255,.6)' : blue;ctx.beginPath();ctx.arc(p.x,p.y,2.4,0,Math.PI*2);ctx.fill();
      }
    }
    if(['heatmap','copilot','hybrid','closing'].includes(mode)) {
      [selected].forEach((i,j)=>{
        const s=stations[i],p=project(s.x,.1,2), pulse=quiet ? .5 : (time*.4+j*.2)%1;
        ctx.strokeStyle=`rgba(255,255,255,${1-pulse})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(p.x,p.y,10+pulse*25,5+pulse*12,0,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle=white;ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fill();
      });
      const s=stations[selected];label(mode==='copilot' ? 'Station evidence → briefing' : mode==='hybrid' ? 'Score → investigate → explain' : 'Workstation / 6 m section',s.x-2,3.1,0);
    }
    const s=stations[selected];
    line([[s.x-3,.1,3.9],[s.x+3,.1,3.9]],white,1.5);
    for(const x of [s.x-3,s.x+3]) line([[x,.1,3.65],[x,.1,4.15]],white,1.5);
    label('6 m / Workstation',s.x-2,.1,4.8);
    label('Assembly line / Production flow →',9,4.7,-3.3);
    if(!quiet && active && !document.hidden) raf=requestAnimationFrame(draw);
  }
  function restart() { cancelAnimationFrame(raf);last=performance.now();if(active&&!document.hidden)draw(last); }
  function nearby(event) {
    let best=null, distance=45;
    stations.forEach((s,i)=>{const p=project(s.x,.1,2),d=Math.hypot(p.x-event.clientX,p.y-event.clientY);if(d<distance){best=i;distance=d;}});
    return best;
  }
  canvas.addEventListener('pointermove',event=>{canvas.style.cursor=nearby(event)===null?'default':'pointer';});
  canvas.addEventListener('click',event=>{const i=nearby(event);if(i!==null){selected=i;status('Illustrative workstation selected · Same location reference across products.');restart();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else restart();});
  reduced.addEventListener('change',restart);
  resize();restart();
  return { resize, setActive(value) { active=value;restart(); }, setScene(next) { mode=next;target=profiles[next] || profiles.signals;start=performance.now();restart(); } };
};
