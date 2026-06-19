/**
 * api.js — REAL BACKEND (Riot via FastAPI) + chat simulado
 * ==========================================================================
 * searchSummoner()   -> POST {baseUrl}/api/summoner  (Riot real, vía tu backend)
 * getTopChampions()  -> usa el array topChampions que ya viene en la respuesta
 *                        de /api/summoner, enriquecido con persona local.
 * sendMessage()      -> sigue simulado hasta que conectes tu endpoint de IA.
 * ==========================================================================
 */

import { CONFIG } from "./config.js";
import { CHAMPIONS, getChampionById } from "./data/champions.js";

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

function fakeDelay() {
  const { min, max } = CONFIG.FAKE_LATENCY;
  const ms = Math.round(min + Math.random() * (max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getServerUrl() {
  const url = "https://chatwithyourmainbackend-production.up.railway.app";
  if (!url) {
    console.warn("⚠️ ServerAPI no definida en window. Revisa el placeholder del build.");
  }
  return url;
}

/**
 * Devuelve la persona de champions.js si existe, o una genérica si el
 * campeón con más maestría del invocador no está en nuestra lista de 9.
 * @param {string} id - Data Dragon key, ej "Garen".
 */
export function getChampionOrGeneric(id) {
  const champ = getChampionById(id);
  if (champ) return champ;

  return {
    id,
    name: id,
    title: "Campeón de la Grieta",
    role: "Desconocido",
    accent: "#36d1dc",
    persona: "Un campeón de League of Legends con personalidad propia, todavía sin guion detallado.",
    greetings: [
      `¡Hola! Soy ${id}. ¿En qué te puedo ayudar?`,
      `Hola, invocador. Listo para charlar.`,
    ],
    lines: [
      "Cada partida es una nueva oportunidad.",
      "La Grieta no perdona errores.",
      "Sigamos jugando, no hay tiempo que perder.",
    ],
    fallbacks: ["Interesante.", "Cuéntame más."],
  };
}

/* -------------------------------------------------------------------------- */
/* 1. Summoner lookup (REAL)                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Busca un Riot ID completo ("Nombre#TAG") contra tu backend, que a su vez
 * llama Account-V1 + Summoner-V4 + Champion-Mastery-V4.
 *
 * @param {string} riotId - ej "Hide on bush#KR1"
 * @param {string} region - LAN, LAS, NA, EUW, EUNE, KR, BR
 */
export async function searchSummoner(riotId, region) {
  const clean = riotId.trim();

  if (!clean) {
    throw new Error("Escribe tu Riot ID completo.");
  }
  if (!clean.includes("#")) {
    throw new Error('Usa el formato "Nombre#TAG" (tu Riot ID completo, ej. Hide on bush#KR1).');
  }

  const baseUrl = getServerUrl();
  if (!baseUrl) {
    throw new Error("El backend no está configurado (ServerAPI).");
  }

  let response;
  try {
    response = await fetch(`${baseUrl}/api/summoner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summoner_name: clean, region }),
    });
  } catch (networkError) {
    throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
  }

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* respuesta sin JSON, nos quedamos con el status */
    }
    throw new Error(detail);
  }

  const data = await response.json();

  return {
      name: data.name,
      tagLine: data.tagLine,
      region: data.region || region,
      level: data.level,
      iconId: data.iconId,
      puuid: data.puuid,
      rank: "—",
      lp: 0,
      topChampions: data.topChampions || [],
    };
}

/* -------------------------------------------------------------------------- */
/* 2. Champion mastery (REAL, ya viene en searchSummoner)                    */
/* -------------------------------------------------------------------------- */

/**
 * No vuelve a llamar al backend: toma el `topChampions` que ya trajo
 * searchSummoner() y lo enriquece con la persona local (o una genérica).
 *
 * @param {{ topChampions: Array<{id:string, championPoints:number, championLevel:number}> }} summoner
 */
export async function getTopChampions(summoner) {
  const raw = summoner.topChampions || [];

  if (!raw.length) {
    throw new Error("No encontramos campeones con maestría para este invocador.");
  }

  return raw.slice(0, CONFIG.TOP_CHAMPIONS_COUNT).map((entry) => {
    const champ = getChampionOrGeneric(entry.id);
    return {
      id: champ.id,
      name: champ.name,
      title: champ.title,
      role: champ.role,
      accent: champ.accent,
      masteryLevel: entry.masteryLevel ?? entry.championLevel,
      masteryPoints: entry.masteryPoints ?? entry.championPoints,
    };
  });
}

/* -------------------------------------------------------------------------- */
/* 3. Chat (REAL — vía /api/chat)                                            */
/* -------------------------------------------------------------------------- */

export async function sendMessage(championId, history, message, puuid, region) {
  const baseUrl = getServerUrl();
  if (!baseUrl) {
    throw new Error("El backend no está configurado (ServerAPI).");
  }

  const champion = getChampionOrGeneric(championId);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        championId: champion.id,
        championName: champion.name,
        championTitle: champion.title,
        persona: champion.persona,
        history,
        message,
        puuid,
        region,
      }),
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
  }

  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const body = await response.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* sin JSON en la respuesta */
    }
    throw new Error(detail);
  }

  const data = await response.json();
  return { text: data.text };
}

export function getGreeting(championId) {
  const champion = getChampionOrGeneric(championId);
  return sample(champion.greetings);
}

function mockReply(champion, message, history) {
  const msg = message.toLowerCase();
  const has = (...words) => words.some((w) => msg.includes(w));

  if (has("quién eres", "quien eres", "qué eres", "que eres", "tu nombre")) {
    return `Soy ${champion.name}, ${champion.title}. ${sample(champion.lines)}`;
  }
  if (has("hola", "buenas", "hey", "saludos")) {
    return sample(champion.greetings);
  }
  if (has("gracias", "thx", "genial", "crack")) {
    return sample(["Cuando quieras.", "Para eso estoy.", ...champion.lines]);
  }
  if (has("adios", "chau", "nos vemos", "bye")) {
    return sample(["Nos vemos en la Grieta.", "Hasta la próxima partida."]);
  }
  if (msg.includes("?") || has("cómo", "como", "por qué", "porque", "qué", "que")) {
    return `${sample(champion.fallbacks)} ${sample(champion.lines)}`;
  }
  if (history.length < 2) {
    return sample(champion.lines);
  }
  return sample([...champion.lines, ...champion.fallbacks]);
}

/* -------------------------------------------------------------------------- */
/* Health check                                                               */
/* -------------------------------------------------------------------------- */

export async function checkHealth() {
  const baseUrl = getServerUrl();
  if (!baseUrl) {
    throw new Error("ServerAPI no configurada.");
  }
  const response = await fetch(`${baseUrl}/health`);
  if (!response.ok) {
    throw new Error(`Health check falló: ${response.status}`);
  }
  return response.json();
}