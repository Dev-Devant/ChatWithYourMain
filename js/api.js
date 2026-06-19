/**
 * api.js — SIMULATED BACKEND
 * ==========================================================================
 * Every function here MOCKS a server call. The signatures and return shapes
 * are intentionally close to what a real implementation would look like, so
 * swapping the internals for actual `fetch()` calls is a drop-in change.
 *
 * WHERE THE REAL WORK GOES (your TODO list):
 *   1. searchSummoner()  -> Riot Account-V1 + Summoner-V4 endpoints.
 *   2. getTopChampions() -> Riot Champion-Mastery-V4 endpoint.
 *   3. sendMessage()     -> your LLM endpoint (OpenAI, AI SDK, etc.) seeded
 *                           with the champion persona from champions.js.
 *
 * Riot calls MUST be proxied through a server you control — never expose your
 * RIOT_API_KEY in the browser. The mock keeps everything client-side on
 * purpose so the demo runs with zero configuration.
 * ==========================================================================
 */

import { CONFIG } from "./config.js";
import { CHAMPIONS, getChampionById } from "./data/champions.js";

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Resolve after a randomized, human-feeling delay to mimic network latency. */
function fakeDelay() {
  const { min, max } = CONFIG.FAKE_LATENCY;
  const ms = Math.round(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Deterministic pseudo-random integer from a string seed (stable per name). */
function seededInt(seed, max) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash) % max;
}

/** Pick a random element from an array. */
function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const RANKS = [
  "Hierro", "Bronce", "Plata", "Oro", "Platino",
  "Esmeralda", "Diamante", "Maestro", "Gran Maestro", "Retador",
];

/* -------------------------------------------------------------------------- */
/* 1. Summoner lookup                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Look up a summoner by name + region.
 *
 * @param {string} name   - Summoner / Riot ID game name.
 * @param {string} region - Platform routing value (LAN, NA, EUW, …).
 * @returns {Promise<{
 *   name: string, region: string, level: number, iconId: number,
 *   rank: string, lp: number
 * }>}
 * @throws {Error} when the summoner "doesn't exist" (type the word "notfound").
 *
 * TODO(real): fetch(`/api/summoner?name=${name}&region=${region}`) which on the
 * server calls Riot Account-V1 (by-riot-id) then Summoner-V4 (by-puuid).
 */
export async function searchSummoner(name, region) {
  await fakeDelay();

  const clean = name.trim();
  if (!clean) {
    throw new Error("Escribe un nombre de invocador.");
  }

  // Simulate a "not found" path so the UI can show error states.
  if (clean.toLowerCase() === "notfound") {
    throw new Error(`No encontramos a "${clean}" en ${region}. ¿Revisaste la región?`);
  }

  const seed = `${clean}-${region}`;
  return {
    name: clean,
    region,
    level: 30 + seededInt(seed, 970), // 30 – 999
    iconId: 1 + seededInt(seed + "icon", 28), // Data Dragon has icons 0..N
    rank: RANKS[seededInt(seed + "rank", RANKS.length)],
    lp: seededInt(seed + "lp", 100),
  };
}

/* -------------------------------------------------------------------------- */
/* 2. Champion mastery                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Return the summoner's most-played champions, highest mastery first.
 *
 * @param {{ name: string, region: string }} summoner
 * @returns {Promise<Array<{
 *   id: string, name: string, title: string, role: string, accent: string,
 *   masteryLevel: number, masteryPoints: number
 * }>>}
 *
 * TODO(real): call Champion-Mastery-V4 (top by puuid), then map Riot's
 * numeric championId to Data Dragon keys via the champion.json manifest.
 */
