let audioCtx = null;

function storageGet(key) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}

function storageRemove(key) {
  try { window.localStorage.removeItem(key); return true; } catch { return false; }
}

function storageJSON(key, fallback) {
  try {
    const value = storageGet(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function storageNumber(key, fallback, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const stored = storageGet(key);
  const value = Number(stored);
  return Number.isFinite(value) && stored !== null
    ? Math.max(min, Math.min(max, value))
    : fallback;
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;
    try { audioCtx = new AudioContextCtor(); } catch { return null; }
  }
  return audioCtx;
}

function playSound(tipo) {
  const context = getAudioContext();
  if (!context) return;
  if (context.state === 'suspended') context.resume().catch(() => {});

  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = context.currentTime;

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
  storageSet('nelsy_theme', esDark ? 'dark' : 'light');
  playSound('chime');
}

if (storageGet('nelsy_theme') === 'dark') {
  document.body.classList.add('dark-mode');
  document.getElementById('btnTheme').innerText = '☀️ Modo Día';
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

const perfilBadge = document.getElementById('perfilBadge');
const perfilFotoDialog = document.getElementById('perfilFotoDialog');

perfilBadge.addEventListener('click', () => perfilFotoDialog.showModal());
perfilBadge.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    perfilFotoDialog.showModal();
  }
});
document.getElementById('cerrarFotoPerfil').addEventListener('click', () => perfilFotoDialog.close());
perfilFotoDialog.addEventListener('click', (event) => {
  if (event.target === perfilFotoDialog) perfilFotoDialog.close();
});

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

let galletaAbierta = false;

function revelarSuerte() {
  const oracleText = document.getElementById('oracleText');
  const boton = document.querySelector('.oracle-container .btn-muro');

  if (galletaAbierta) {
    oracleText.innerText = '🥠 Ya abriste tu galleta del día. Vuelve mañana por otra 💖';
    if (boton) boton.disabled = true;
    return;
  }

  playSound('chime');
  const frase = fortunas[Math.floor(Math.random() * fortunas.length)];
  oracleText.innerText = `"${frase}"\n\n💌 Vuelve mañana por otra galletita...`;
  galletaAbierta = true;
  if (boton) {
    boton.disabled = true;
    boton.textContent = 'Galleta abierta ✨';
  }
}

function cargarTareas() {
  const guardadas = storageJSON('tareasNelsyPro', null);
  const tareas = Array.isArray(guardadas) ? guardadas.filter((tarea) => tarea && typeof tarea.texto === 'string') : [
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
  const tareasGuardadas = storageJSON('tareasNelsyPro', []);
  const tareas = Array.isArray(tareasGuardadas) ? tareasGuardadas : [];
  tareas.push({ texto: val, done: false });
  storageSet('tareasNelsyPro', JSON.stringify(tareas));
  input.value = "";
  cargarTareas();
}

function toggleTarea(index) {
  playSound('pop');
  const tareas = storageJSON('tareasNelsyPro', []);
  if (!Array.isArray(tareas) || !tareas[index]) return;
  tareas[index].done = !tareas[index].done;
  storageSet('tareasNelsyPro', JSON.stringify(tareas));
  cargarTareas();
}

function eliminarTarea(index) {
  playSound('pop');
  const tareas = storageJSON('tareasNelsyPro', []);
  if (!Array.isArray(tareas) || !tareas[index]) return;
  tareas.splice(index, 1);
  storageSet('tareasNelsyPro', JSON.stringify(tareas));
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
  if (idCapa !== 'juego' && catchState === 'running') pausarJuego(true);
  playSound('pop');
  document.querySelectorAll('.capa').forEach(c => c.classList.remove('activa'));
  document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('activo'));
  document.getElementById(idCapa).classList.add('activa');
  btn.classList.add('activo');
}

const dibujosGaleria = document.querySelectorAll('.dibujo-slide');
let dibujoActual = 0;

