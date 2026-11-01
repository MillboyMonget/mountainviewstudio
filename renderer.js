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
tc.addEventListener('dragging-changed',e=>{oc.enabled=!e.value;if(!e.value)commit('Transform')});tc.addEventListener('objectChange',()=>{uv(sel);fill(true)});
const GEO={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(.5,.5,1,32),sphere:new T.SphereGeometry(.5,32,16)};
let sel=null,hist=[],hp=0;
function add(t,o={}){const op=o.o??1,m=new T.Mesh(GEO[t],new T.MeshStandardMaterial({color:o.c??0xcfcfcf,roughness:o.ro??.8,metalness:o.m??0,transparent:op<1,opacity:op}));
m.userData={type:t,name:o.n||t,tex:o.tx&&o.tx!=='none'?o.tx:'none',ts:o.ts||1};m.name=m.userData.name;m.position.fromArray(o.p||[0,.5,0]);m.rotation.set(...(o.r||[0,0,0]));m.scale.fromArray(o.s||[1,1,1]);m.castShadow=m.receiveShadow=true;applyTex(m);root.add(m);items.push(m);return m}
const dump=m=>({t:m.userData.type,n:m.userData.name,p:m.position.toArray(),r:[m.rotation.x,m.rotation.y,m.rotation.z],s:m.scale.toArray(),c:m.material.color.getHex(),o:m.material.opacity,m:m.material.metalness,ro:m.material.roughness,tx:m.userData.tex||'none',ts:m.userData.ts||1});
const ser=()=>JSON.stringify({v:2,items:items.map(dump)},(k,v)=>typeof v==='number'?+v.toFixed(4):v);
function clear(){items.forEach(m=>root.remove(m));items.length=0;select(null)}
function load(j){clear();JSON.parse(j).items.forEach(d=>add(d.t,d))}
function select(m){sel=m;m?tc.attach(m):tc.detach();fill()}
function commit(label='Edit'){items.forEach(uv);hist=hist.slice(0,hp+1);hist.push(ser());if(hist.length>100)hist.shift();hp=hist.length-1;try{localStorage.setItem('mvs',hist[hp])}catch(_){}verAdd(label,hist[hp]);fill()}
function jump(i){if(i<0||i>=hist.length)return;const k=items.indexOf(sel);hp=i;load(hist[hp]);select(items[k]||null)}
function fill(live){const f=$('insp');f.hidden=!sel;if(!live)list();if(!sel)return;
const v={px:sel.position.x,py:sel.position.y,pz:sel.position.z,sx:sel.scale.x,sy:sel.scale.y,sz:sel.scale.z,rx:sel.rotation.x/D,ry:sel.rotation.y/D,rz:sel.rotation.z/D};
f.querySelectorAll('[data-k]').forEach(i=>{const k=i.dataset.k;i.value=k==='n'?sel.userData.name:k==='c'?'#'+sel.material.color.getHexString():k==='o'?sel.material.opacity:k==='ro'?sel.material.roughness:k==='ts'?(sel.userData.ts||1):+v[k].toFixed(3)});document.querySelectorAll('#txg button').forEach(b=>b.classList.toggle('on',b.dataset.t===(sel.userData.tex||'none')))}
function list(){const l=$('partsL');l.innerHTML='';items.forEach(m=>{const d=document.createElement('div');d.textContent=m.userData.name;if(m===sel)d.className='on';d.onclick=()=>select(m);l.append(d)})}
$('insp').addEventListener('change',e=>{const k=e.target.dataset.k;if(!k||!sel)return;const v=e.target.value,n=parseFloat(v);
if(k==='n')sel.userData.name=sel.name=v;else if(k==='c')sel.material.color.set(v);else if(k==='o'){sel.material.opacity=n;sel.material.transparent=n<1}else if(k==='ro')sel.material.roughness=n;else if(k==='ts'){sel.userData.ts=Math.max(.05,n||1);uv(sel)}
else{const g=k[0],a=k[1];if(g==='p')sel.position[a]=n;else if(g==='s')sel.scale[a]=Math.max(.01,n);else sel.rotation[a]=n*D}commit('Edit '+k)});
// extend faces, duplicate, array
document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{if(!sel)return;const[a,g]=b.dataset.e.split(','),d=parseFloat($('ext').value)||1;sel.scale[a]=Math.max(.01,sel.scale[a]+d);sel['translate'+a.toUpperCase()](g*d/2);commit('Extend '+a.toUpperCase()+' by '+d+' m')});
function dup(){if(!sel)return;const d=dump(sel);select(add(d.t,{...d,n:d.n+' copy',p:[d.p[0]+.5,d.p[1],d.p[2]+.5]}));commit('Duplicate '+d.n)}
$('dup').onclick=dup;$('del').onclick=()=>{if(!sel)return;root.remove(sel);items.splice(items.indexOf(sel),1);select(null);commit('Delete')};
$('arr').onclick=()=>{if(!sel)return;const d=dump(sel),n=+$('an').value||1,o=[+$('ax').value,+$('ay').value,+$('az').value];let m;for(let i=1;i<=n;i++)m=add(d.t,{...d,n:d.n+' '+i,p:d.p.map((v,j)=>v+o[j]*i)});select(m);commit('Array x'+n)};
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{select(add(b.dataset.add,{p:[oc.target.x,.5,oc.target.z]}));commit('Add '+b.dataset.add)});
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>mode(b.dataset.m));
function mode(m){tc.setMode(m);document.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x.dataset.m===m))}
$('snap').onclick=()=>{const v=!$('snap').classList.contains('on');$('snap').classList.toggle('on',v);tc.setTranslationSnap(v?.1:null);tc.setRotationSnap(v?5*D:null);tc.setScaleSnap(v?.1:null)};
tc.setTranslationSnap(.1);tc.setRotationSnap(5*D);tc.setScaleSnap(.1);
$('undo').onclick=()=>jump(hp-1);$('redo').onclick=()=>jump(hp+1);

