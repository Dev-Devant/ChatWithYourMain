/**
 * config.js
 * --------------------------------------------------------------------------
 * Central configuration for the app. Keep environment-ish values here so the
 * rest of the codebase stays clean and easy to point at a real backend later.
 * --------------------------------------------------------------------------
 */

export const CONFIG = Object.freeze({
  /**
   * Data Dragon is Riot's free static asset CDN. We use it to render real
   * champion portraits without needing an API key. Bump this version when a
   * new patch ships.
   * @see https://developer.riotgames.com/docs/lol#data-dragon
   */
  DDRAGON_VERSION: "14.23.1",

  /** How long the mocked network calls "take", in ms. Tweak for demo feel. */
  FAKE_LATENCY: { min: 600, max: 1200 },

  /** Number of "mains" we surface on the champion-select screen. */
  TOP_CHAMPIONS_COUNT: 6,

  /** Author / monetization links. Mirrored in index.html for SEO crawlers. */
  LINKS: Object.freeze({
    portfolio: "https://andresrosalez.dev",
    linkedin: "https://www.linkedin.com/in/andres-rosalez",
    email: "mailto:andeliros@yahoo.com.ar",
    coffee: "https://cafecito.app/andresrosalez",
    instagram: "https://www.instagram.com/andres_rosalez"
  }),
});

/**
 * Build the URL for a champion's square portrait on Data Dragon.
 * @param {string} championId - Data Dragon champion key, e.g. "Ahri".
 * @returns {string}
 */
export function championIconUrl(championId) {
  return `https://ddragon.leagueoflegends.com/cdn/${CONFIG.DDRAGON_VERSION}/img/champion/${championId}.png`;
}

/**
 * Build the URL for a champion's centered loading splash on Data Dragon.
 * Great for big hero / chat header art.
 * @param {string} championId - Data Dragon champion key, e.g. "Ahri".
 * @returns {string}
 */
export function championSplashUrl(championId) {
  return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${championId}_0.jpg`;
}

/**
 * Build the URL for a summoner profile icon on Data Dragon.
 * @param {number} iconId - Profile icon id returned by the (mocked) API.
 * @returns {string}
 */
export function profileIconUrl(iconId) {
  return `https://ddragon.leagueoflegends.com/cdn/${CONFIG.DDRAGON_VERSION}/img/profileicon/${iconId}.png`;
}
