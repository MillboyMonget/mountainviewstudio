import*as T from 'three';
import{OrbitControls}from 'three/addons/controls/OrbitControls.js';
import{TransformControls}from 'three/addons/controls/TransformControls.js';
import{GLTFExporter}from 'three/addons/exporters/GLTFExporter.js';
import{OBJExporter}from 'three/addons/exporters/OBJExporter.js';
import{STLExporter}from 'three/addons/exporters/STLExporter.js';
import{USDZExporter}from 'three/addons/exporters/USDZExporter.js';
const api={save:o=>{const b=o.b64?Uint8Array.from(atob(o.data),c=>c.charCodeAt(0)):o.data,a=document.createElement('a');a.href=URL.createObjectURL(new Blob([b]));a.download=o.name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)},open:()=>new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='.mvstudio,.json';i.onchange=()=>i.files[0]?i.files[0].text().then(res):res(null);i.click()})};
const $=id=>document.getElementById(id),S=30,X=p=>(p-607)/S,Z=p=>(p-552)/S,D=Math.PI/180;
const cvs=$('cv'),R=new T.WebGLRenderer({antialias:true});R.shadowMap.enabled=true;R.setPixelRatio(devicePixelRatio);cvs.append(R.domElement);
const sc=new T.Scene();sc.background=new T.Color(0x23262b);
const cam=new T.PerspectiveCamera(45,1,.1,1000);cam.position.set(24,16,30);
const oc=new OrbitControls(cam,R.domElement);oc.target.set(0,1,-2);oc.enableDamping=true;
sc.add(new T.HemisphereLight(0xdfeaff,0x666055,.8));
const sun=new T.DirectionalLight(0xfff1d6,1.2);sun.position.set(-20,32,24);sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-35,right:35,top:35,bottom:-35,far:150});sun.shadow.mapSize.set(2048,2048);sc.add(sun);
const gnd=new T.Mesh(new T.PlaneGeometry(300,300),new T.MeshStandardMaterial({color:0x3a3f45}));gnd.rotation.x=-Math.PI/2;gnd.receiveShadow=true;sc.add(gnd);
const grid=new T.GridHelper(60,60,0x5a6068,0x3f444b);grid.position.y=.01;sc.add(grid);
const root=new T.Group();sc.add(root);const items=[];
const tc=new TransformControls(cam,R.domElement);sc.add(tc);
tc.addEventListener('dragging-changed',e=>{oc.enabled=!e.value;if(!e.value)commit()});tc.addEventListener('objectChange',()=>fill(true));
const GEO={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(.5,.5,1,32),sphere:new T.SphereGeometry(.5,32,16)};
let sel=null,hist=[],hp=0;
function add(t,o={}){const op=o.o??1,m=new T.Mesh(GEO[t],new T.MeshStandardMaterial({color:o.c??0xcfcfcf,roughness:o.ro??.8,metalness:o.m??0,transparent:op<1,opacity:op}));
m.userData={type:t,name:o.n||t};m.name=m.userData.name;m.position.fromArray(o.p||[0,.5,0]);m.rotation.set(...(o.r||[0,0,0]));m.scale.fromArray(o.s||[1,1,1]);m.castShadow=m.receiveShadow=true;root.add(m);items.push(m);return m}
const dump=m=>({t:m.userData.type,n:m.userData.name,p:m.position.toArray(),r:[m.rotation.x,m.rotation.y,m.rotation.z],s:m.scale.toArray(),c:m.material.color.getHex(),o:m.material.opacity,m:m.material.metalness,ro:m.material.roughness});
const ser=()=>JSON.stringify({v:1,items:items.map(dump)});
function clear(){items.forEach(m=>root.remove(m));items.length=0;select(null)}
function load(j){clear();JSON.parse(j).items.forEach(d=>add(d.t,d))}
function select(m){sel=m;m?tc.attach(m):tc.detach();fill()}
function commit(){hist=hist.slice(0,hp+1);hist.push(ser());if(hist.length>100)hist.shift();hp=hist.length-1;try{localStorage.setItem('mvs',hist[hp])}catch(_){}fill()}
function jump(i){if(i<0||i>=hist.length)return;const k=items.indexOf(sel);hp=i;load(hist[hp]);select(items[k]||null)}
function fill(live){const f=$('insp');f.hidden=!sel;if(!live)list();if(!sel)return;
const v={px:sel.position.x,py:sel.position.y,pz:sel.position.z,sx:sel.scale.x,sy:sel.scale.y,sz:sel.scale.z,rx:sel.rotation.x/D,ry:sel.rotation.y/D,rz:sel.rotation.z/D};
f.querySelectorAll('[data-k]').forEach(i=>{const k=i.dataset.k;i.value=k==='n'?sel.userData.name:k==='c'?'#'+sel.material.color.getHexString():k==='o'?sel.material.opacity:k==='ro'?sel.material.roughness:+v[k].toFixed(3)})}
function list(){const l=$('list');l.innerHTML='';items.forEach(m=>{const d=document.createElement('div');d.textContent=m.userData.name;if(m===sel)d.className='on';d.onclick=()=>select(m);l.append(d)})}
$('insp').addEventListener('change',e=>{const k=e.target.dataset.k;if(!k||!sel)return;const v=e.target.value,n=parseFloat(v);
if(k==='n')sel.userData.name=sel.name=v;else if(k==='c')sel.material.color.set(v);else if(k==='o'){sel.material.opacity=n;sel.material.transparent=n<1}else if(k==='ro')sel.material.roughness=n;
else{const g=k[0],a=k[1];if(g==='p')sel.position[a]=n;else if(g==='s')sel.scale[a]=Math.max(.01,n);else sel.rotation[a]=n*D}commit()});
// extend faces, duplicate, array
document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{if(!sel)return;const[a,g]=b.dataset.e.split(','),d=parseFloat($('ext').value)||1;sel.scale[a]=Math.max(.01,sel.scale[a]+d);sel['translate'+a.toUpperCase()](g*d/2);commit()});
function dup(){if(!sel)return;const d=dump(sel);select(add(d.t,{...d,n:d.n+' copy',p:[d.p[0]+.5,d.p[1],d.p[2]+.5]}));commit()}
$('dup').onclick=dup;$('del').onclick=()=>{if(!sel)return;root.remove(sel);items.splice(items.indexOf(sel),1);select(null);commit()};
$('arr').onclick=()=>{if(!sel)return;const d=dump(sel),n=+$('an').value||1,o=[+$('ax').value,+$('ay').value,+$('az').value];let m;for(let i=1;i<=n;i++)m=add(d.t,{...d,n:d.n+' '+i,p:d.p.map((v,j)=>v+o[j]*i)});select(m);commit()};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{select(add(b.dataset.add,{p:[oc.target.x,.5,oc.target.z]}));commit()});
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>mode(b.dataset.m));
function mode(m){tc.setMode(m);document.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x.dataset.m===m))}
$('snap').onclick=()=>{const v=!$('snap').classList.contains('on');$('snap').classList.toggle('on',v);tc.setTranslationSnap(v?.1:null);tc.setRotationSnap(v?5*D:null);tc.setScaleSnap(v?.1:null)};
tc.setTranslationSnap(.1);tc.setRotationSnap(5*D);tc.setScaleSnap(.1);
$('undo').onclick=()=>jump(hp-1);$('redo').onclick=()=>jump(hp+1);
// project + export
const b64=b=>{const u=new Uint8Array(b);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
const saveP=()=>api.save({name:'MountainView.mvstudio',ext:'mvstudio',data:ser()});
const openP=async()=>{const j=await api.open();if(j){load(j);commit()}};
$('save').onclick=saveP;$('open').onclick=openP;
$('start').onclick=()=>{if(confirm('Replace the current scene with the Mountain View starter?')){starter();commit()}};
$('exp').onchange=async e=>{const f=e.target.value;e.target.value='';if(!f)return;const nm='MountainView.'+f;select(null);try{
if(f==='glb')new GLTFExporter().parse(root,r=>api.save({name:nm,ext:f,data:b64(r),b64:1}),err=>alert(err),{binary:true});
else if(f==='obj')api.save({name:nm,ext:f,data:new OBJExporter().parse(root)});
else if(f==='stl')api.save({name:nm,ext:f,data:new STLExporter().parse(root)});
else api.save({name:nm,ext:f,data:b64(await new USDZExporter().parse(root)),b64:1})}catch(err){alert('Export failed: '+err.message)}};
// shortcuts + picking
addEventListener('keydown',e=>{const t=e.target.tagName;if(t==='INPUT'&&!(e.metaKey||e.ctrlKey))return;const k=e.key.toLowerCase();
if(e.metaKey||e.ctrlKey){if(k==='z'){e.preventDefault();jump(e.shiftKey?hp+1:hp-1)}else if(k==='d'){e.preventDefault();dup()}else if(k==='s'){e.preventDefault();saveP()}else if(k==='o'){e.preventDefault();openP()}return}
if(t==='INPUT')return;if(k==='g')mode('translate');else if(k==='r')mode('rotate');else if(k==='s')mode('scale');else if(k==='delete'||k==='backspace')$('del').click()});
let dn=null;const rc=new T.Raycaster(),mv=new T.Vector2();
R.domElement.addEventListener('pointerdown',e=>dn=[e.clientX,e.clientY]);
R.domElement.addEventListener('pointerup',e=>{if(!dn||tc.axis||Math.hypot(e.clientX-dn[0],e.clientY-dn[1])>4)return;const r=R.domElement.getBoundingClientRect();mv.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);rc.setFromCamera(mv,cam);const h=rc.intersectObjects(items)[0];select(h?h.object:null)});
new ResizeObserver(()=>{const w=cvs.clientWidth,h=cvs.clientHeight;R.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()}).observe(cvs);
// starter: Mountain View massing (meters, from the floor plan)
function starter(){clear();
const F=(a,b,c,d,y,h,col,n,o)=>add('box',{n,c:col,o,p:[X((a+b)/2),y,Z((c+d)/2)],s:[(b-a)/S,h,(d-c)/S]});
const W=(a,b,c,d,col=0xf3f1ec,n='Wall',t=.2,h=3)=>{const hz=b===d,l=(hz?Math.abs(c-a):Math.abs(d-b))/S;add('box',{n,c:col,p:[X((a+c)/2),h/2,Z((b+d)/2)],s:[hz?l+t:t,h,hz?t:l+t]})};
F(388,872,275,457,.06,.12,0xcfc6b6,'Floor living');F(342,872,457,760,.06,.12,0xcfc6b6,'Floor main');F(342,556,760,830,.06,.12,0xcfc6b6,'Floor bedrooms');F(557,872,760,872,.05,.1,0xbdbab3,'Porch');
[[388,275,466,275],[780,275,872,275],[342,457,556,457],[625,457,872,457],[556,457,556,530],[556,575,556,690],[556,735,556,830],[625,457,625,640],[625,680,625,760],[342,830,556,830],[625,760,872,760]].forEach(a=>W(...a));
[[388,275,388,457],[872,275,872,760],[342,457,342,830]].forEach(a=>W(...a,0x9a8f7c,'Stone wall'));
[[342,585,556,585],[342,638,556,638],[342,690,556,690],[465,585,465,690],[745,457,745,545],[625,545,872,545],[720,548,720,612],[720,612,872,612]].forEach(a=>W(...a,0xf3f1ec,'Partition',.12));
add('box',{n:'Entry wood tower',c:0x3a2a20,p:[X(590),2.2,Z(762)],s:[2.3,4.4,.5]});
add('box',{n:'Glass sliders',c:0x9cc6dc,o:.35,p:[X(623),1.35,Z(275)],s:[314/S,2.7,.05]});
F(388,872,275,457,3.125,.25,0xf3f1ec,'Roof living');F(342,872,457,760,3.125,.25,0xf3f1ec,'Roof main');F(342,556,760,830,3.125,.25,0xf3f1ec,'Roof bedrooms');
F(383,872,95,130,.075,.15,0x7d5234,'Deck back');F(383,872,245,275,.075,.15,0x7d5234,'Deck front');F(383,455,130,245,.075,.15,0x7d5234,'Deck left');F(797,872,130,245,.075,.15,0x7d5234,'Deck right');
F(455,797,130,245,.04,.04,0x3aa6c9,'Pool water',.9)}
const a=localStorage.getItem('mvs');try{a?load(a):starter()}catch(_){starter()}hist=[ser()];hp=0;fill();
(function loop(){requestAnimationFrame(loop);oc.update();R.render(sc,cam)})();
