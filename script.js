import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById("scene-container");

// ===== SCENE, CAMERA, RENDERER =====
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 14);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// ===== CONTROLS (BISA DIPUTER & ZOOM) =====
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 22;

// ===== LIGHTING =====
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const point = new THREE.PointLight(0xffffff, 1.2);
point.position.set(7, 8, 10);
scene.add(point);

// ===== BACKGROUND BINTANG =====
function createStars() {
  const starCount = 1000;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 60 * Math.random() + 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    pos[i3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i3 + 1] = r * Math.cos(phi);
    pos[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.12,
    color: 0xffffff,
  });

  const stars = new THREE.Points(geo, mat);
  scene.add(stars);
}
createStars();

// ===== HATI 3D DARI PARTIKEL =====
function buildHeartGeometry() {
  const points = [];
  const count = 2500;

  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const x =
      16 * Math.pow(Math.sin(t), 3); // parametric heart
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);

    const nx = x * 0.12;
    const ny = y * 0.12;

    // sebar dikit ke kedalaman z biar kerasa 3D
    const nz = (Math.random() - 0.5) * 1.8;

    // sebar sedikit di sekitar kurva biar lebih “penuh”
    const jitter = 0.4;
    points.push(
      nx + (Math.random() - 0.5) * jitter,
      ny + (Math.random() - 0.5) * jitter,
      nz
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(points, 3)
  );
  return geo;
}

const heartGeo = buildHeartGeometry();
const heartMat = new THREE.PointsMaterial({
  color: new THREE.Color(0xff4b8b),
  size: 0.14,
});
const heart = new THREE.Points(heartGeo, heartMat);
scene.add(heart);

// ===== RING TEKS / CAHAYA DI BAWAH HATI =====
const ringGeo = new THREE.RingGeometry(4.3, 4.7, 90);
const ringMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide,
});
const ringMesh = new THREE.Mesh(ringGeo, ringMat);
ringMesh.rotation.x = -Math.PI / 2;
ringMesh.position.y = -4;
scene.add(ringMesh);

// ===== SERPIHAN FOTO QUEENSHA DI SEKITAR HATI =====
const texLoader = new THREE.TextureLoader();
const textures = [
  texLoader.load("syantik.jpg"),
  texLoader.load("syantik2.jpg"),
  texLoader.load("syantik3.jpg"),
];

const paperGroup = new THREE.Group();
scene.add(paperGroup);

function createPhotoPieces() {
  const count = 40;

  for (let i = 0; i < count; i++) {
    const tex = textures[i % textures.length];
    const geo = new THREE.PlaneGeometry(1.0, 1.4);
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);

    const radius = 7 + Math.random() * 2.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * (Math.PI / 2) + Math.PI / 4;

    mesh.position.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    mesh.rotation.set(
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI
    );

    mesh.userData.floatSpeed = 0.002 + Math.random() * 0.004;

    paperGroup.add(mesh);
  }
}

createPhotoPieces();

// ===== RESIZE =====
window.addEventListener("resize", () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ===== AUDIO =====
const bgMusic = document.getElementById("bg-music");
const toggleBtn = document.getElementById("toggle-audio");
const iconSpan = document.getElementById("audio-icon");
let isPlaying = false;

toggleBtn.addEventListener("click", () => {
  if (!bgMusic) return;
  if (!isPlaying) {
    bgMusic.play().catch(() => {});
    isPlaying = true;
    iconSpan.textContent = "🔊";
  } else {
    bgMusic.pause();
    isPlaying = false;
    iconSpan.textContent = "🔇";
  }
});

// ===== LOOP =====
function animate(time) {
  requestAnimationFrame(animate);

  const t = time * 0.001;

  controls.update();

  // hati muter pelan
  heart.rotation.y = t * 0.3;
  heart.rotation.z = Math.sin(t * 0.3) * 0.1;

  // ring pelan-pelan muter
  ringMesh.rotation.z = t * 0.2;

  // serpihan foto muter & goyang dikit
  paperGroup.rotation.y = t * 0.35;
  paperGroup.children.forEach((p, idx) => {
    p.rotation.y += 0.01;
    p.position.y += Math.sin(t * 2 + idx) * p.userData.floatSpeed;
  });

  renderer.render(scene, camera);
}

animate();
