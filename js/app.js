/**
 * app.js — application controller
 * ==========================================================================
 * Flow:  search (Riot ID real)  ->  champion select  ->  chat (con token)
 * ==========================================================================
 */

import * as api from "./api.js";
import * as ui from "./ui.js";

/* -------------------------------------------------------------------------- */
/* App state                                                                  */
/* -------------------------------------------------------------------------- */

const state = {
  summoner: null,          // incluye token
  activeChampionId: null,
  history: [],
  busy: false,
};

/* -------------------------------------------------------------------------- */
/* Step 1 — Search                                                            */
/* -------------------------------------------------------------------------- */

async function handleSearch(event) {
  event.preventDefault();
  if (state.busy) return;

  const riotId = ui.$("#summoner-input").value;
  const region = ui.$("#region-select").value;

  if (!riotId.trim()) {
    ui.setSearchMessage('Escribe tu Riot ID completo, ej. "Hide on bush#KR1".', "error");
    return;
  }

  state.busy = true;
  ui.setSearchLoading(true);
  ui.setSearchMessage("Conectando con la Grieta…", "info");

  try {
    // searchSummoner ahora devuelve el token
    const summoner = await api.searchSummoner(riotId, region);
    const champions = await api.getTopChampions(summoner);

    state.summoner = summoner;   // guardamos todo (incluido token)
    ui.setSearchMessage("", "");

    ui.renderSummonerCard(summoner);
    ui.renderChampionGrid(champions, handleChampionSelect);
    ui.showView("view-select");
  } catch (error) {
    ui.setSearchMessage(error.message, "error");
  } finally {
    state.busy = false;
    ui.setSearchLoading(false);
  }
}

/* -------------------------------------------------------------------------- */
/* Step 2 — Champion select                                                   */
/* -------------------------------------------------------------------------- */

function handleChampionSelect(championId) {
  const champion = api.getChampionOrGeneric(championId);
  if (!champion) return;

  state.activeChampionId = championId;
  state.history = [];

  ui.renderChatHeader(champion);
  ui.clearChatLog();
  ui.showView("view-chat");

  const greeting = api.getGreeting(championId);
  ui.setTyping(true);
  window.setTimeout(() => {
    ui.setTyping(false);
    ui.appendMessage("champion", greeting, champion);
    state.history.push({ role: "champion", text: greeting });
    ui.$("#chat-input").focus();
  }, 900);
}

/* -------------------------------------------------------------------------- */
/* Step 3 — Chat (envía el token)                                            */
/* -------------------------------------------------------------------------- */

async function handleChatSubmit(event) {
  event.preventDefault();
  if (state.busy || !state.activeChampionId) return;

  const input = ui.$("#chat-input");
  const message = input.value.trim();
  if (!message) return;

  const champion = api.getChampionOrGeneric(state.activeChampionId);

  ui.appendMessage("user", message);
  state.history.push({ role: "user", text: message });
  input.value = "";

  state.busy = true;
  ui.setTyping(true);

  try {
    // Obtenemos el token del summoner guardado
    const token = state.summoner?.token;
    if (!token) {
      throw new Error("No hay token de autenticación. Vuelve a buscar al invocador.");
    }

    const { text } = await api.sendMessage(
      state.activeChampionId,
      state.history,
      message,
      state.summoner?.puuid,
      state.summoner?.region,
      token   // <--- PASAMOS EL TOKEN
    );

    ui.setTyping(false);
    ui.appendMessage("champion", text, champion);
    state.history.push({ role: "champion", text });
  } catch (error) {
    ui.setTyping(false);
    ui.appendMessage("champion", `(error) ${error.message}`, champion);
  } finally {
    state.busy = false;
    input.focus();
  }
}

/* -------------------------------------------------------------------------- */
/* Navigation (back buttons)                                                  */
/* -------------------------------------------------------------------------- */

function handleNavClick(event) {
  const trigger = event.target.closest("[data-action]");
  if (!trigger) return;

  switch (trigger.dataset.action) {
    case "back-to-search":
      state.summoner = null;
      ui.showView("view-search");
      ui.$("#summoner-input").focus();
      break;
    case "back-to-select":
      state.activeChampionId = null;
      state.history = [];
      document.documentElement.style.removeProperty("--accent");
      ui.showView("view-select");
      break;
  }
}

/* -------------------------------------------------------------------------- */
/* Bootstrap                                                                  */
/* -------------------------------------------------------------------------- */

function init() {
  ui.$("#search-form").addEventListener("submit", handleSearch);
  ui.$("#chat-form").addEventListener("submit", handleChatSubmit);
  document.addEventListener("click", handleNavClick);

  ui.$("#summoner-input").focus();

  console.log("[app] Chat With Your Main — backend real conectado ✦");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/* -------------------------------------------------------------------------- */
/* Efecto de salpicadura de pintura (sin cambios)                             */
/* -------------------------------------------------------------------------- */
document.addEventListener("click", function (event) {
  const particleCount = 16;
  const colors = ["#36d1dc", "#ff3fa4", "#7c5cff", "#ffd84d", "#2fe089"];
  const container = document.body;
  const x = event.clientX;
  const y = event.clientY;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.className = "paint-particle";
    const size = 6 + Math.random() * 16;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = Math.random() * 2 * Math.PI;
    const distance = 60 + Math.random() * 180;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? "50%" : "40% 60% 30% 70% / 50% 40% 60% 50%"};
      box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      transition: none;
      transform: translate(0, 0) scale(1);
    `;

    container.appendChild(particle);

    const startTime = performance.now();
    const duration = 600 + Math.random() * 400;

    function animateParticle(time) {
      const elapsed = (time - startTime) / duration;
      if (elapsed >= 1) {
        particle.remove();
        return;
      }
      const progress = 1 - Math.pow(1 - elapsed, 1.5);
      const currentX = x + dx * progress;
      const currentY = y + dy * progress;
      const scale = 1 - progress * 0.6;
      const opacity = 1 - progress * 0.9;

      particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px) scale(${scale})`;
      particle.style.opacity = opacity;

      requestAnimationFrame(animateParticle);
    }

    setTimeout(() => {
      requestAnimationFrame(animateParticle);
    }, Math.random() * 80);
  }
});