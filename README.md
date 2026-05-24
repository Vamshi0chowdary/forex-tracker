# 🌍 Real-Time Forex Aggregation Service

> **Reliable forex rates for users who need answers even when free APIs fail.**

[![Status](https://img.shields.io/badge/status-production--style-green)](https://example.com)
[![Stack](https://img.shields.io/badge/stack-MERN--style-blue)](https://example.com)
[![Focus](https://img.shields.io/badge/focus-reliability%20%26%20trust-purple)](https://example.com)

---

## 🚀 Project Overview

This is a fintech-style forex aggregation platform built around one product goal: **make exchange-rate data trustworthy for free-tier users**.

Free APIs are fast to start with, but they are often inconsistent in uptime, freshness, and rate limits. That matters because a forex product fails not only when it is wrong, but when it feels unreliable. In this space, trust drives conversion more than perfect realtime precision.

### Why it matters

| Problem | Product impact |
|---|---|
| API failures | Users lose confidence quickly |
| Stale exchange rates | The app feels broken |
| Unclear fallback behavior | Trust drops during refreshes |

---

## 🧠 Initial Thought Process

The first principle was simple: **users need trustworthy data more than perfect realtime precision**.

That shaped the architecture around graceful degradation, provider fallback, stale handling, and transparency. When an upstream API fails, the app should still show something useful. For a free-tier user, stale data with clear labeling is better than a hard failure.

> **Design note:** transparency builds trust faster than pretending the data is always fresh.

---

## ✨ Features

| Feature | Why it matters |
|---|---|
| 🌐 Multi-provider aggregation | Reduces dependency on one API |
| 🔁 Fallback APIs | Keeps the app useful during provider failures |
| ♻️ Retry logic | Handles transient upstream issues |
| 🧠 In-memory cache | Improves reliability and response speed |
| 🕒 Stale response handling | Preserves continuity when live data is unavailable |
| 📈 Freshness indicators | Makes data quality visible to users |
| ⚛️ React frontend | Fast, lightweight UI experience |
| 🚀 Express backend | Simple, production-style API layer |

---

## 🏗 Architecture

```text
React Frontend
↓
Express Backend
↓
Aggregation Layer
↓
Multiple Public APIs
↓
Cache Fallback System
```

---

## 🛠 Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React, Vite, Axios |
| Backend | Node.js, Express, Axios, dotenv, CORS |

---

## 🌐 APIs Used

| Provider | Role | Why it was chosen |
|---|---|---|
| exchangerate.host | Primary source | Free access, low friction, no auth |
| open.er-api.com | Secondary source | Reliable public fallback, no auth |
| frankfurter.app | Tertiary source | Clean API, free access, easy integration |

---

## 📂 Folder Structure

```text
Real-Time Data Aggregation Service/
├── backend/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── api.js
│   └── package.json
├── decisions.md
└── README.md
```

---

## ⚙ Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

## 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Backend:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
```

Frontend:

```env
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Endpoint

```http
GET /api/rates?base=USD
```

---

## 📦 Example Response

```json
{
  "base": "USD",
  "timestamp": "2026-05-24T14:30:00.000Z",
  "source": "exchangerate.host",
  "freshness_seconds": 42,
  "stale": false,
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "INR": 83.2,
    "JPY": 156.41
  },
  "providerPriority": [
    "ExchangeRate.host",
    "Open ER API",
    "Frankfurter"
  ]
}
```

---

## 🧩 Product Decisions

| Decision | Rationale |
|---|---|
| Fallback strategy | Users should always see something useful instead of hard failures |
| Cache strategy | 5 minute in-memory cache improves reliability and perceived speed |
| Stale handling | Better to show stale data than hide behind an error state |
| Provider prioritization | First successful provider wins for predictability under time pressure |

---

## 📈 Premium API Budget Strategy

If there were a **$5/day premium API budget**, I would use it selectively:

| Scenario | Why premium routing helps |
|---|---|
| High-intent users | Improves reliability for the most valuable sessions |
| Volatility spikes | Covers periods when free APIs are most likely to struggle |
| Outages | Provides a safe fallback when public providers degrade |
| Onboarding flows | Protects first impressions and conversion moments |

---

## 🚀 Deploying everything to Vercel (single place)

This repository is configured so you can deploy the frontend and the backend together on Vercel. The backend is exposed as serverless functions under `/api` and reuses the aggregation logic in `backend/services`.

Quick steps to deploy:

1. Install and login to Vercel (optional but convenient):

```bash
npm i -g vercel
vercel login
```

2. From the repository root, run the interactive deploy (or link the project):

```bash
vercel # follow prompts, set project root to repository root
vercel --prod
```

What happens on Vercel:
- Files under `api/*.js` are deployed as Node serverless functions. The included `api/rates.js` calls `backend/services/aggregator.js` so the same aggregation logic is used.
- `frontend` is built by Vercel using the `frontend/package.json` build script (Vite) and served as static files.
- CORS headers are set on the serverless functions to allow the frontend to call `/api/rates`.

Local testing:

```bash
# run backend-like functions locally (dev server still works)
cd frontend
npm install
npm run dev

# You can also run the backend services locally with node
cd backend
npm install
node server.js
```

If you want everything under one host (no separate backend service), use the Vercel deploy flow above. If you'd prefer a managed long-running server for the backend instead of serverless functions, consider Render or Railway and point `VITE_API_URL` to that deployed backend.


## ❌ What Was Intentionally Cut

| Cut | Reason |
|---|---|
| Authentication | Not needed for the MVP |
| Redis | Avoided extra infrastructure |
| Charts | Focus stayed on reliability first |
| Analytics | Deferred to keep scope tight |
| Websockets | Not required for the use case |
| Databases | Kept the system lightweight and fast to ship |

The goal was to ship a reliable MVP quickly, not to overbuild the stack.

---

## 🚀 Future Improvements

- Redis caching
- Provider health scoring
- Anomaly detection
- Smart premium routing
- Historical charts
- Alerts

---

## ✅ Reliability Goals Achieved

| Goal | Status |
|---|---|
| Provider failover | ✅ |
| Retry logic | ✅ |
| Cached fallback | ✅ |
| Stale response handling | ✅ |
| Freshness transparency | ✅ |
| Graceful failure handling | ✅ |
| Deployment readiness | ✅ |

---

## 👨‍💻 Final Notes

This project is built around a simple product-thinking principle: **protect trust first, optimize precision second**.

The result is a fast, reliable forex MVP that degrades gracefully, communicates clearly, and stays shippable under time pressure.
