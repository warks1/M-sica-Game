const screens = {
  home: document.querySelector('#homeScreen'),
  game: document.querySelector('#gameScreen'),
  results: document.querySelector('#resultsScreen')
};
const $ = (selector) => document.querySelector(selector);
const state = {
  round: 0,
  score: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  responseTimes: [],
  current: null,
  timerId: null,
  startedAt: 0,
  audio: null,
  muted: false,
  answered: false
};

const tracks = [
  { artist: 'Neon Riders', title: 'Midnight Avenue', decade: '80', root: 220, scale: [0,3,7,10,7,3], bpm: 118, wave: 'sawtooth' },
  { artist: 'Crystal Hearts', title: 'Electric Summer', decade: '80', root: 261.63, scale: [0,4,7,11,7,4], bpm: 124, wave: 'square' },
  { artist: 'Velvet Signal', title: 'After the Rain', decade: '90', root: 196, scale: [0,2,5,9,7,5], bpm: 98, wave: 'triangle' },
  { artist: 'Stereo Motion', title: 'Dancefloor Memory', decade: '90', root: 293.66, scale: [0,3,5,7,10,7], bpm: 132, wave: 'sawtooth' },
  { artist: 'Blue Cassette', title: 'Call Me Tonight', decade: '80', root: 246.94, scale: [0,5,7,12,7,5], bpm: 112, wave: 'square' },
  { artist: 'Digital Lovers', title: 'Satellite Kiss', decade: '90', root: 329.63, scale: [0,2,7,9,7,2], bpm: 126, wave: 'triangle' },
  { artist: 'Chrome Sunset', title: 'Runaway Lights', decade: '80', root: 174.61, scale: [0,4,7,9,7,4], bpm: 121, wave: 'sawtooth' },
  { artist: 'Radio Boulevard', title: 'Forever on Air', decade: '90', root: 233.08, scale: [0,3,7,8,7,3], bpm: 104, wave: 'triangle' },
  { artist: 'Arcade Dreams', title: 'High Score Love', decade: '80', root: 277.18, scale: [0,4,9,11,9,4], bpm: 136, wave: 'square' },
  { artist: 'Moonlight FM', title: 'Last Slow Dance', decade: '90', root: 207.65, scale: [0,3,5,8,7,5], bpm: 92, wave: 'sine' },
  { artist: 'Laser Weekend', title: 'City in Motion', decade: '80', root: 311.13, scale: [0,2,5,7,9,7], bpm: 128, wave: 'sawtooth' },
  { artist: 'Golden Frequency', title: 'One More Night', decade: '90', root: 185, scale: [0,4,7,12,11,7], bpm: 110, wave: 'triangle' }
];

function showScreen(name) {
  Object.values(screens).forEach(el => el.classList.remove('active'));
  screens[name].classList.add('active');
}

function getStats() {
  return JSON.parse(localStorage.getItem('dqc_stats') || '{"best":0,"games":0,"correct":0,"questions":0}');
}

function saveStats() {
  const stats = getStats();
  stats.best = Math.max(stats.best, state.score);
  stats.games += 1;
  stats.correct += state.correct;
  stats.questions += 10;
  localStorage.setItem('dqc_stats', JSON.stringify(stats));
  renderStats();
}

function renderStats() {
  const stats = getStats();
  $('#bestScore').textContent = stats.best;
  $('#gamesPlayed').textContent = stats.games;
  $('#accuracy').textContent = stats.questions ? `${Math.round(stats.correct / stats.questions * 100)}%` : '0%';
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function startGame() {
  Object.assign(state, { round: 0, score: 0, correct: 0, streak: 0, bestStreak: 0, responseTimes: [] });
  showScreen('game');
  nextRound();
}

function nextRound() {
  clearInterval(state.timerId);
  stopAudio();
  if (state.round >= 10) return endGame();
  state.round += 1;
  state.answered = false;
  state.current = tracks[Math.floor(Math.random() * tracks.length)];
  $('#roundLabel').textContent = `Ronda ${state.round}/10`;
  $('#scoreLabel').textContent = `${state.score} puntos`;
  $('#feedback').textContent = '';
  renderAnswers();
  playCurrent();
  startTimer();
}

function renderAnswers() {
  const wrong = shuffle(tracks.filter(t => t.artist !== state.current.artist)).slice(0, 3).map(t => t.artist);
  const options = shuffle([state.current.artist, ...wrong]);
  const container = $('#answers');
  container.innerHTML = '';
  options.forEach((artist, index) => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.textContent = `${String.fromCharCode(65 + index)} · ${artist}`;
    button.dataset.artist = artist;
    button.addEventListener('click', () => answer(artist, button));
    container.appendChild(button);
  });
}

