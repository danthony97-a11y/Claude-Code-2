/* ============================================================
   Pocket Battle — a tiny turn-based monster battler
   No dependencies. Pure HTML/CSS/JS.
   ============================================================ */

// ---- Type effectiveness chart (attacker -> defender) ----
const TYPES = ["fire", "water", "grass", "electric", "normal"];
const EFFECT = {
  fire:     { grass: 2,  water: 0.5, fire: 0.5 },
  water:    { fire: 2,   grass: 0.5, water: 0.5 },
  grass:    { water: 2,  fire: 0.5,  grass: 0.5 },
  electric: { water: 2,  grass: 0.5, electric: 0.5 },
  normal:   {},
};

function effectiveness(moveType, defType) {
  const row = EFFECT[moveType] || {};
  return row[defType] ?? 1;
}

// ---- Move pool ----
const MOVES = {
  ember:      { name: "Ember",       type: "fire",     power: 40 },
  flamethrow: { name: "Flamethrower",type: "fire",     power: 55 },
  watergun:   { name: "Water Gun",   type: "water",    power: 40 },
  bubble:     { name: "Bubble Beam", type: "water",    power: 55 },
  vinewhip:   { name: "Vine Whip",   type: "grass",    power: 40 },
  leaf:       { name: "Razor Leaf",  type: "grass",    power: 55 },
  spark:      { name: "Spark",       type: "electric", power: 40 },
  thunder:    { name: "Thunderbolt", type: "electric", power: 55 },
  tackle:     { name: "Tackle",      type: "normal",   power: 35 },
  quickatk:   { name: "Quick Attack",type: "normal",   power: 45 },
};

// ---- Species ----
const SPECIES = {
  Charmander: { emoji: "🦎", type: "fire",     moves: ["ember", "flamethrow", "tackle", "quickatk"] },
  Squirtle:   { emoji: "🐢", type: "water",    moves: ["watergun", "bubble", "tackle", "quickatk"] },
  Bulbasaur:  { emoji: "🌱", type: "grass",    moves: ["vinewhip", "leaf", "tackle", "quickatk"] },
  Pikachu:    { emoji: "⚡", type: "electric", moves: ["spark", "thunder", "tackle", "quickatk"] },
  Rattata:    { emoji: "🐀", type: "normal",   moves: ["tackle", "quickatk", "tackle", "quickatk"] },
  Magikarp:   { emoji: "🐟", type: "water",    moves: ["tackle", "watergun", "tackle", "tackle"] },
  Geodude:    { emoji: "🪨", type: "normal",   moves: ["tackle", "quickatk", "tackle", "quickatk"] },
};

const STARTERS = ["Charmander", "Squirtle", "Bulbasaur", "Pikachu"];
const WILD_POOL = ["Rattata", "Magikarp", "Geodude", "Charmander", "Squirtle", "Bulbasaur", "Pikachu"];

// ---- State ----
const state = {
  player: null,
  foe: null,
  busy: false,
  wins: 0,
  losses: 0,
};

// ---- Helpers ----
const $ = (id) => document.getElementById(id);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const choice = (arr) => arr[rand(0, arr.length - 1)];

function makeMon(speciesName, level) {
  const sp = SPECIES[speciesName];
  const maxHp = 24 + level * 6;
  return {
    species: speciesName,
    emoji: sp.emoji,
    type: sp.type,
    level,
    maxHp,
    hp: maxHp,
    atk: 8 + level * 2,
    moves: sp.moves,
  };
}

function damage(attacker, defender, move) {
  const eff = effectiveness(move.type, defender.type);
  const stab = move.type === attacker.type ? 1.5 : 1; // same-type bonus
  const variance = rand(85, 100) / 100;
  const base = (move.power * attacker.atk) / (defender.level * 4 + 20);
  const dmg = Math.max(1, Math.round(base * eff * stab * variance));
  return { dmg, eff };
}

// ---- Rendering ----
function log(msg, sys = false) {
  const el = $("log");
  const p = document.createElement("p");
  if (sys) p.className = "sys";
  p.textContent = msg;
  el.appendChild(p);
  el.scrollTop = el.scrollHeight;
}

function renderBars() {
  const set = (who, mon) => {
    $(`${who}-name`).textContent = mon.species;
    $(`${who}-lvl`).textContent = "Lv" + mon.level;
    $(`${who}-sprite`).textContent = mon.emoji;
    const pct = Math.max(0, (mon.hp / mon.maxHp) * 100);
    const fill = $(`${who}-hpfill`);
    fill.style.width = pct + "%";
    fill.style.background =
      pct > 50 ? "var(--hp-good)" : pct > 20 ? "var(--hp-mid)" : "var(--hp-low)";
    $(`${who}-hptext`).textContent = `${Math.max(0, mon.hp)}/${mon.maxHp} HP`;
    $(`${who}-sprite`).classList.toggle("fainted", mon.hp <= 0);
  };
  set("you", state.player);
  set("foe", state.foe);
}

