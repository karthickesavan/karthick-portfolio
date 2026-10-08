import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const canvas=document.querySelector('#avatarCanvas'), stage=document.querySelector('.stage');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(28,1,.1,100);
camera.position.set(0,1.0,4.25);

scene.add(new THREE.HemisphereLight(0xbfd9ff,0x151014,2.1));
const key=new THREE.DirectionalLight(0xffc29d,4); key.position.set(2.5,4,4); scene.add(key);
const rim=new THREE.PointLight(0x8c73ff,18,8); rim.position.set(-2,2.5,-1); scene.add(rim);
const cyan=new THREE.PointLight(0x40dce8,12,7); cyan.position.set(2,1.4,1); scene.add(cyan);

const root=new THREE.Group(); root.position.set(0,-.93,0); scene.add(root);
let avatar=null,mixer=null,clock=new THREE.Clock(),targetX=0,targetY=0,currentX=0,currentY=0;

function resize(){
 const r=stage.getBoundingClientRect(); renderer.setSize(r.width,r.height,false);
 camera.aspect=r.width/r.height; camera.updateProjectionMatrix();
}
window.addEventListener('resize',resize); resize();

const loader=new GLTFLoader();
loader.load('./assets/model.glb',(gltf)=>{
 avatar=gltf.scene;
 avatar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false}});
 avatar.scale.setScalar(1.0);
 root.add(avatar);
 if(gltf.animations?.length){
   mixer=new THREE.AnimationMixer(avatar);
   const idle=mixer.clipAction(gltf.animations[0]);
   idle.reset().setLoop(THREE.LoopRepeat,Infinity).fadeIn(.5).play();
 }
},undefined,(err)=>{
 console.error(err);
 document.querySelector('.stageTop').innerHTML='<span style="color:#ff7a45">●</span> AVATAR LOAD ERROR';
});

stage.addEventListener('pointermove',e=>{
 const r=stage.getBoundingClientRect();
 targetX=((e.clientX-r.left)/r.width-.5)*.22;
 targetY=((e.clientY-r.top)/r.height-.5)*.12;
});
stage.addEventListener('pointerleave',()=>{targetX=0;targetY=0});

function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05);
 if(mixer)mixer.update(dt);
 currentX+=(targetX-currentX)*.035; currentY+=(targetY-currentY)*.035;
 root.rotation.y=currentX;
 root.rotation.x=currentY;
 renderer.render(scene,camera);
}
animate();

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('show')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