function startTimer() {
  const duration = 10000;
  state.startedAt = performance.now();
  const circumference = 326.72;
  const tick = () => {
    const elapsed = performance.now() - state.startedAt;
    const remaining = Math.max(0, duration - elapsed);
    $('#timerText').textContent = (remaining / 1000).toFixed(1);
    $('#timerProgress').style.strokeDashoffset = circumference * (elapsed / duration);
    if (remaining <= 0) {
      clearInterval(state.timerId);
      answer(null, null);
    }
  };
  tick();
  state.timerId = setInterval(tick, 80);
}

function answer(choice, clickedButton) {
  if (state.answered) return;
  state.answered = true;
  clearInterval(state.timerId);
  stopAudio();
  const elapsed = Math.min(10, (performance.now() - state.startedAt) / 1000);
  state.responseTimes.push(elapsed);
  const isCorrect = choice === state.current.artist;
  document.querySelectorAll('.answer-button').forEach(btn => {
    btn.disabled = true;
    if (btn.dataset.artist === state.current.artist) btn.classList.add('correct');
  });
  if (isCorrect) {
    state.correct += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const speedPoints = Math.round((10 - elapsed) * 80);
    const streakBonus = Math.min(state.streak - 1, 5) * 100;
    const gained = 500 + speedPoints + streakBonus;
    state.score += gained;
    $('#feedback').textContent = `✅ ¡Correcto! +${gained} puntos · ${state.current.title}`;
    if (!state.muted) beep(880, 0.12, 'sine');
  } else {
    state.streak = 0;
    if (clickedButton) clickedButton.classList.add('wrong');
    $('#feedback').textContent = `❌ Era ${state.current.artist} · ${state.current.title}`;
    if (!state.muted) beep(120, 0.18, 'sawtooth');
  }
  $('#scoreLabel').textContent = `${state.score} puntos`;
  setTimeout(nextRound, 1450);
}

function endGame() {
  stopAudio();
  saveStats();
  const avg = state.responseTimes.reduce((a,b) => a+b, 0) / state.responseTimes.length;
  $('#finalScore').textContent = state.score;
  $('#finalCorrect').textContent = `${state.correct}/10`;
  $('#finalStreak').textContent = state.bestStreak;
  $('#finalAverage').textContent = `${avg.toFixed(1)} s`;
  $('#finalTitle').textContent = state.correct >= 9 ? '¡Leyenda musical!' : state.correct >= 7 ? '¡Gran oído!' : state.correct >= 5 ? '¡Buen ritmo!' : '¡Sigue entrenando!';
  showScreen('results');
}

function ensureAudio() {
  if (!state.audio) state.audio = new (window.AudioContext || window.webkitAudioContext)();
  if (state.audio.state === 'suspended') state.audio.resume();
  return state.audio;
}

function midiRatio(semitones) { return Math.pow(2, semitones / 12); }

function playCurrent() {
  if (state.muted) return;
  const ctx = ensureAudio();
  stopAudio();
  state.nodes = [];
  const start = ctx.currentTime + 0.04;
  const beat = 60 / state.current.bpm;
  const randomOffset = Math.floor(Math.random() * state.current.scale.length);
  const noteCount = Math.ceil(10 / (beat / 2)) + 1;
  for (let i = 0; i < noteCount; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const note = state.current.scale[(i + randomOffset) % state.current.scale.length] + (i % 8 === 7 ? 12 : 0);
    osc.type = state.current.wave;
    osc.frequency.value = state.current.root * midiRatio(note);
    gain.gain.setValueAtTime(0.0001, start + i * beat / 2);
    gain.gain.exponentialRampToValueAtTime(0.055, start + i * beat / 2 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + i * beat / 2 + beat * 0.42);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + i * beat / 2);
    osc.stop(start + i * beat / 2 + beat * 0.45);
    state.nodes.push(osc);
  }
  $('.equalizer').classList.add('playing');
}

function stopAudio() {
  if (state.nodes) {
    state.nodes.forEach(node => { try { node.stop(); } catch (_) {} });
    state.nodes = [];
  }
  $('.equalizer')?.classList.remove('playing');
}

function beep(freq, duration, type) {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

$('#startButton').addEventListener('click', startGame);
$('#playAgainButton').addEventListener('click', startGame);
$('#homeButton').addEventListener('click', () => { showScreen('home'); renderStats(); });
$('#replayButton').addEventListener('click', () => { if (!state.answered) playCurrent(); });
$('#soundToggle').addEventListener('click', () => {
  state.muted = !state.muted;
  $('#soundToggle').textContent = state.muted ? '🔇' : '🔊';
  if (state.muted) stopAudio();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
renderStats();
