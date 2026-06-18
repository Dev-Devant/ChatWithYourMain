# Chat With Your Main

> Search your **League of Legends** summoner profile, discover your most-played champions, and chat with an AI version of your main.

A futuristic experience built with **vanilla HTML, CSS, and JavaScript**, featuring glassmorphism, neon accents, smooth animations, and personalized AI interactions powered by real gameplay data.

---

## ✨ Live Demo

🔗 **Web App:** `YOUR_APP_URL`

🔗 **Open Source Backend:** `YOUR_BACKEND_REPOSITORY_URL`

---

## ✦ How It Works

```text
Search Summoner → Analyze Match History → Detect Main Champion → Build Player Profile → AI Chat
```

1. **Search** — Enter your Riot ID and region.
2. **Analyze** — The backend processes champion mastery, match history, and player statistics.
3. **Select** — Choose your favorite champion or let the system detect your main automatically.
4. **Chat** — Interact with an AI version of your champion, personalized with your gameplay habits.

> 💡 This frontend currently uses a simulated backend. Any summoner name works for demonstration purposes. Use `notfound` to test the error state.

---

## 🚀 Engineering Highlights

This project showcases experience with:

* Third-party API integrations
* Data analytics pipelines
* AI-powered user experiences
* Prompt engineering
* Backend architecture design
* State management without frameworks
* Rate limit handling
* Secure API proxying
* Production deployment
* Open source development

---

## 🗂️ Project Structure

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── config.js
│       ├── api.js
│       ├── ui.js
│       ├── app.js
│       └── data/
│           └── champions.js
├── package.json
└── README.md
```

### Architecture

| Layer      | File                | Responsibility                            |
| ---------- | ------------------- | ----------------------------------------- |
| Data       | `data/champions.js` | Champion personalities and metadata       |
| Service    | `api.js`            | API communication layer                   |
| View       | `ui.js`             | DOM rendering                             |
| Controller | `app.js`            | Application state and event orchestration |

---

## 🔧 Local Development

No build step required.

Using Node.js:

```bash
npm install
npm run dev
```

Or using Python:

```bash
python3 -m http.server 3000
```

Open:

```text
http://localhost:3000
```

---

## 🔌 Connecting the Real Backend

All backend interactions are isolated in:

```text
assets/js/api.js
```

Replace the simulated methods with real endpoints.

| Function            | Real Integration              |
| ------------------- | ----------------------------- |
| `searchSummoner()`  | Riot Account-V1 + Summoner-V4 |
| `getTopChampions()` | Champion-Mastery-V4           |
| `getMatchHistory()` | Match-V5                      |
| `sendMessage()`     | Your LLM provider             |

> ⚠️ Never expose your `RIOT_API_KEY` or LLM credentials in the browser.

All requests must be proxied through your own backend.

Champion assets are loaded directly from Riot's Data Dragon CDN.

---

## 🧠 Backend

The analytics engine and Riot API integration live in a dedicated open source repository:

🔗 `YOUR_BACKEND_REPOSITORY_URL`

The backend is responsible for:

* Riot API integration
* Match processing
* Main champion detection
* Historical win rate analysis
* Player profiling
* AI context generation
* Caching and rate limit management

---

## 💸 Support the Project

Running AI-powered applications is not cheap. Tokens have the remarkable ability to disappear faster than LP after a losing streak.

If you enjoy the project, consider supporting its development:

❤️ Patreon: `YOUR_PATREON_URL`

☕ Cafecito: `YOUR_CAFECITO_URL`

---

## 🤖 Need AI for Your Business?

Built by **Artem AI**.

We create:

* AI chatbots
* AI agents
* WhatsApp automations
* Business process automation
* Custom AI integrations

📧 Email: `andeliros@yahoo.com.ar`

🌐 Website: `YOUR_WEBSITE_URL`

💼 Portfolio: `YOUR_PORTFOLIO_URL`

💬 LinkedIn: `YOUR_LINKEDIN_URL`

---

## ⚖️ Riot Games Disclaimer

Chat With Your Main is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.

League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.

This project uses the Riot Games API in compliance with Riot Developer Policies.

---

## ™️ Trademark Notice

The source code is licensed under the GNU Affero General Public License v3.0 (AGPLv3).

The names, logos, branding, visual assets, and identity associated with **Artem AI** are not included under this license and may not be used without explicit written permission.

---

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3).

Commercial use is permitted under the terms of the license.

If you deploy a modified version of this software as a network service, you must make the corresponding source code available to users.

See the [`LICENSE`](./LICENSE) file for details.