function moverDibujo(direccion) {
  dibujosGaleria[dibujoActual].hidden = true;
  dibujoActual = (dibujoActual + direccion + dibujosGaleria.length) % dibujosGaleria.length;
  dibujosGaleria[dibujoActual].hidden = false;
  document.getElementById('contadorDibujos').textContent = `${dibujoActual + 1} / ${dibujosGaleria.length}`;
  playSound('pop');
}

let pantalla = document.getElementById('resultado');

function agregar(v) {
  const actual = pantalla.value;
  if (actual === '0' && v !== '.') {
    pantalla.value = v;
    return;
  }
  if (actual === 'Error 💔') {
    pantalla.value = v;
    return;
  }
  pantalla.value += v;
}

function limpiar() {
  pantalla.value = '0';
}

function calcular() {
  const expr = pantalla.value.replace(/×/g, '*').replace(/÷/g, '/');
  try {
    if (expr === '29-9') {
      pantalla.value = 'I love u dom ❤️';
      playSound('win');
      return;
    }

    const resultado = Function(`"use strict"; return (${expr})`)();
    pantalla.value = Number.isInteger(resultado) ? resultado : Number(resultado.toFixed(6));
    playSound('win');
  } catch (e) {
    pantalla.value = 'Error 💔';
    setTimeout(limpiar, 1000);
  }
}

window.addEventListener('keydown', (event) => {
  if (/^[0-9+\-*/.=]$/.test(event.key)) {
    agregar(event.key === '=' ? '' : event.key);
  }
  if (event.key === 'Enter') {
    calcular();
  }
  if (event.key === 'Backspace') {
    const actual = pantalla.value;
    pantalla.value = actual.length <= 1 ? '0' : actual.slice(0, -1);
  }
  if (event.key === 'Escape') {
    limpiar();
  }
});

function completado() {
  pantalla.value = "¡Magia! ✨";
  playSound('chime');
  setTimeout(limpiar, 1500);
}

function cargarMensajes() {
  const storedMessages = storageJSON('muroNelsyPro', []);
  const mensajes = Array.isArray(storedMessages)
    ? storedMessages.filter((message) => message && typeof message.autor === 'string' && typeof message.texto === 'string')
    : [];
  const caja = document.getElementById('cajaMensajes');
  caja.replaceChildren();
  if (mensajes.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.style.opacity = '0.7';
    emptyMessage.textContent = '¡Sé la primera persona en dejar un mensaje! 🥺';
    caja.appendChild(emptyMessage);
  }
  mensajes.forEach((mensaje) => {
    const div = document.createElement('div');
    const autor = document.createElement('strong');
    div.className = 'msj-item';
    autor.textContent = `🌸 ${mensaje.autor}: `;
    div.append(autor, document.createTextNode(mensaje.texto));
    caja.appendChild(div);
  });
}

function guardarMensaje() {
  let autor = document.getElementById('nombreAmigo').value.trim();
  let texto = document.getElementById('textoMensaje').value.trim();
  if (!autor || !texto) return;

  playSound('chime');
  const storedMessages = storageJSON('muroNelsyPro', []);
  const mensajes = Array.isArray(storedMessages) ? storedMessages : [];
  mensajes.unshift({ autor, texto });
  storageSet('muroNelsyPro', JSON.stringify(mensajes));
  document.getElementById('nombreAmigo').value = "";
  document.getElementById('textoMensaje').value = "";
  cargarMensajes();
}

window.addEventListener('DOMContentLoaded', () => {
  cargarMensajes();
  cargarTareas();
}, { once: true });

const minigameRegistry = {
  catch: { title: 'Atrapa la Magia', stageId: 'catchGameStage' },
  portal: { title: 'Portal de Pigmentos', stageId: 'portalGameStage' }
};
let activeMinigame = null;
let portalFrameLoaded = false;
let puntos = 0;
let timerJuego = null;
let countdownJuego = null;
let catchState = 'idle';
let catchTimeLeft = 30;
let catchBest = storageNumber('nelsy_catch_best', 0);

function actualizarRecordsJuegos() {
  document.getElementById('catchBest').textContent = catchBest;
  document.getElementById('catchBestCard').textContent = catchBest;
  document.getElementById('portalBestCard').textContent = storageNumber('portal_lab_best', 0);
}

