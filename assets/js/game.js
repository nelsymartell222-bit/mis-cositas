// --- MOTOR DE JUEGO CANVAS 2D ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('current-score');
const highScoreEl = document.getElementById('high-score');
const finalScoreEl = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const themeBtn = document.getElementById('gameThemeBtn');

let audioCtx;
let gameRunning = false;
let score = 0;
let highScore = Number(localStorage.getItem('cyber_high_score')) || 0;
let obstacleTimer = 0;
let backgroundOffset = 0;
const player = {
  x: 52,
  y: 180,
  width: 28,
  height: 28,
  speed: 8,
  color: '#58d5ff'
};

highScoreEl.textContent = highScore;

let obstacles = [];
let keys = {};

function initAudio() {
  if (!audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtor();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function playTone({ frequency = 440, endFrequency = frequency * 1.35, duration = 0.12, gainValue = 0.04, type = 'sine' }) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  osc.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);

  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function playSound(tipo) {
  switch (tipo) {
    case 'start':
      playTone({ frequency: 360, endFrequency: 620, duration: 0.18, gainValue: 0.05, type: 'triangle' });
      setTimeout(() => playTone({ frequency: 520, endFrequency: 780, duration: 0.18, gainValue: 0.05, type: 'triangle' }), 90);
      break;
    case 'score':
      playTone({ frequency: 620, endFrequency: 980, duration: 0.08, gainValue: 0.04, type: 'square' });
      break;
    case 'hit':
      playTone({ frequency: 180, endFrequency: 70, duration: 0.26, gainValue: 0.08, type: 'sawtooth' });
      break;
    case 'win':
      playTone({ frequency: 580, endFrequency: 980, duration: 0.12, gainValue: 0.05, type: 'triangle' });
      setTimeout(() => playTone({ frequency: 760, endFrequency: 1100, duration: 0.14, gainValue: 0.05, type: 'triangle' }), 100);
      break;
    default:
      playTone({ frequency: 440, endFrequency: 680, duration: 0.12, gainValue: 0.04, type: 'sine' });
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  if (themeBtn) {
    themeBtn.textContent = isLight ? '🌙 Oscuro' : '☀️ Claro';
  }
  playSound('win');
}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

canvas.addEventListener('mousemove', (event) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  player.y = (event.clientY - rect.top) * scaleY - player.height / 2;
});

canvas.addEventListener('touchmove', (event) => {
  if (!gameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  player.y = (event.touches[0].clientY - rect.top) * scaleY - player.height / 2;
}, { passive: true });

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#050b16');
  gradient.addColorStop(1, '#0e1b2d');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  backgroundOffset += 1;
  ctx.strokeStyle = 'rgba(88, 213, 255, 0.12)';
  ctx.lineWidth = 1;

  for (let x = 0; x < canvas.width; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x - (backgroundOffset % 30), 0);
    ctx.lineTo(x - (backgroundOffset % 30), canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y < canvas.height; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y - (backgroundOffset % 30));
    ctx.lineTo(canvas.width, y - (backgroundOffset % 30));
    ctx.stroke();
  }
}

function spawnObstacle() {
  const minHeight = 24;
  const maxHeight = 120;
  const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
  const yPos = Math.random() < 0.5 ? 0 : canvas.height - height;

  obstacles.push({
    x: canvas.width,
    y: yPos,
    width: 28,
    height: height,
    speed: 5 + score * 0.22 + Math.random() * 2.6,
    color: '#f43f5e'
  });
}

function drawPlayer() {
  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#58d5ff';
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.restore();
}

function drawObstacles() {
  obstacles.forEach((obs) => {
    ctx.save();
    ctx.fillStyle = obs.color;
    ctx.shadowBlur = 16;
    ctx.shadowColor = obs.color;
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    ctx.restore();
  });
}

function gameLoop() {
  if (!gameRunning) return;

  drawBackground();

  if ((keys['ArrowUp'] || keys['w'] || keys['W']) && player.y > 0) {
    player.y -= player.speed;
  }
  if ((keys['ArrowDown'] || keys['s'] || keys['S']) && player.y < canvas.height - player.height) {
    player.y += player.speed;
  }

  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

  obstacleTimer++;
  if (obstacleTimer % 26 === 0) {
    spawnObstacle();
  }

  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= obs.speed;

    if (checkCollision(player, obs)) {
      gameOver();
      return;
    }

    if (obs.x + obs.width < 0) {
      obstacles.splice(i, 1);
      score += 1;
      scoreEl.textContent = score;
      playSound('score');
    }
  }

  drawObstacles();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

function iniciarJuego() {
  score = 0;
  obstacles = [];
  obstacleTimer = 0;
  player.y = canvas.height / 2 - player.height / 2;
  scoreEl.textContent = score;
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  gameRunning = true;
  playSound('start');
  requestAnimationFrame(gameLoop);
}

function gameOver() {
  gameRunning = false;
  finalScoreEl.textContent = score;
  playSound('hit');

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('cyber_high_score', highScore);
    highScoreEl.textContent = highScore;
  }

  gameOverScreen.classList.remove('hidden');
}

scoreEl.textContent = score;
startScreen.classList.remove('hidden');
gameOverScreen.classList.add('hidden');
drawBackground();
drawPlayer();