/**
 * app.js — application controller
 * ==========================================================================
 * The entry point loaded by index.html. It wires DOM events to the simulated
 * backend (api.js) and the renderer (ui.js), and holds the small amount of
 * client state we need (current summoner, active champion, chat history).
 *
 * Flow:  search  ->  champion select  ->  chat
 * ==========================================================================
 */

import * as api from "./api.js";
import * as ui from "./ui.js";
import { getChampionById } from "./data/champions.js";

/* -------------------------------------------------------------------------- */
/* App state                                                                  */
/* -------------------------------------------------------------------------- */

const state = {
  /** @type {object|null} */ summoner: null,
  /** @type {string|null} */ activeChampionId: null,
  /** @type {Array<{role:"user"|"champion", text:string}>} */ history: [],
  /** Guards against double-sending while a reply is in flight. */ busy: false,
};

/* -------------------------------------------------------------------------- */
/* Step 1 — Search                                                            */
/* -------------------------------------------------------------------------- */

async function handleSearch(event) {
  event.preventDefault();
  if (state.busy) return;

  const name = ui.$("#summoner-input").value;
  const region = ui.$("#region-select").value;

  if (!name.trim()) {
    ui.setSearchMessage("Escribe un nombre de invocador para empezar.", "error");
    return;
  }

  state.busy = true;
  ui.setSearchLoading(true);
  ui.setSearchMessage("Conectando con la Grieta…", "info");

  try {
    // 1) Resolve the summoner, 2) fetch their most-played champions.
    const summoner = await api.searchSummoner(name, region);
    const champions = await api.getTopChampions(summoner);

    state.summoner = summoner;
    ui.setSearchMessage("", "");

    // Paint the champion-select screen and move to it.
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
  const champion = getChampionById(championId);
  if (!champion) return;

  state.activeChampionId = championId;
  state.history = [];

  // Build the chat shell.
  ui.renderChatHeader(champion);
  ui.clearChatLog();
  ui.showView("view-chat");

  // Champion greets first, with a natural typing delay.
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
/* Step 3 — Chat                                                              */
/* -------------------------------------------------------------------------- */

async function handleChatSubmit(event) {
  event.preventDefault();
  if (state.busy || !state.activeChampionId) return;

  const input = ui.$("#chat-input");
  const message = input.value.trim();
  if (!message) return;

  const champion = getChampionById(state.activeChampionId);

  // Optimistically render the user's message.
  ui.appendMessage("user", message);
  state.history.push({ role: "user", text: message });
  input.value = "";

  state.busy = true;
  ui.setTyping(true);

  try {
    const { text } = await api.sendMessage(
      state.activeChampionId,
      state.history,
      message
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
      // Reset the accent back to the default cyan theme.
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

  // Friendly focus on load.
  ui.$("#summoner-input").focus();

  // eslint-disable-next-line no-console
  console.log("[v0] Chat With Your Main — backend simulado listo ✦");
}

// The module is deferred by nature, but guard just in case.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}


// ============================================================
// Efecto de salpicadura de pintura fluorescente al hacer clic
// ============================================================

document.addEventListener('click', function (event) {
  // Número de partículas por clic
  const particleCount = 16;
  // Colores neón (usamos los mismos del sitio)
  const colors = ['#36d1dc', '#ff3fa4', '#7c5cff', '#ffd84d', '#2fe089'];

  // Contenedor para las partículas (se añade al body)
  const container = document.body;

  // Obtenemos la posición del clic
  const x = event.clientX;
  const y = event.clientY;

  for (let i = 0; i < particleCount; i++) {
    // Crear elemento partícula
    const particle = document.createElement('div');
    particle.className = 'paint-particle';

    // Tamaño aleatorio entre 6px y 18px
    const size = 6 + Math.random() * 16;
    // Color aleatorio de la paleta
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Velocidad inicial (dirección radial)
    const angle = Math.random() * 2 * Math.PI;
    const speed = 80 + Math.random() * 200; // píxeles por segundo

    // Distancia de desplazamiento aleatoria
    const distance = 60 + Math.random() * 180;

    // Calculamos la posición final
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    // Estilos iniciales
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '40% 60% 30% 70% / 50% 40% 60% 50%'};
      box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
      pointer-events: none;
      z-index: 9999;
      opacity: 1;
      transition: none;
      transform: translate(0, 0) scale(1);
    `;

    container.appendChild(particle);

    // Animar con requestAnimationFrame para suavidad
    const startTime = performance.now();
    const duration = 600 + Math.random() * 400; // ms

    function animateParticle(time) {
      const elapsed = (time - startTime) / duration;
      if (elapsed >= 1) {
        particle.remove();
        return;
      }

      // Easing: aceleración al inicio, freno al final
      const progress = 1 - Math.pow(1 - elapsed, 1.5);
      const currentX = x + dx * progress;
      const currentY = y + dy * progress;
      const scale = 1 - progress * 0.6; // se encoge un poco
      const opacity = 1 - progress * 0.9;

      particle.style.transform = `translate(${currentX - x}px, ${currentY - y}px) scale(${scale})`;
      particle.style.opacity = opacity;

      requestAnimationFrame(animateParticle);
    }

    // Iniciar animación (ligero retraso para efecto cascada)
    setTimeout(() => {
      requestAnimationFrame(animateParticle);
    }, Math.random() * 80);
  }
});