function actualizarControlesJuego() {
  document.getElementById('startCatchBtn').disabled = catchState === 'running';
  document.getElementById('pauseCatchBtn').disabled = catchState !== 'running';
  document.getElementById('resumeCatchBtn').disabled = catchState !== 'paused';
}

function limpiarTimersJuego() {
  clearInterval(timerJuego);
  clearInterval(countdownJuego);
  timerJuego = null;
  countdownJuego = null;
}

function entrarMinijuego(id) {
  const juego = minigameRegistry[id];
  if (!juego) return;
  if (catchState === 'running') pausarJuego(true);
  activeMinigame = id;
  document.getElementById('gamesCatalog').hidden = true;
  document.getElementById('gamePlayer').hidden = false;
  document.getElementById('activeGameTitle').textContent = juego.title;
  Object.entries(minigameRegistry).forEach(([gameId, entry]) => {
    document.getElementById(entry.stageId).hidden = gameId !== id;
  });
  if (id === 'portal' && !portalFrameLoaded) {
    document.getElementById('portalGameFrame').src = './game.html?embed=1';
    portalFrameLoaded = true;
  }
  actualizarRecordsJuegos();
}

function volverColeccionJuegos() {
  if (catchState === 'running') pausarJuego(true);
  activeMinigame = null;
  document.getElementById('gamePlayer').hidden = true;
  document.getElementById('gamesCatalog').hidden = false;
  actualizarRecordsJuegos();
}

document.querySelectorAll('[data-open-game]').forEach((button) => {
  button.addEventListener('click', () => entrarMinijuego(button.dataset.openGame));
});
document.getElementById('backToGames').addEventListener('click', volverColeccionJuegos);

function iniciarJuego() {
  limpiarTimersJuego();
  puntos = 0;
  catchTimeLeft = 30;
  catchState = 'running';
  document.getElementById('puntajeJuego').textContent = puntos;
  document.getElementById('catchTime').textContent = catchTimeLeft;
  document.getElementById('catchStatus').textContent = '¡A atrapar! 💖';
  playSound('chime');
  actualizarControlesJuego();
  siguienteCorazon();
  timerJuego = setInterval(siguienteCorazon, 900);
  countdownJuego = setInterval(() => {
    catchTimeLeft -= 1;
    document.getElementById('catchTime').textContent = catchTimeLeft;
    if (catchTimeLeft <= 0) terminarJuegoCatch();
  }, 1000);
}

function terminarJuegoCatch() {
  limpiarTimersJuego();
  catchState = 'finished';
  document.getElementById('spawnCorazon').replaceChildren();
  document.getElementById('catchStatus').textContent = `¡Ronda terminada! Juntaste ${puntos} ${puntos === 1 ? 'figura' : 'figuras'} ✨`;
  actualizarControlesJuego();
}

function pausarJuego(silencioso = false) {
  if (catchState !== 'running') return;
  limpiarTimersJuego();
  catchState = 'paused';
  document.getElementById('catchStatus').textContent = silencioso ? 'Partida en pausa al salir de la sección.' : 'Pausa. Kiki guarda tu lugar 🐱';
  actualizarControlesJuego();
}

function reanudarJuego() {
  if (catchState !== 'paused') return;
  if (catchTimeLeft <= 0) return terminarJuegoCatch();
  catchState = 'running';
  document.getElementById('catchStatus').textContent = '¡Seguimos! 💖';
  actualizarControlesJuego();
  siguienteCorazon();
  timerJuego = setInterval(siguienteCorazon, 900);
  countdownJuego = setInterval(() => {
    catchTimeLeft -= 1;
    document.getElementById('catchTime').textContent = catchTimeLeft;
    if (catchTimeLeft <= 0) terminarJuegoCatch();
  }, 1000);
}

document.getElementById('startCatchBtn').addEventListener('click', iniciarJuego);
document.getElementById('pauseCatchBtn').addEventListener('click', () => pausarJuego());
document.getElementById('resumeCatchBtn').addEventListener('click', reanudarJuego);
document.getElementById('restartCatchBtn').addEventListener('click', iniciarJuego);