export async function getTopChampions(summoner) {
  await fakeDelay();

  const seed = `${summoner.name}-${summoner.region}`;

  // Deterministically shuffle the champion pool so the same summoner always
  // gets the same "mains" — feels real across reloads.
  const ordered = [...CHAMPIONS]
    .map((champ, index) => ({
      champ,
      sortKey: seededInt(seed + champ.id + index, 100000),
    }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((entry) => entry.champ)
    .slice(0, CONFIG.TOP_CHAMPIONS_COUNT);

  // Attach descending, believable mastery numbers.
  return ordered.map((champ, index) => {
    const basePoints = 350000 - index * 42000 - seededInt(seed + champ.id, 20000);
    return {
      id: champ.id,
      name: champ.name,
      title: champ.title,
      role: champ.role,
      accent: champ.accent,
      masteryLevel: Math.max(4, 7 - Math.floor(index / 2)),
      masteryPoints: Math.max(12000, basePoints),
    };
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Chat                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Generate a reply from a champion, in character.
 *
 * @param {string} championId - Data Dragon key of the active champion.
 * @param {Array<{ role: "user" | "champion", text: string }>} history
 * @param {string} message    - The latest user message.
 * @returns {Promise<{ text: string }>}
 *
 * TODO(real): POST to your LLM endpoint with a system prompt built from the
 * champion `persona`, plus the running `history`, e.g.:
 *
 *   await fetch("/api/chat", {
 *     method: "POST",
 *     body: JSON.stringify({ system: champion.persona, history, message }),
 *   });
 */
export async function sendMessage(championId, history, message) {
  await fakeDelay();

  const champion = getChampionById(championId);
  if (!champion) {
    throw new Error("Campeón desconocido.");
  }

  const text = mockReply(champion, message, history);
  return { text };
}

/**
 * Greeting shown automatically when a chat opens.
 * @param {string} championId
 * @returns {string}
 */
export function getGreeting(championId) {
  const champion = getChampionById(championId);
  return champion ? sample(champion.greetings) : "…";
}

/* -------------------------------------------------------------------------- */
/* Mock reply engine (replace with a real LLM)                                */
/* -------------------------------------------------------------------------- */

/**
 * Tiny rule-based responder. It looks for a few intents (greeting, question,
 * thanks, farewell) and otherwise serves a flavorful in-character line. This
 * exists ONLY to make the demo feel alive — it is NOT meant to be smart.
 */
function mockReply(champion, message, history) {
  const msg = message.toLowerCase();

  const has = (...words) => words.some((w) => msg.includes(w));

  // Specific intents first, generic greeting last, so "hola, ¿quién eres?"
  // resolves to the identity answer rather than just another greeting.
  if (has("quién eres", "quien eres", "qué eres", "que eres", "tu nombre")) {
    return `Soy ${champion.name}, ${champion.title}. ${sample(champion.lines)}`;
  }
  if (has("hola", "buenas", "hey", "saludos")) {
    return sample(champion.greetings);
  }
  if (has("gracias", "thx", "genial", "crack")) {
    return sample([
      "Cuando quieras.",
      "Para eso estoy.",
      ...champion.lines,
    ]);
  }
  if (has("adios", "chau", "nos vemos", "bye")) {
    return sample([
      "Nos vemos en la Grieta.",
      "Hasta la próxima partida.",
    ]);
  }
  if (msg.includes("?") || has("cómo", "como", "por qué", "porque", "qué", "que")) {
    // A question — answer with a fallback + a flavor line.
    return `${sample(champion.fallbacks)} ${sample(champion.lines)}`;
  }

  // First couple of messages get more personality, later ones get variety.
  if (history.length < 2) {
    return sample(champion.lines);
  }
  return sample([...champion.lines, ...champion.fallbacks]);
}


// ============================================================
// PRUEBA DE CONEXIÓN AL BACKEND (health check)
// ============================================================
async function testBackendHealth() {
  try {
    const response = await fetch('/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend conectado:', data);
      // Opcional: mostrar un mensaje en la UI
      const msg = document.getElementById('search-message');
      if (msg) {
        msg.textContent = '✅ Backend online';
        msg.className = 'search__feedback search__feedback--info';
        setTimeout(() => { msg.textContent = ''; msg.className = 'search__feedback'; }, 3000);
      }
    } else {
      console.warn('⚠️ Backend no responde (status:', response.status, ')');
    }
  } catch (error) {
    console.error('❌ Error al conectar con el backend:', error);
    // Opcional: mostrar error en UI
    const msg = document.getElementById('search-message');
    if (msg) {
      msg.textContent = '❌ No se pudo conectar al servidor';
      msg.className = 'search__feedback search__feedback--error';
    }
  }
}

// Dentro de la función init(), añade:
function init() {
  // ... tu código existente ...
  // Al final:
  testBackendHealth();
}