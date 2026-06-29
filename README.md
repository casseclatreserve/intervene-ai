# Intervene AI

> *Don't wait. Intervene.*

A cinematic, goth-dark productivity operating system built for students and professionals who are serious about reclaiming their time. Intervene AI doesn't track what you meant to do instead, it actively intervenes when you're about to stop.

**Live Demo:** https://intervene-ai-844851197710.asia-southeast1.run.app

---

## What it is

Most productivity tools are passive ledgers. Intervene AI is an active co-pilot. It combines a 3D helical command centre, a Gemini-powered AI coach, and a suite of evidence-based productivity modules into a full-stack application.

The aesthetic is deliberate: cinematic, urgent, intelligent. Like a BAFTA title sequence crossed with a dark web OS.

---

## Features

**Spiral Constellation Core**
Interactive 3D helical home screen with mouse-reactive particle system and constellation effects. Every module orbits a central portal. Built with CSS 3D transforms and Canvas API.

**Prefrontal Overlord — AI Coach**
Gemini 2.5 Flash-powered contextual sidebar. Reads your current module, loaded tasks, and session state. Breaks down overwhelm into structured execution plans, generates agendas, and recommends micro-habits, all without being asked.

**Kaizen Flow**
Habit tracker built on compound growth philosophy. Streak counters, visual momentum tracking, and AI-generated daily micro-habit suggestions.

**Focus Ring**
Multi-mode focus timer : Classic Pomodoro, Deep Work, and Ultradian rhythm cycles with acoustic guidance generated live via Web Audio API.

**Eisenhower Matrix**
Drag-and-drop priority quadrant for separating urgency from importance.

**5-Second Rule Protocol**
Full-screen commitment activation window with countdown. Designed to interrupt avoidance loops at the moment they form.

**Binaural Beats Studio**
10 scientifically-referenced audio sessions for cognitive state shifting — alpha, beta, theta, gamma [generated live via Web Audio API.] No external audio files.

**Notebook Ledger & Bespoke Planners**
Rich note-taking with AI-generated meeting agendas. Custom planner builder with AI-assisted structure suggestions.

**Precision Tracker**
Professional timer and stopwatch for granular session logging.

---

## Tech Stack

| Layer | Implementation |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, custom CSS (gothic-luxe dark theme, glassmorphism) |
| Animation | CSS 3D transforms, Canvas API, Framer Motion |
| Icons | Lucide React |
| Backend | Node.js, Express.js, TypeScript |
| AI SDK | Google GenAI SDK (`@google/genai`) — server-side |
| Audio | Web Audio API (binaural beats, timers, chimes w zero external audio files) |
| Persistence | localStorage with structured data models |
| Fonts | Google Fonts : Playfair Display, Cormorant Garamond, Space Mono, Inter |
| Deployment | Cloud Run via Google AI Studio pipeline |

---

## Google Technologies

- **Gemini 2.5 Flash (Gemini API)** - powers the Prefrontal Overlord AI coach; real-time contextual analysis, task breakdown, agenda generation, habit intelligence
- **Google AI Studio** — primary development environment; entire application built and iterated through prompt-driven development in AI Studio
- **Cloud Run** — production deployment via Google AI Studio's deploy pipeline
- **Google Fonts** — typographic identity of the gothic-luxe aesthetic

---

## Running Locally

```bash
git clone https://github.com/casseclatreserve/intervene-ai
cd intervene-ai
npm install
npm run dev
```

Add your Gemini API key to `.env.local` as `GEMINI_API_KEY`.

---

## Project Structure

```
intervene-ai/
├── src/
│   ├── App.tsx
│   ├── components/
│   └── types.ts
├── server.ts
├── package.json
└── index.html
```

---

## Built For

**Vibe2Ship Hackathon** : Google x Hackathon, Agentic AI & Productivity Track  
Problem statement 1 : *The Last-Minute Life Saver*

---

## License

MIT