function siguienteCorazon() {
  if (catchState !== 'running' || activeMinigame !== 'catch') return;
  const zona = document.getElementById('zonaJuego');
  const contenedor = document.getElementById('spawnCorazon');
  contenedor.replaceChildren();
  const figura = document.createElement('button');
  figura.type = 'button';
  figura.className = 'corazon-activo';
  figura.setAttribute('aria-label', 'Atrapar figura');
  figura.textContent = ['💖', '⭐', '🎀', '🌙', '🐱'][Math.floor(Math.random() * 5)];
  figura.style.left = `${Math.random() * Math.max(0, zona.clientWidth - 50)}px`;
  figura.style.top = `${Math.random() * Math.max(0, zona.clientHeight - 50)}px`;
  figura.addEventListener('click', (event) => {
    event.stopPropagation();
    if (catchState !== 'running') return;
    puntos += 1;
    if (puntos > catchBest) {
      catchBest = puntos;
      storageSet('nelsy_catch_best', String(catchBest));
      actualizarRecordsJuegos();
      actualizarDesbloqueosDecoracion();
    }
    playSound('win');
    document.getElementById('puntajeJuego').textContent = puntos;
    siguienteCorazon();
  });
  contenedor.appendChild(figura);
}

actualizarRecordsJuegos();

const ROOM_STORAGE_KEY = 'nelsy_kiki_room_v1';
const roomData = storageJSON(ROOM_STORAGE_KEY, {});
const storedRoom = roomData && typeof roomData === 'object' && !Array.isArray(roomData) ? roomData : {};
const roomDefaults = { bed: 'rosa', rug: 'lila', lamp: 'corazon', plant: 'monstera' };
const roomOptions = {
  bed: ['rosa', 'menta', 'lila'],
  rug: ['lila', 'rosa', 'menta'],
  lamp: ['corazon', 'luna', 'estrella'],
  plant: ['monstera', 'suculenta', 'flor']
};
let hambre = Number.isFinite(storedRoom.hunger) ? Math.max(0, Math.min(100, storedRoom.hunger)) : storageNumber('mascota_hambre', 80, 0, 100);
let felicidad = Number.isFinite(storedRoom.happiness) ? Math.max(0, Math.min(100, storedRoom.happiness)) : storageNumber('mascota_felicidad', 100, 0, 100);
let kikiDormida = storedRoom.sleeping === true;
let roomDecor = { ...roomDefaults };
Object.keys(roomOptions).forEach((key) => {
  if (roomOptions[key].includes(storedRoom.decor?.[key])) roomDecor[key] = storedRoom.decor[key];
});
let unlockedDecor = Array.isArray(storedRoom.unlockedDecor) ? storedRoom.unlockedDecor.filter((item) => ['estrella', 'flor'].includes(item)) : [];

const barHambre = document.getElementById('bar-hambre');
const barFelicidad = document.getElementById('bar-felicidad');
const dialogo = document.getElementById('mascota-dialogo');
const avatar = document.getElementById('mascota-avatar');
const mascotaContenedor = document.querySelector('.mascota-container');
const roomScene = document.getElementById('kikiRoomScene');
const petWidget = document.getElementById('petWidget');

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

  storageSet('mascota_hambre', String(hambre));
  storageSet('mascota_felicidad', String(felicidad));
  storageSet(ROOM_STORAGE_KEY, JSON.stringify({ version: 1, hunger: hambre, happiness: felicidad, sleeping: kikiDormida, decor: roomDecor, unlockedDecor }));

  const mood = kikiDormida ? 'dormida' : (hambre < 30 || felicidad < 30 ? 'cansada' : (felicidad > 85 ? 'feliz' : 'despierta'));
  const caraAutomatica = kikiDormida ? '😴' : (mood === 'cansada' ? '😿' : (mood === 'feliz' ? '😸' : '🐱'));

  avatar.textContent = caraAutomatica;
  if (petEmoji) petEmoji.textContent = caraAutomatica;
  roomScene.dataset.mood = mood;
  document.getElementById('kikiRoomState').textContent = kikiDormida ? 'Durmiendo' : (mood === 'cansada' ? 'Un poquito cansada' : (mood === 'feliz' ? 'Feliz' : 'Despierta'));
  document.getElementById('sleepKikiBtn').textContent = kikiDormida ? '☀️ Despertar' : '🌙 A dormir';
}