function renderMoves() {
  const box = $("moves");
  box.innerHTML = "";
  const seen = new Set();
  state.player.moves.forEach((key) => {
    if (seen.has(key)) return; // collapse duplicate slots
    seen.add(key);
    const mv = MOVES[key];
    const btn = document.createElement("button");
    btn.innerHTML = `${mv.name}<span class="mtype">${mv.type} · ${mv.power} pw</span>`;
    btn.onclick = () => playerTurn(key);
    box.appendChild(btn);
  });
}

function effText(eff) {
  if (eff > 1) return "It's super effective!";
  if (eff < 1) return "It's not very effective…";
  return "";
}

function shake(who) {
  const s = $(`${who}-sprite`);
  s.classList.add("hit");
  setTimeout(() => s.classList.remove("hit"), 360);
}

function setBusy(b) {
  state.busy = b;
  document.querySelectorAll("#moves button, #run-btn").forEach((el) => (el.disabled = b));
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Turn flow ----
async function playerTurn(moveKey) {
  if (state.busy || state.player.hp <= 0 || state.foe.hp <= 0) return;
  setBusy(true);

  const move = MOVES[moveKey];
  const { dmg, eff } = damage(state.player, state.foe, move);
  state.foe.hp -= dmg;
  log(`${state.player.species} used ${move.name}!`);
  shake("foe");
  await wait(450);
  renderBars();
  const et = effText(eff);
  if (et) log(et, true);

  if (state.foe.hp <= 0) {
    await wait(500);
    return winBattle();
  }

  await wait(650);
  await foeTurn();
}

async function foeTurn() {
  const moveKey = choice(state.foe.moves);
  const move = MOVES[moveKey];
  const { dmg, eff } = damage(state.foe, state.player, move);
  state.player.hp -= dmg;
  log(`Wild ${state.foe.species} used ${move.name}!`);
  shake("you");
  await wait(450);
  renderBars();
  const et = effText(eff);
  if (et) log(et, true);

  if (state.player.hp <= 0) {
    await wait(500);
    return loseBattle();
  }
  setBusy(false);
}

function endControls() {
  setBusy(true);
  $("run-btn").classList.add("hidden");
  $("next-btn").classList.remove("hidden");
}

function winBattle() {
  log(`Wild ${state.foe.species} fainted! You win! 🎉`, true);
  state.wins++;
  // Level up reward
  if (state.player.level < 50) {
    state.player.level++;
    const healed = makeMon(state.player.species, state.player.level);
    const ratio = state.player.hp / state.player.maxHp;
    state.player.maxHp = healed.maxHp;
    state.player.atk = healed.atk;
    state.player.hp = Math.round(healed.maxHp * Math.max(ratio, 0.5)); // partial heal on level up
    log(`${state.player.species} grew to Lv${state.player.level}!`, true);
    renderBars();
  }
  updateRecord();
  endControls();
}

function loseBattle() {
  log(`${state.player.species} fainted… You lose.`, true);
  state.losses++;
  log("Your partner is fully healed for the next battle.", true);
  updateRecord();
  endControls();
}

function updateRecord() {
  $("record").textContent = `Wins: ${state.wins} · Losses: ${state.losses}`;
}

// ---- Encounters ----
function startEncounter() {
  // Heal player between battles, scale foe near player's level.
  state.player.hp = state.player.maxHp;
  const lvl = Math.max(2, state.player.level + rand(-1, 1));
  state.foe = makeMon(choice(WILD_POOL), lvl);

  $("log").innerHTML = "";
  log(`A wild ${state.foe.species} appeared!`, true);
  $("next-btn").classList.add("hidden");
  $("run-btn").classList.remove("hidden");
  renderBars();
  renderMoves();
  setBusy(false);
}

function runAway() {
  if (state.busy) return;
  // 75% chance to escape
  if (Math.random() < 0.75) {
    log("Got away safely!", true);
    endControls();
  } else {
    log("Couldn't escape!", true);
    setBusy(true);
    foeTurn();
  }
}

// ---- Setup ----
function buildStarterScreen() {
  const list = $("starter-list");
  STARTERS.forEach((name) => {
    const sp = SPECIES[name];
    const card = document.createElement("div");
    card.className = "starter-card";
    card.innerHTML = `
      <div class="emoji">${sp.emoji}</div>
      <div class="sname">${name}</div>
      <div class="stype">${sp.type}</div>`;
    card.onclick = () => pickStarter(name);
    list.appendChild(card);
  });
}

function pickStarter(name) {
  state.player = makeMon(name, 5);
  $("select-screen").classList.remove("active");
  $("battle-screen").classList.add("active");
  startEncounter();
}

// ---- Wire up ----
$("run-btn").onclick = runAway;
$("next-btn").onclick = startEncounter;
buildStarterScreen();
