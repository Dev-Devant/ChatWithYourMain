/**
 * ui.js
 * --------------------------------------------------------------------------
 * Pure rendering + DOM helpers. No business logic and no network calls live
 * here — app.js orchestrates, ui.js paints. Keeping this split makes the code
 * easy to read and easy to test.
 * --------------------------------------------------------------------------
 */

import {
  championIconUrl,
  championSplashUrl,
  profileIconUrl,
} from "./config.js";

/* -------------------------------------------------------------------------- */
/* Tiny DOM utilities                                                         */
/* -------------------------------------------------------------------------- */

/** Shorthand for document.querySelector. */
export const $ = (selector, root = document) => root.querySelector(selector);

/** Escape user / API text before injecting it into the DOM. */
export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

/** Format a number like 248910 -> "248.9k". */
function formatPoints(points) {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}k`;
  return String(points);
}

/* -------------------------------------------------------------------------- */
/* View switching                                                             */
/* -------------------------------------------------------------------------- */

const VIEWS = ["view-search", "view-select", "view-chat"];

/**
 * Show one of the three top-level views and hide the rest.
 * @param {"view-search"|"view-select"|"view-chat"} id
 */
export function showView(id) {
  VIEWS.forEach((viewId) => {
    const el = document.getElementById(viewId);
    if (!el) return;
    const active = viewId === id;
    el.classList.toggle("view--active", active);
    el.hidden = !active;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* -------------------------------------------------------------------------- */
/* Search view                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Toggle the search button between idle and loading states.
 * @param {boolean} loading
 */
export function setSearchLoading(loading) {
  const button = $("#search-button");
  const input = $("#summoner-input");
  if (!button) return;
  button.disabled = loading;
  if (input) input.disabled = loading;
  button.classList.toggle("btn--loading", loading);
  const label = $(".btn__label", button);
  if (label) label.textContent = loading ? "Buscando…" : "Buscar";
}

/**
 * Render inline feedback under the search bar.
 * @param {string} text
 * @param {"error"|"info"|""} [tone]
 */
export function setSearchMessage(text, tone = "") {
  const el = $("#search-message");
  if (!el) return;
  el.textContent = text;
  el.className = "search__feedback";
  if (tone) el.classList.add(`search__feedback--${tone}`);
}

/* -------------------------------------------------------------------------- */
/* Champion-select view                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Render the summoner profile banner.
 * @param {{name:string, region:string, level:number, iconId:number, rank:string, lp:number}} summoner
 */
export function renderSummonerCard(summoner) {
  const el = $("#summoner-card");
  if (!el) return;
  el.innerHTML = `
    <img
      class="summoner-card__icon"
      src="${profileIconUrl(summoner.iconId)}"
      alt=""
      loading="lazy"
      onerror="this.style.visibility='hidden'"
    />
    <div class="summoner-card__info">
      <p class="summoner-card__eyebrow">Invocador encontrado</p>
      <h2 class="summoner-card__name">${escapeHtml(summoner.name)}</h2>
      <div class="summoner-card__tags">
        <span class="tag"><i class="fa-solid fa-location-dot"></i> ${escapeHtml(summoner.region)}</span>
        <span class="tag"><i class="fa-solid fa-star"></i> Nivel ${summoner.level}</span>
        <span class="tag"><i class="fa-solid fa-chess-rook"></i> ${escapeHtml(summoner.rank)} · ${summoner.lp} LP</span>
      </div>
    </div>
  `;
}

/**
 * Render the grid of champion cards.
 * @param {Array} champions - output of api.getTopChampions().
 * @param {(championId:string) => void} onSelect
 */
export function renderChampionGrid(champions, onSelect) {
  const grid = $("#champion-grid");
  if (!grid) return;
  grid.innerHTML = "";

  champions.forEach((champ, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "champion-card";
    card.setAttribute("role", "listitem");
    card.style.setProperty("--accent", champ.accent);
    card.style.setProperty("--delay", `${index * 70}ms`);
    card.dataset.championId = champ.id;

    card.innerHTML = `
      <span class="champion-card__rank">#${index + 1}</span>
      <span class="champion-card__portrait">
        <img
          src="${championIconUrl(champ.id)}"
          alt="${escapeHtml(champ.name)}"
          loading="lazy"
        />
      </span>
      <span class="champion-card__body">
        <span class="champion-card__name">${escapeHtml(champ.name)}</span>
        <span class="champion-card__title">${escapeHtml(champ.title)}</span>
        <span class="champion-card__mastery">
          <i class="fa-solid fa-trophy"></i>
          Maestría ${champ.masteryLevel} · ${formatPoints(champ.masteryPoints)} pts
        </span>
      </span>
      <span class="champion-card__cta">
        Chatear <i class="fa-solid fa-arrow-right"></i>
      </span>
    `;

    card.addEventListener("click", () => onSelect(champ.id));
    grid.appendChild(card);
  });
}

/* -------------------------------------------------------------------------- */
/* Chat view                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Paint the chat header with the active champion's identity + splash art.
 * Also pushes the champion's accent color into the theme via a CSS variable.
 * @param {object} champion - entry from champions.js
 */
export function renderChatHeader(champion) {
  const header = $("#chat-header");
  if (!header) return;

  // Theme the whole chat with the champion accent.
  document.documentElement.style.setProperty("--accent", champion.accent);

  header.style.setProperty(
    "--splash",
    `url("${championSplashUrl(champion.id)}")`
  );
  header.innerHTML = `
    <span class="chat__avatar">
      <img src="${championIconUrl(champion.id)}" alt="${escapeHtml(champion.name)}" />
      <span class="chat__status" aria-hidden="true"></span>
    </span>
    <span class="chat__identity">
      <span class="chat__name">${escapeHtml(champion.name)}</span>
      <span class="chat__title">${escapeHtml(champion.title)} · en línea</span>
    </span>
  `;
}

/** Remove every message from the chat log. */
export function clearChatLog() {
  const log = $("#chat-log");
  if (log) log.innerHTML = "";
}

/**
 * Append a single message bubble.
 * @param {"user"|"champion"} role
 * @param {string} text
 * @param {object} [champion] - required when role === "champion" for the avatar
 */
export function appendMessage(role, text, champion) {
  const log = $("#chat-log");
  if (!log) return;

  const row = document.createElement("div");
  row.className = `msg msg--${role}`;

  const avatar =
    role === "champion" && champion
      ? `<img class="msg__avatar" src="${championIconUrl(champion.id)}" alt="" />`
      : "";

  row.innerHTML = `
    ${avatar}
    <div class="msg__bubble">${escapeHtml(text)}</div>
  `;

  log.appendChild(row);
  log.scrollTop = log.scrollHeight;
}

/**
 * Toggle the animated "champion is typing" indicator.
 * @param {boolean} visible
 */
export function setTyping(visible) {
  const el = $("#typing-indicator");
  if (!el) return;
  el.hidden = !visible;
  if (visible) {
    const log = $("#chat-log");
    if (log) log.scrollTop = log.scrollHeight;
  }
}
