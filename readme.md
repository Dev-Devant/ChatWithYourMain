# Chat With Your Main

> Search your **League of Legends** summoner profile, discover your most-played champions, and chat with an AI version of your main.

A futuristic experience built with **vanilla HTML, CSS, and JavaScript**, featuring glassmorphism, neon accents, smooth animations, and personalized AI interactions powered by real gameplay data.

---

## ✨ Live Demo

🔗 **Web App:** [chatwithyourmain.andresrosalez.dev](https://chatwithyourmain.andresrosalez.dev/)

🔗 **Backend Repository:** [Dev-Devant/chatwithyourmain_Backend](https://github.com/Dev-Devant/chatwithyourmain_Backend)

---

## ✦ How It Works

```text
Search Summoner → Analyze Match History → Detect Main Champion → Build Player Profile → AI Chat
```

1. **Search** — Enter your Riot ID and region.
2. **Analyze** — The backend processes champion mastery, match history, and player statistics.
3. **Select** — Choose your favorite champion or let the system detect your main automatically.
4. **Chat** — Interact with an AI version of your champion, personalized with your gameplay habits.

---

## 🚀 Engineering Highlights

This project showcases experience with:

* Third-party API integrations (Riot Games API)
* Data analytics pipelines (match history processing, player profiling)
* AI-powered user experiences (OpenAI-backed in-character chat)
* Prompt engineering
* Backend architecture design (FastAPI, async I/O)
* Persistent storage (PostgreSQL) and caching (Redis)
* State management without frameworks
* Rate limit handling
* Secure API proxying
* Production deployment (Railway)
* Open source development

---

## 🗂️ Project Structure

```text
.
├── index.html
├── es/ pt/ fr/ de/        # localized entry points
├── legal/
│   ├── privacy.html
│   ├── cookies.html
│   └── terms.html
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

## 🔌 Connecting the Backend

All backend interactions are isolated in:

```text
assets/js/api.js
```

This frontend talks to the live FastAPI backend (see the [backend repository](https://github.com/Dev-Devant/chatwithyourmain_Backend)), which handles:

| Frontend call       | Backend endpoint     |
| -------------------- | --------------------- |
| `searchSummoner()`   | `GET/POST /api/summoner` |
| `sendMessage()`      | `POST /api/chat`      |

> ⚠️ No Riot API key or LLM credentials are ever exposed in the browser — all requests are proxied through the backend.

Champion assets are loaded directly from Riot's Data Dragon CDN.

---

## 🧠 Backend

The analytics engine and Riot API integration live in a dedicated open source repository:

🔗 [Dev-Devant/chatwithyourmain_Backend](https://github.com/Dev-Devant/chatwithyourmain_Backend)

The backend is responsible for:

* Riot API integration
* Match processing
* Main champion detection
* Historical win rate analysis
* Player profiling
* AI context generation
* PostgreSQL persistence for searched summoners
* Redis caching for chat history
* Caching and rate limit management

---

## ❤️ Support the Project

If you enjoy the project, consider supporting its development:

☕ Cafecito: [cafecito.app/andresrosalez](https://cafecito.app/andresrosalez)

---

## 👤 Author

Made by **[Andres Rosalez](https://andresrosalez.dev/)** — AI Backend Developer.

💼 Portfolio: [andresrosalez.dev](https://andresrosalez.dev/)

💬 LinkedIn: [linkedin.com/in/andres-rosalez](https://www.linkedin.com/in/andres-rosalez)

📸 Instagram: [@andres_rosalez](https://www.instagram.com/andres_rosalez)

📧 Email: [andeliros@yahoo.com.ar](mailto:andeliros@yahoo.com.ar)

---

## ⚖️ Riot Games Disclaimer

Chat With Your Main is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.

League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc.

This project uses the Riot Games API in compliance with Riot Developer Policies.

---

## 📄 License

**All Rights Reserved.**

This repository is public for portfolio and demonstration purposes only. No permission is granted to copy, modify, redistribute, or use this code — commercially or otherwise — without explicit written permission from the author.

See the [`LICENSE`](./LICENSE) file for details.