function aplicarDecoracion() {
  Object.entries(roomDecor).forEach(([slot, option]) => {
    roomScene.dataset[slot] = option;
    document.getElementById(`${slot}Decor`).value = option;
  });
}

function guardarHabitacion() {
  storageSet(ROOM_STORAGE_KEY, JSON.stringify({ version: 1, hunger: hambre, happiness: felicidad, sleeping: kikiDormida, decor: roomDecor, unlockedDecor }));
}

function actualizarDesbloqueosDecoracion() {
  const desbloqueados = new Set(unlockedDecor);
  if (catchBest >= 10) desbloqueados.add('estrella');
  if (catchBest >= 5) desbloqueados.add('flor');
  unlockedDecor = [...desbloqueados];
  const flowerOption = document.querySelector('#plantDecor option[value="flor"]');
  const starOption = document.querySelector('#lampDecor option[value="estrella"]');
  flowerOption.disabled = !desbloqueados.has('flor');
  starOption.disabled = !desbloqueados.has('estrella');
  flowerOption.textContent = desbloqueados.has('flor') ? 'Flor' : 'Flor (5 corazones)';
  starOption.textContent = desbloqueados.has('estrella') ? 'Estrella' : 'Estrella (10 corazones)';
  const message = document.getElementById('roomUnlockMessage');
  message.textContent = unlockedDecor.length
    ? '¡Kiki desbloqueó una decoración nueva! Revisa las opciones 🌟'
    : 'Atrapa corazones en los minijuegos para desbloquear detalles especiales.';
  guardarHabitacion();
}

function toggleDormirKiki() {
  kikiDormida = !kikiDormida;
  actualizarEstado();
  dialogo.textContent = kikiDormida ? 'Shhh... Kiki está soñando con estrellitas 🌙' : '¡Buenos días, Kiki! ¿Jugamos? ☀️';
  if (!kikiDormida) playSound('chime');
}

function restablecerHabitacion() {
  hambre = 80;
  felicidad = 100;
  kikiDormida = false;
  roomDecor = { ...roomDefaults };
  aplicarDecoracion();
  storageRemove(ROOM_STORAGE_KEY);
  storageRemove('mascota_hambre');
  storageRemove('mascota_felicidad');
  dialogo.textContent = '¡Qué lindo quedó mi rinconcito! Gracias 💖';
  actualizarEstado();
  roomResetDialog.close();
}

Object.keys(roomOptions).forEach((slot) => {
  document.getElementById(`${slot}Decor`).addEventListener('change', (event) => {
    if (!roomOptions[slot].includes(event.target.value)) return;
    roomDecor[slot] = event.target.value;
    aplicarDecoracion();
    guardarHabitacion();
  });
});

const roomResetDialog = document.getElementById('roomResetDialog');
document.getElementById('openRoomReset').addEventListener('click', () => roomResetDialog.showModal());
document.getElementById('cancelRoomReset').addEventListener('click', () => roomResetDialog.close());
document.getElementById('confirmRoomReset').addEventListener('click', restablecerHabitacion);
document.getElementById('mascota-avatar').addEventListener('click', acariciarMascota);
petWidget.addEventListener('click', acariciarMascota);
petWidget.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    acariciarMascota();
  }
});

document.getElementById('roomResetDialog').addEventListener('click', (event) => {
  if (event.target === roomResetDialog) roomResetDialog.close();
});

aplicarDecoracion();
actualizarDesbloqueosDecoracion();

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
  kikiDormida = false;
  if (hambre >= 100) {
    actualizarEstado();
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
  if (kikiDormida) kikiDormida = false;
  felicidad = Math.min(100, felicidad + 15);
  actualizarEstado();
  animarBrinco();
  crearParticulas('amor');
  playSound('meow');

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

actualizarEstado();