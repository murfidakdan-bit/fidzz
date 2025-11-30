const canvas = document.getElementById("heart-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let basePoints = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (basePoints.length) {
    updateTargets();
  }
}

window.addEventListener("resize", resize);

// gambar bentuk hati ke canvas offscreen, lalu sampling titiknya
function buildHeartPoints() {
  const off = document.createElement("canvas");
  const ow = 320;
  const oh = 280;
  off.width = ow;
  off.height = oh;
  const octx = off.getContext("2d");

  octx.clearRect(0, 0, ow, oh);
  octx.translate(ow / 2, oh / 2);
  octx.scale(1, -1);

  octx.beginPath();
  for (let t = 0; t < Math.PI * 2; t += 0.01) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    if (t === 0) octx.moveTo(x * 7, y * 7);
    else octx.lineTo(x * 7, y * 7);
  }
  octx.closePath();
  octx.fillStyle = "#ffffff";
  octx.fill();

  const img = octx.getImageData(0, 0, ow, oh).data;
  basePoints = [];

  const samples = 1500;
  let tries = 0;
  while (basePoints.length < samples && tries < samples * 10) {
    const x = Math.floor(Math.random() * ow);
    const y = Math.floor(Math.random() * oh);
    const idx = (y * ow + x) * 4 + 3; // alpha
    if (img[idx] > 100) {
      const nx = (x - ow / 2) / ow;
      const ny = (y - oh / 2) / oh;
      basePoints.push({ nx, ny });
    }
    tries++;
  }
}

function createParticles() {
  particles = [];
  const w = canvas.width;
  const h = canvas.height;
  const radius = Math.max(w, h) * 0.8;

  basePoints.forEach((pt) => {
    const angle = Math.random() * Math.PI * 2;
    const r = radius * (0.4 + Math.random() * 0.6);
    const px = w / 2 + Math.cos(angle) * r;
    const py = h / 2 + Math.sin(angle) * r;

    particles.push({
      nx: pt.nx,
      ny: pt.ny,
      x: px,
      y: py,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
      delay: Math.random() * 1.5,
    });
  });

  updateTargets();
}

function updateTargets() {
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.min(w, h) * 0.45;

  particles.forEach((p) => {
    p.tx = w / 2 + p.nx * scale;
    p.ty = h / 2 + p.ny * scale;
  });
}

function drawBackgroundStars() {
  const starCount = 150;
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const s = Math.random() * 1.2;
    ctx.globalAlpha = 0.3 + Math.random() * 0.5;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, s, s);
  }
}

let lastTime = 0;
function animate(time) {
  const dt = (time - lastTime) / 1000 || 0;
  lastTime = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackgroundStars();

  ctx.globalAlpha = 1;
  const t = time * 0.001;

  particles.forEach((p, i) => {
    if (p.delay > 0) {
      p.delay -= dt;
    } else {
      const spring = 0.05;
      const friction = 0.86;

      const dx = p.tx - p.x;
      const dy = p.ty - p.y;

      p.vx += dx * spring;
      p.vy += dy * spring;

      p.vx *= friction;
      p.vy *= friction;

      p.x += p.vx;
      p.y += p.vy;

      // sedikit goyang biar hidup
      p.y += Math.sin(t * 2 + i * 0.3) * 0.15;
    }
  });

  ctx.fillStyle = "#ff4b8b";
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.0, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

// AUDIO
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

// INIT
resize();
buildHeartPoints();
createParticles();
requestAnimationFrame(animate);