// textures
const TX={},rnd=Math.random;
function mkTex(n){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
const nz=(k,a)=>{for(let i=0;i<k;i++){g.fillStyle=rnd()<.5?'rgba(0,0,0,'+a+')':'rgba(255,255,255,'+a+')';g.fillRect(rnd()*256,rnd()*256,2,2)}};
const row=(h,w,cf)=>{for(let q=0;q<256/h;q++)for(let x=-w+(q%2)*w/2;x<256;x+=w){g.fillStyle=cf();g.fillRect(x+2,q*h+2,w-4,h-4)}};
if(n==='wood'){g.fillStyle='#3b2616';g.fillRect(0,0,256,256);for(let q=0;q<4;q++){g.fillStyle='hsl(28,'+(38+rnd()*10)+'%,'+(40+rnd()*10)+'%)';g.fillRect(0,q*64+2,256,60);g.strokeStyle='rgba(50,25,8,.28)';for(let j=0;j<14;j++){const y=q*64+4+rnd()*56;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(80,y+rnd()*6-3,170,y+rnd()*6-3,256,y);g.stroke()}}}
else if(n==='darkwood'){g.fillStyle='#120c08';g.fillRect(0,0,256,256);for(let q=0;q<8;q++){g.fillStyle=q%2?'#3d2c21':'#34251b';g.fillRect(0,q*32,256,28)}nz(800,.06)}
else if(n==='brick'){g.fillStyle='#cdc7bb';g.fillRect(0,0,256,256);row(32,64,()=>'hsl('+(8+rnd()*10)+',45%,'+(34+rnd()*12)+'%)')}
else if(n==='stone'){g.fillStyle='#6f675d';g.fillRect(0,0,256,256);let y=0;while(y<256){const h=24+rnd()*22;let x=-rnd()*40;while(x<256){const w=40+rnd()*60;g.fillStyle='hsl('+(28+rnd()*14)+','+(12+rnd()*10)+'%,'+(52+rnd()*26)+'%)';g.fillRect(x+1,y+1,w-2,h-2);x+=w}y+=h}}
else if(n==='concrete'){g.fillStyle='#b3b1ab';g.fillRect(0,0,256,256);nz(7000,.07);g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=2;g.strokeRect(0,0,256,256)}
else if(n==='plaster'){g.fillStyle='#eeebe3';g.fillRect(0,0,256,256);nz(5000,.045)}
else if(n==='tile'){g.fillStyle='#a9a49a';g.fillRect(0,0,256,256);for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.fillStyle='hsl(40,15%,'+(80+rnd()*5)+'%)';g.fillRect(i*64+3,j*64+3,58,58)}}
else if(n==='slate'){g.fillStyle='#2a2d31';g.fillRect(0,0,256,256);row(32,64,()=>'hsl(210,8%,'+(18+rnd()*10)+'%)')}
else{g.fillStyle='#8c9096';g.fillRect(0,0,256,256);for(let i=0;i<400;i++){g.strokeStyle=rnd()<.5?'rgba(255,255,255,.08)':'rgba(0,0,0,.08)';const y=rnd()*256;g.beginPath();g.moveTo(0,y);g.lineTo(256,y);g.stroke()}}
const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t}
const tex=n=>TX[n]||(TX[n]=mkTex(n));
function applyTex(m){const u=m.userData,n=u.tex,mat=m.material;if(!n||n==='none'){mat.map=null;mat.needsUpdate=true;if(u.geo){m.geometry=GEO[u.type];u.geo=0}return}
mat.map=u.type==='box'?tex(n):tex(n).clone();mat.map.needsUpdate=true;mat.needsUpdate=true;uv(m)}
function uv(m){const u=m.userData,n=u.tex;if(!n||n==='none')return;const ts=u.ts||1,s=m.scale;
if(u.type==='box'){if(!u.geo){m.geometry=GEO.box.clone();u.geo=1}const a=m.geometry.attributes.uv,b=GEO.box.attributes.uv,F=[[s.z,s.y],[s.z,s.y],[s.x,s.z],[s.x,s.z],[s.x,s.y],[s.x,s.y]];for(let i=0;i<24;i++){const f=F[i>>2];a.setXY(i,b.getX(i)*f[0]/ts,b.getY(i)*f[1]/ts)}a.needsUpdate=true}
else m.material.map.repeat.set(s.x/ts,s.y/ts)}
['none','wood','darkwood','brick','stone','concrete','plaster','tile','slate','metal'].forEach(n=>{const b=document.createElement('button');b.dataset.t=n;b.title=n;b.textContent=n==='none'?'∅':n;if(n!=='none')b.style.backgroundImage='url('+tex(n).image.toDataURL()+')';b.onclick=()=>{if(!sel)return;sel.userData.tex=n;if(n!=='none')sel.material.color.set(0xffffff);applyTex(sel);commit('Texture: '+n)};$('txg').append(b)});
// version history
let V=[];
function loadV(){try{V=JSON.parse(localStorage.getItem('mvs-v')||'[]')}catch(_){V=[]}}
function persistV(){let s=JSON.stringify(V);while(s.length>2.5e6){const i=V.findIndex(v=>!v.pin);if(i<0)break;V.splice(i,1);s=JSON.stringify(V)}try{localStorage.setItem('mvs-v',s)}catch(_){}}
function verAdd(n,d,pin){if(!pin&&V.length&&V[V.length-1].d===d)return;V.push({id:Date.now()+rnd(),t:Date.now(),n,d,pin:!!pin});persistV();histUI()}
function restore(v){const k=items.indexOf(sel);load(v.d);select(items[k]||null);commit('Restored: '+v.n)}
function histUI(){const l=$('histL');l.innerHTML='';const p=document.createElement('p');p.textContent=V.length+' versions. Click one to restore it; your later versions are kept.';p.style.cssText='margin:6px;color:#9aa0a8;font-size:11px';l.append(p);
[...V].reverse().forEach(v=>{const d=document.createElement('div'),x=document.createElement('span'),tm=document.createElement('span');d.textContent=(v.pin?'★ ':'')+v.n;x.className='x';x.textContent='✕';x.title='Delete version';tm.className='tm';tm.textContent=new Date(v.t).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});d.append(x,tm);
d.onclick=()=>restore(v);x.onclick=e=>{e.stopPropagation();V=V.filter(q=>q!==v);persistV();histUI()};l.append(d)})}
$('saveV').onclick=()=>{const n=prompt('Name this version:','Version '+(V.filter(v=>v.pin).length+1));if(n)verAdd(n,ser(),true)};
$('tabP').onclick=()=>{$('partsL').hidden=false;$('histL').hidden=true;$('tabP').classList.add('on');$('tabH').classList.remove('on')};
$('tabH').onclick=()=>{$('partsL').hidden=true;$('histL').hidden=false;$('tabH').classList.add('on');$('tabP').classList.remove('on')};
// project + export
const b64=b=>{const u=new Uint8Array(b);let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
const saveP=()=>api.save({name:'MountainView.mvstudio',ext:'mvstudio',data:JSON.stringify({...JSON.parse(ser()),versions:V})});
const openP=async()=>{const j=await api.open();if(j){load(j);try{const o=JSON.parse(j);if(o.versions){V=o.versions;persistV()}}catch(_){}commit('Opened file');histUI()}};
$('save').onclick=saveP;$('open').onclick=openP;
$('start').onclick=()=>{if(confirm('Replace the current scene with the Mountain View starter?')){starter();commit('Mountain View starter')}};
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
const F=(a,b,c,d,y,h,col,n,o,tx)=>add('box',{n,c:col,o,tx,p:[X((a+b)/2),y,Z((c+d)/2)],s:[(b-a)/S,h,(d-c)/S]});
const W=(a,b,c,d,col=0xf3f1ec,n='Wall',t=.2,h=3,tx)=>{const hz=b===d,l=(hz?Math.abs(c-a):Math.abs(d-b))/S;add('box',{n,c:col,tx,ts:tx==='stone'?3:1,p:[X((a+c)/2),h/2,Z((b+d)/2)],s:[hz?l+t:t,h,hz?t:l+t]})};
F(388,872,275,457,.06,.12,0xffffff,'Floor living',1,'wood');F(342,872,457,760,.06,.12,0xffffff,'Floor main',1,'wood');F(342,556,760,830,.06,.12,0xffffff,'Floor bedrooms',1,'wood');F(557,872,760,872,.05,.1,0xffffff,'Porch',1,'concrete');
[[388,275,466,275],[780,275,872,275],[342,457,556,457],[625,457,872,457],[556,457,556,530],[556,575,556,690],[556,735,556,830],[625,457,625,640],[625,680,625,760],[342,830,556,830],[625,760,872,760]].forEach(a=>W(...a));
[[388,275,388,457],[872,275,872,760],[342,457,342,830]].forEach(a=>W(...a,0xffffff,'Stone wall',.2,3,'stone'));
[[342,585,556,585],[342,638,556,638],[342,690,556,690],[465,585,465,690],[745,457,745,545],[625,545,872,545],[720,548,720,612],[720,612,872,612]].forEach(a=>W(...a,0xf3f1ec,'Partition',.12));
add('box',{n:'Entry wood tower',c:0xffffff,tx:'darkwood',p:[X(590),2.2,Z(762)],s:[2.3,4.4,.5]});
add('box',{n:'Glass sliders',c:0x9cc6dc,o:.35,p:[X(623),1.35,Z(275)],s:[314/S,2.7,.05]});
F(388,872,275,457,3.125,.25,0xf3f1ec,'Roof living');F(342,872,457,760,3.125,.25,0xf3f1ec,'Roof main');F(342,556,760,830,3.125,.25,0xf3f1ec,'Roof bedrooms');
F(383,872,95,130,.075,.15,0xffffff,'Deck back',1,'wood');F(383,872,245,275,.075,.15,0xffffff,'Deck front',1,'wood');F(383,455,130,245,.075,.15,0xffffff,'Deck left',1,'wood');F(797,872,130,245,.075,.15,0xffffff,'Deck right',1,'wood');
F(455,797,130,245,.04,.04,0x3aa6c9,'Pool water',.9)}
const a=localStorage.getItem('mvs');try{a?load(a):starter()}catch(_){starter()}hist=[ser()];hp=0;loadV();if(!V.length)verAdd('Initial scene',hist[0]);fill();histUI();
(function loop(){requestAnimationFrame(loop);oc.update();R.render(sc,cam)})();
