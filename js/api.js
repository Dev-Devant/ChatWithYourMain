/**
 * api.js — REAL BACKEND (Riot via FastAPI)
 * ==========================================================================
 * Ahora maneja el token JWT devuelto por /api/summoner y lo incluye
 * en las llamadas a /api/chat.
 * ==========================================================================
 */

import { CONFIG } from "./config.js";
import { getChampionById } from "./data/champions.js";

/* -------------------------------------------------------------------------- */
/* Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getServerUrl() {
  const url = "https://chatwithyourmainbackend-production.up.railway.app";
  if (!url) {
    console.warn("⚠️ ServerAPI no definida en window. Revisa el placeholder del build.");
  }
  return url;
}

/**
 * Devuelve la persona de champions.js si existe, o una genérica si no.
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
/* 1. Summoner lookup — devuelve el token                                     */
/* -------------------------------------------------------------------------- */

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
      /* respuesta sin JSON */
    }
    throw new Error(detail);
  }

  const data = await response.json();
  console.log("[api] Respuesta de /api/summoner:", data); // <-- VER EL TOKEN EN CONSOLA

  return {
    name: data.name,
    tagLine: data.tagLine,
    region: data.region || region,
    level: data.level,
    iconId: data.iconId,
    puuid: data.puuid,
    token: data.token,        // <--- GUARDAMOS EL TOKEN
    rank: "—",
    lp: 0,
    topChampions: data.topChampions || [],
  };
}

/* -------------------------------------------------------------------------- */
/* 2. Champion mastery (enriquece con datos locales)                          */
/* -------------------------------------------------------------------------- */

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
/* 3. Chat — envía el token en el header Authorization                        */
/* -------------------------------------------------------------------------- */

export async function sendMessage(championId, history, message, puuid, region, token) {
  console.log("[api] Token enviado en sendMessage:", token); // <-- VER QUE LLEGA

  const baseUrl = getServerUrl();
  if (!baseUrl) {
    throw new Error("El backend no está configurado (ServerAPI).");
  }

  const champion = getChampionOrGeneric(championId);

  let response;
  try {
    response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,   // <--- ENVIAR TOKEN
      },
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

/* -------------------------------------------------------------------------- */
/* 4. Saludar (usa el primer saludo del campeón)                              */
/* -------------------------------------------------------------------------- */

export function getGreeting(championId) {
  const champion = getChampionOrGeneric(championId);
  const greetings = champion.greetings || ["¡Hola! ¿Cómo estás?"];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/* -------------------------------------------------------------------------- */
/* Health check (opcional)                                                    */
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