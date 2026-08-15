// ============================================================
// app.js — screen navigation + game state machine
//
// Plain script (no ES modules) so the game also runs when
// index.html is opened directly by double-click. Loaded last,
// after cards.js / wheel.js / playerChance.js have populated
// the shared window.MIL namespace.
// ============================================================
const { drawCard, getCategoryById, SpinWheel, PlayerChance } = window.MIL;

// ---------- element refs ----------
const screens = new Map(
  Array.from(document.querySelectorAll('.screen')).map((el) => [el.dataset.screen, el])
);
const homeBtn = document.getElementById('homeBtn');
const roundPill = document.getElementById('roundPill');
const roundPillText = document.getElementById('roundPillText');

const splashTapTarget = document.getElementById('splashTapTarget');

const btnPlay = document.getElementById('btnPlay');
const btnMultiplayer = document.getElementById('btnMultiplayer');
const btnTutorial = document.getElementById('btnTutorial');
const btnPolicy = document.getElementById('btnPolicy');

const playerCountButtons = document.querySelectorAll('[data-players]');

const chanceLabel = document.getElementById('chanceLabel');
const chanceStatus = document.getElementById('chanceStatus');
const chancePad = document.getElementById('chancePad');
const chancePadHint = document.getElementById('chancePadHint');
const chanceRetry = document.getElementById('chanceRetry');

const turnBadge = document.getElementById('turnBadge');
const btnSpin = document.getElementById('btnSpin');
const wheelEl = document.getElementById('wheel');
const wheelResult = document.getElementById('wheelResult');

const categoryPill = document.getElementById('categoryPill');
const cardImage = document.getElementById('cardImage');
const btnNextTurn = document.getElementById('btnNextTurn');

// Screens that show the persistent round pill / home button.
const GAMEPLAY_SCREENS = new Set(['playerChance', 'wheel', 'card']);
const NO_HOME_SCREENS = new Set(['splash', 'menu']);

// ---------- state ----------
const state = {
  mode: null, // 'single' | 'multi'
  playerCount: 4,
  round: 1,
  currentTurn: null, // { name, hex, dark } from PlayerChance, multiplayer only
};

const wheel = new SpinWheel(wheelEl);
const playerChance = new PlayerChance({
  pad: chancePad,
  hint: chancePadHint,
  status: chanceStatus,
  retryBtn: chanceRetry,
});

// ---------- screen manager ----------
function showScreen(name) {
  screens.forEach((el, key) => {
    el.classList.toggle('active', key === name);
  });
  homeBtn.hidden = NO_HOME_SCREENS.has(name);
  roundPill.hidden = !GAMEPLAY_SCREENS.has(name);
  if (GAMEPLAY_SCREENS.has(name)) {
    roundPillText.textContent = `Round ${state.round}`;
  }
  const active = screens.get(name);
  if (active) active.scrollTop = 0;
}

// ---------- navigation wiring ----------
splashTapTarget.addEventListener('click', () => showScreen('menu'));

btnPlay.addEventListener('click', () => {
  state.mode = 'single';
  state.round = 1;
  state.currentTurn = null;
  showScreen('wheel');
});

btnMultiplayer.addEventListener('click', () => showScreen('playerCount'));
btnTutorial.addEventListener('click', () => showScreen('tutorial'));
btnPolicy.addEventListener('click', () => showScreen('policy'));

playerCountButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    state.mode = 'multi';
    state.playerCount = Number(btn.dataset.players);
    state.round = 1;
    startPlayerChance();
  });
});

homeBtn.addEventListener('click', () => {
  state.mode = null;
  state.currentTurn = null;
  showScreen('menu');
});

// ---------- player chance ----------
function startPlayerChance() {
  showScreen('playerChance');
  chanceLabel.textContent = 'Tap together!';
  playerChance.start(state.playerCount).then((winnerColor) => {
    state.currentTurn = winnerColor;
    showScreen('wheel');
    updateTurnBadge();
  });
}

function updateTurnBadge() {
  if (state.mode === 'multi' && state.currentTurn) {
    turnBadge.hidden = false;
    turnBadge.textContent = `${state.currentTurn.name}'s turn to spin`;
    turnBadge.style.background = state.currentTurn.hex;
    turnBadge.style.color = '#fff';
  } else {
    turnBadge.hidden = true;
  }
}

// ---------- spin wheel ----------
btnSpin.addEventListener('click', async () => {
  btnSpin.disabled = true;
  wheelResult.textContent = 'Spinning…';
  const winner = await wheel.spin();
  wheelResult.textContent = `${winner.name}!`;
  setTimeout(() => {
    showCard(winner.id);
    btnSpin.disabled = false;
  }, 900);
});

// ---------- card reveal ----------
function showCard(categoryId) {
  const card = drawCard(categoryId);
  cardImage.src = card.src;
  cardImage.alt = card.alt;
  categoryPill.textContent = card.category.name;
  categoryPill.style.background = card.category.hex;
  categoryPill.style.boxShadow = `0 4px 0 ${card.category.hexDark}`;
  wheelResult.textContent = '\u00A0';
  showScreen('card');
}

btnNextTurn.addEventListener('click', () => {
  state.round += 1;
  if (state.mode === 'multi') {
    startPlayerChance();
  } else {
    showScreen('wheel');
  }
});

// ---------- warm up card images a touch ahead of time ----------
function preloadFirstCovers() {
  ['icbr', 'ai-lang', 'deepfake', 'mi'].forEach((id) => {
    const category = getCategoryById(id);
    const img = new Image();
    img.src = `assets/cards/${category.folder}/q1.webp`;
  });
}
preloadFirstCovers();

// ---------- initial screen ----------
showScreen('splash');
