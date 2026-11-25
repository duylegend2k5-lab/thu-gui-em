'use strict';

const page = document.querySelector('.page');
const cards = [...document.querySelectorAll('.card')];
const proposal = document.getElementById('question');
const yesButton = document.getElementById('yes');
const proposalNote = document.getElementById('proposal-note');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const noMessages = ['Em cứ suy nghĩ thêm nha.', 'Anh đợi em nè.', 'Thong thả thôi em ♡'];
const canvas = document.querySelector('.universe-canvas');
const sky = canvas.getContext('2d');
const fullTurn = Math.PI * 2;
const stars = Array.from({ length: 86 }, () => ({
  x: Math.random(), y: Math.random(), radius: 0.45 + Math.random() * 0.85,
  phase: Math.random() * fullTurn, speed: 0.65 + Math.random(),
}));
const heartPoints = Array.from({ length: 192 }, (_, index) => {
  const angle = index / 192 * fullTurn;
  const offsetAngle = angle + index * 2.4;
  return {
    x: Math.sin(angle) ** 3 / 2,
    y: -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle)
      - Math.cos(4 * angle) + 2.4) / 32,
    fromX: Math.cos(offsetAngle) * (0.22 + Math.random() * 0.56),
    fromY: Math.sin(offsetAngle) * (0.22 + Math.random() * 0.56),
    phase: index * 1.43,
    turn: index / 192,
    radius: 0.55 + Math.random() * 1.25,
    color: ['#ffd5f0', '#ff85ba', '#ffe2bc', '#fff6fd'][index % 4],
  };
});
let noCount = 0;
let frame = 0;
let sceneStarted = 0;
let skyWidth = 0;
let skyHeight = 0;
let skyDensity = 0;

function show(id) {
  for (const card of cards) {
    card.hidden = card.id !== id;
  }
  page.dataset.scene = id;
  sceneStarted = performance.now();
  updateSky();
  const focusTarget = document.getElementById(id).querySelector('h2, button');
  focusTarget.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function drawSky(now) {
  const elapsed = (now - sceneStarted) / 1000;
  const time = motion.matches ? 0 : elapsed;
  sky.clearRect(0, 0, skyWidth, skyHeight);
  sky.fillStyle = '#e7cfec';
  for (const star of stars) {
    sky.globalAlpha = 0.19 + (Math.sin(time * star.speed + star.phase) + 1) * 0.19;
    sky.beginPath();
    sky.arc(star.x * skyWidth, star.y * skyHeight, star.radius, 0, fullTurn);
    sky.fill();
  }

  if (page.dataset.scene === 'ending') {
    const size = Math.min(skyWidth * 0.86, skyHeight * 0.77, 610);
    const centerX = skyWidth / 2;
    const centerY = skyHeight / 2;
    const pulse = 1 + 0.012 * Math.sin(time * 2.15);
    for (const point of heartPoints) {
      const progress = motion.matches ? 1 : Math.min(1, Math.max(0, (elapsed - point.turn * 0.37) / 1.14));
      const arrival = 1 - (1 - progress) ** 3;
      const x = centerX + (point.fromX * (1 - arrival) + point.x * arrival * pulse) * size;
      const y = centerY + (point.fromY * (1 - arrival) + point.y * arrival * pulse) * size;
      const glow = 0.66 + 0.33 * Math.cos(time * 3 - point.phase);
      const radius = point.radius * (size < 390 ? 0.78 : 1);
      sky.fillStyle = point.color;
      sky.globalAlpha = arrival * glow * 0.22;
      sky.beginPath();
      sky.arc(x, y, radius * 2.8, 0, fullTurn);
      sky.fill();
      sky.globalAlpha = arrival * glow;
      sky.beginPath();
      sky.arc(x, y, radius, 0, fullTurn);
      sky.fill();
    }
  }
  sky.globalAlpha = 1;
  if (!motion.matches) frame = requestAnimationFrame(drawSky);
}

function updateSky() {
  if (!sky) return;
  cancelAnimationFrame(frame);
  if (page.dataset.scene !== 'question' && page.dataset.scene !== 'ending') return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const density = Math.min(window.devicePixelRatio || 1, 2);
  if (width !== skyWidth || height !== skyHeight || density !== skyDensity) {
    skyWidth = width;
    skyHeight = height;
    skyDensity = density;
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    sky.setTransform(density, 0, 0, density, 0, 0);
  }
  drawSky(performance.now());
}

document.getElementById('open').addEventListener('click', () => show('story'));
document.getElementById('continue').addEventListener('click', () => {
  noCount = 0;
  yesButton.style.removeProperty('--yes-growth');
  proposalNote.textContent = '';
  show('question');
});
document.getElementById('back-to-letter').addEventListener('click', () => show('story'));
document.getElementById('restart').addEventListener('click', () => show('cover'));

document.getElementById('no').addEventListener('click', () => {
  noCount += 1;
  yesButton.style.setProperty('--yes-growth', String(1 - 0.82 ** noCount));
  if (noCount <= noMessages.length) proposalNote.textContent = noMessages[noCount - 1];
});

yesButton.addEventListener('click', () => {
  if (proposal.inert) return;
  if (motion.matches) {
    show('ending');
    return;
  }

  proposal.inert = true;
  proposal.classList.add('is-departing');
  window.setTimeout(() => {
    show('ending');
    proposal.classList.remove('is-departing');
    proposal.inert = false;
  }, 360);
});

new ResizeObserver(updateSky).observe(page);
motion.addEventListener('change', updateSky);
