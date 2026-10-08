import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const stage = document.getElementById('avatarStage');
const canvas = document.getElementById('avatarCanvas');

if (!stage || !canvas) throw new Error('Avatar stage not found');

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
camera.position.set(0, 2.7, 12.5);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const root = new THREE.Group();
scene.add(root);

// Cinematic lighting matching the existing portfolio.
scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x090b0f, 2.2));

const key = new THREE.DirectionalLight(0xffa36d, 4.2);
key.position.set(3, 6, 5);
scene.add(key);

const rim = new THREE.DirectionalLight(0x42d9ff, 4.0);
rim.position.set(-4, 4, -2);
scene.add(rim);

const fill = new THREE.PointLight(0xa77bff, 28, 12);
fill.position.set(3, 1, -3);
scene.add(fill);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.2, 64),
  new THREE.MeshBasicMaterial({
    color: 0xff8b4d,
    transparent: true,
    opacity: 0.055,
  })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.45;
root.add(floor);

let avatar = null;
let mixer = null;
let baseY = 0;
let baseScale = 1;
const clock = new THREE.Clock();

function resize() {
  const r = stage.getBoundingClientRect();
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height);

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener('resize', resize);
resize();

function fitModel(obj) {
  // Reset transforms first so repeated fitting remains predictable.
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.setScalar(1);
  obj.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Keep the supplied model large and centered in the existing hero card.
  const desiredHeight = 5.25;
  baseScale = desiredHeight / Math.max(size.y, 0.001);
  obj.scale.setScalar(baseScale);
  obj.updateMatrixWorld(true);

  const scaledBox = new THREE.Box3().setFromObject(obj);
  const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

  obj.position.x -= scaledCenter.x;
  obj.position.z -= scaledCenter.z;
  obj.position.y -= scaledBox.min.y;

  baseY = obj.position.y;
  obj.updateMatrixWorld(true);
}

function setStatus(message, error = false) {
  const status = stage.querySelector('.avatar-status');
  if (!status) return;

  status.innerHTML = `<span${error ? ' style="background:#ff6f91;box-shadow:0 0 10px #ff6f91"' : ''}></span> ${message}`;
}

const loader = new GLTFLoader();
const modelURL = new URL('./assets/model.glb', import.meta.url).href;

loader.load(
  modelURL,
  (gltf) => {
    avatar = gltf.scene;

    // Some exported character models are rotated differently; the supplied
    // GLB is kept upright and only centered/scaled automatically.
    fitModel(avatar);
    root.add(avatar);

    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(avatar);

      // The supplied GLB contains an idle animation. Play it continuously.
      const clip = gltf.animations[0];
      const action = mixer.clipAction(clip);
      action.reset().fadeIn(0.35).play();
    }

    stage.classList.add('loaded');
    setStatus(
      gltf.animations?.length
        ? 'AVATAR ONLINE · GLB MOTION'
        : 'AVATAR ONLINE · GLB MODEL'
    );
  },
  undefined,
  (err) => {
    console.error('GLB avatar could not load:', err);
    stage.classList.add('fallback');
    setStatus('AVATAR LOAD ERROR', true);
  }
);

// Subtle attention shift toward the pointer.
let targetX = 0;
let targetY = 0;

window.addEventListener(
  'pointermove',
  (e) => {
    targetX = (e.clientX / innerWidth - 0.5) * 0.55;
    targetY = (e.clientY / innerHeight - 0.5) * 0.16;
  },
  { passive: true }
);

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;

  if (mixer) mixer.update(dt);

  if (avatar) {
    avatar.rotation.y += (targetX * 0.22 - avatar.rotation.y) * 0.035;
    avatar.rotation.x += (targetY * 0.10 - avatar.rotation.x) * 0.035;

    // Very small idle breathing movement without fighting the GLB animation.
    avatar.position.y = baseY + Math.sin(t * 1.35) * 0.018;
  }

  renderer.render(scene, camera);
}

animate();
