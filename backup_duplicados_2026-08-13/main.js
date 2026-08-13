const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(tipo) {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (tipo === 'pop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }
  else if (tipo === 'chime') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }
  else if (tipo === 'win') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  }
  else if (tipo === 'meow') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(900, now + 0.12);
    osc.frequency.linearRampToValueAtTime(400, now + 0.25);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const esDark = document.body.classList.contains('dark-mode');
  document.getElementById('btnTheme').innerText = esDark ? "☀️ Modo Día" : "🌙 Modo Noche";
  playSound('chime');
}

function actualizarReloj() {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  document.getElementById('relojTexto').innerText = `${horas}:${minutos}:${segundos}`;

  const h = ahora.getHours();
  const icono = document.getElementById('iconoHora');
  const saludo = document.getElementById('saludoBienvenida');

  if (h >= 6 && h < 12) {
    icono.innerText = "☀️";
    saludo.innerText = "¡Buenos días, bienvenida! ☀️✨";
  } else if (h >= 12 && h < 18) {
    icono.innerText = "🌤️";
    saludo.innerText = "¡Buenas tardes, bienvenida! 🌤️✨";
  } else {
    icono.innerText = "🌙";
    saludo.innerText = "¡Buenas noches, bienvenida! 🌙✨";
  }
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

let amorMascota = 100;

function acariciarMascota() {
  amorMascota = Math.min(amorMascota + 5, 100);
  document.getElementById('petLove').innerText = amorMascota;
  document.getElementById('petEmoji').innerText = "😸";
  playSound('meow');
  setTimeout(() => {
    document.getElementById('petEmoji').innerText = "🐱";
  }, 800);
}

function cambiarMood(estado, mensaje) {
  playSound('pop');
  document.getElementById('mensajeMood').innerText = mensaje;
}

const fortunas = [
  "✨ Hoy resolverás ese bug a la primera sin dudar.",
  "🌸 Tu creatividad está al 100%, aprovecha el momento.",
  "☕ Un cafecito y buenas canciones traerán grandes ideas.",
  "🚀 Todo el esfuerzo que estás haciendo dará frutos enormes.",
  "💖 Confía en tu talento: estás creando cosas increíbles."
];

function revelarSuerte() {
  playSound('chime');
  const azar = fortunas[Math.floor(Math.random() * fortunas.length)];
  document.getElementById('oracleText').innerText = `"${azar}"`;
}

function cargarTareas() {
  const tareas = JSON.parse(localStorage.getItem('tareasNelsyPro')) || [
    { texto: "Probar los soniditos interactivos 🔊", done: true },
    { texto: "Subir cambios a GitHub 🚀", done: false }
  ];
  const lista = document.getElementById('listaTareas');
  lista.innerHTML = "";
  tareas.forEach((t, index) => {
    const li = document.createElement('li');
    li.className = `task-item ${t.done ? 'done' : ''}`;
    li.innerHTML = `
      <span onclick="toggleTarea(${index})" style="cursor:pointer;">${t.done ? '✅' : '🌸'} ${t.texto}</span>
      <button style="border:none; background:transparent; cursor:pointer;" onclick="eliminarTarea(${index})">❌</button>
    `;
    lista.appendChild(li);
  });
}

function agregarTarea() {
  const input = document.getElementById('nuevaTareaInput');
  const val = input.value.trim();
  if (!val) return;

  playSound('chime');
  const tareas = JSON.parse(localStorage.getItem('tareasNelsyPro')) || [];
  tareas.push({ texto: val, done: false });
  localStorage.setItem('tareasNelsyPro', JSON.stringify(tareas));
  input.value = "";
  cargarTareas();
}

function toggleTarea(index) {
  playSound('pop');
  const tareas = JSON.parse(localStorage.getItem('tareasNelsyPro')) || [];
  tareas[index].done = !tareas[index].done;
  localStorage.setItem('tareasNelsyPro', JSON.stringify(tareas));
  cargarTareas();
}

function eliminarTarea(index) {
  playSound('pop');
  const tareas = JSON.parse(localStorage.getItem('tareasNelsyPro')) || [];
  tareas.splice(index, 1);
  localStorage.setItem('tareasNelsyPro', JSON.stringify(tareas));
  cargarTareas();
}

const simbolos = ["✨", "🌸", "💖", "⭐", "💫"];
document.addEventListener('mousemove', function (e) {
  if (Math.random() < 0.2) {
    let chispa = document.createElement('div');
    chispa.className = 'chispa-cursor';
    chispa.innerText = simbolos[Math.floor(Math.random() * simbolos.length)];
    chispa.style.left = e.clientX + 'px';
    chispa.style.top = e.clientY + 'px';
    document.body.appendChild(chispa);
    setTimeout(() => { chispa.remove(); }, 800);
  }
});

const universo = document.getElementById('universoBox');
for (let i = 0; i < 35; i++) {
  let est = document.createElement('div');
  est.classList.add('estrella-flotante');
  let tam = Math.random() * 4 + 2;
  est.style.width = tam + 'px';
  est.style.height = tam + 'px';
  est.style.left = Math.random() * 100 + 'vw';
  est.style.top = Math.random() * 100 + 'vh';
  est.style.animationDelay = (Math.random() * 4) + 's';
  universo.appendChild(est);
}

function irACapa(idCapa, btn) {
  playSound('pop');
  document.querySelectorAll('.capa').forEach(c => c.classList.remove('activa'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('activo'));
  document.getElementById(idCapa).classList.add('activa');
  btn.classList.add('activo');
}

let pantalla = document.getElementById('resultado');

function agregar(v) {
  if (pantalla.value === '0' && v !== '.') {
    pantalla.value = v;
  } else {
    pantalla.value += v;
  }
}

function limpiar() {
  pantalla.value = '0';
}

function calcular() {
  try {
    pantalla.value = eval(pantalla.value);
    playSound('win');
  } catch (e) {
    pantalla.value = 'Error 💔';
    setTimeout(limpiar, 1000);
  }
}

function completado() {
  pantalla.value = "¡Magia! ✨";
  playSound('chime');
  setTimeout(limpiar, 1500);
}

function cargarMensajes() {
  let mensajes = JSON.parse(localStorage.getItem('muroNelsyPro')) || [];
  let caja = document.getElementById('cajaMensajes');
  caja.innerHTML = mensajes.length === 0 ? "<div style='opacity: 0.7;'>¡Sé la primera persona en dejar un mensaje! 🥺</div>" : "";
  mensajes.forEach(m => {
    let div = document.createElement('div');
    div.className = 'msj-item';
    div.innerHTML = `<strong>🌸 ${m.autor}:</strong> ${m.texto}`;
    caja.appendChild(div);
  });
}

function guardarMensaje() {
  let autor = document.getElementById('nombreAmigo').value.trim();
  let texto = document.getElementById('textoMensaje').value.trim();
  if (!autor || !texto) return;

  playSound('chime');
  let mensajes = JSON.parse(localStorage.getItem('muroNelsyPro')) || [];
  mensajes.unshift({ autor, texto });
  localStorage.setItem('muroNelsyPro', JSON.stringify(mensajes));
  document.getElementById('nombreAmigo').value = "";
  document.getElementById('textoMensaje').value = "";
  cargarMensajes();
}

window.onload = function () {
  cargarMensajes();
  cargarTareas();
};

let puntos = 0, timerJuego = null;

function iniciarJuego() {
  puntos = 0;
  document.getElementById('puntajeJuego').innerText = puntos;
  playSound('chime');
  clearInterval(timerJuego);
  siguienteCorazon();
  timerJuego = setInterval(siguienteCorazon, 900);
}

function siguienteCorazon() {
  let zona = document.getElementById('zonaJuego');
  let contenedor = document.getElementById('spawnCorazon');
  contenedor.innerHTML = "";
  let corazon = document.createElement('div');
  corazon.className = 'corazon-activo';
  corazon.innerHTML = ["💖", "⭐", "🎀", "🌙", "🐱"][Math.floor(Math.random() * 5)];
  corazon.style.left = (Math.random() * (zona.clientWidth - 50)) + 'px';
  corazon.style.top = (Math.random() * (zona.clientHeight - 50)) + 'px';
  corazon.onclick = function (e) {
    e.stopPropagation();
    puntos++;
    playSound('win');
    document.getElementById('puntajeJuego').innerText = puntos;
    siguienteCorazon();
  };
  contenedor.appendChild(corazon);
}

let hambre = parseInt(localStorage.getItem('mascota_hambre')) || 80;
let felicidad = parseInt(localStorage.getItem('mascota_felicidad')) || 100;

const barHambre = document.getElementById('bar-hambre');
const barFelicidad = document.getElementById('bar-felicidad');
const dialogo = document.getElementById('mascota-dialogo');
const avatar = document.getElementById('mascota-avatar');
const mascotaContenedor = document.querySelector('.mascota-container');

const frasesComida = [
  "¡Mmm, qué rico! 😋",
  "¡Gracias amiga! 💖",
  "¡Pancita llena, corazón contento! 🥰",
  "¡Estaba delicioso! ✨",
  "¡Nom nom nom! 🤤",
  "¡Esto me encanta! 😻",
  "¡Delicioso, delicioso! 👅",
  "¡Mi comida favorita! 💕"
];

const frasesCaricias = [
  "¡Yaii! Te quiero mucho 🐱💕",
  "¡Ji ji ji, me da risa! ✨",
  "¡Sigue acariciándome! 🥰",
  "¡Eres la mejor dev! 👩‍💻✨",
  "¡Tus manos son mágicas! ✨💫",
  "¡Amo estos momentos contigo! 💖",
  "¡Purr purr! 🐱💕",
  "¡Más acariciitas, plis! 🥺"
];

function actualizarEstado() {
  barHambre.style.width = `${hambre}%`;
  barFelicidad.style.width = `${felicidad}%`;

  const petLove = document.getElementById('petLove');
  const petHambre = document.getElementById('petHambre');
  const petEmoji = document.getElementById('petEmoji');

  if (petLove) petLove.textContent = felicidad;
  if (petHambre) petHambre.textContent = hambre;

  localStorage.setItem('mascota_hambre', hambre);
  localStorage.setItem('mascota_felicidad', felicidad);

  let caraAutomatica = '🐱';

  if (hambre < 30 || felicidad < 30) {
    caraAutomatica = "😿";
  } else if (felicidad > 85) {
    caraAutomatica = "😸";
  } else if (hambre > 90) {
    caraAutomatica = "😻";
  } else {
    caraAutomatica = "🐱";
  }

  avatar.textContent = caraAutomatica;
  if (petEmoji) petEmoji.textContent = caraAutomatica;
}

function crearParticulas(tipo) {
  const rect = avatar.getBoundingClientRect();
  const particulas = tipo === 'comida'
    ? ['✨', '🌟', '⭐', '💫']
    : ['💖', '💕', '💗', '✨'];

  for (let i = 0; i < 6; i++) {
    let particula = document.createElement('div');
    particula.textContent = particulas[Math.floor(Math.random() * particulas.length)];
    particula.style.position = 'fixed';
    particula.style.fontSize = '24px';
    particula.style.pointerEvents = 'none';
    particula.style.zIndex = '9999';
    particula.style.animation = 'flotar-particula 1s forwards ease-out';

    particula.style.left = (rect.left + rect.width / 2) + 'px';
    particula.style.top = (rect.top + rect.height / 2) + 'px';

    document.body.appendChild(particula);
    setTimeout(() => particula.remove(), 1000);
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes flotar-particula {
    0% {
      opacity: 1;
      transform: translate(0, 0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(${Math.random() * 100 - 50}px, -60px) scale(0.5);
    }
  }
`;
document.head.appendChild(style);

function alimentarMascota(tipoComida, puntos) {
  if (hambre >= 100) {
    dialogo.textContent = "¡Estoy súper llena! 🙈";
    if (mascotaContenedor) {
      mascotaContenedor.style.animation = 'shake 0.4s';
      setTimeout(() => mascotaContenedor.style.animation = 'none', 400);
    }
    return;
  }

  hambre = Math.min(100, hambre + puntos);
  actualizarEstado();
  animarBrinco();
  crearParticulas('comida');

  const frase = frasesComida[Math.floor(Math.random() * frasesComida.length)];
  dialogo.textContent = frase;
}

function acariciarMascota() {
  felicidad = Math.min(100, felicidad + 15);
  actualizarEstado();
  animarBrinco();
  crearParticulas('amor');

  const frase = frasesCaricias[Math.floor(Math.random() * frasesCaricias.length)];
  dialogo.textContent = frase;
}

function animarBrinco() {
  avatar.classList.add('brincando');
  setTimeout(() => {
    avatar.classList.remove('brincando');
  }, 500);
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(shakeStyle);

setInterval(() => {
  hambre = Math.max(0, hambre - 5);
  felicidad = Math.max(0, felicidad - 5);
  actualizarEstado();

  const mensajes = [
    "Tengo hambre... ¿me das un bocadillito? 🥺",
    "¿Dónde estabas? ¡Me extrañabas! 🥺",
    "Tengo un poco de hambre 😿",
    "¿Me acaricicias? 🥺",
    "¡Estoy un poquito solita! 💔"
  ];

  if (hambre < 35) {
    dialogo.textContent = mensajes[Math.floor(Math.random() * mensajes.length)];
  }
}, 25000);

actualizarEstado();