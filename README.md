# Intervene AI

> *Don't wait. Intervene.*

A cinematic, goth-dark productivity operating system built for students and professionals who are serious about reclaiming their time. Intervene AI doesn't track what you meant to do but it actively intervenes when you're about to stop.

**Live Demo:** https://intervene-ai-844851197710.asia-southeast1.run.app

---

## What it is

Most productivity tools are passive ledgers. Intervene AI is an active co-pilot. It combines a 3D helical command centre, a Gemini-powered AI coach, and a suite of evidence-based productivity modules into a single, self-contained application, no frameworks, no build pipeline, no dependencies.

The aesthetic is deliberate: cinematic, urgent, intelligent. Like a BAFTA title sequence crossed with a dark web OS.

---

## Features

**Spiral Constellation Core**
Interactive 3D helical home screen with mouse-reactive particle system and constellation effects. Every module orbits a central portal. Built entirely with CSS 3D transforms and Canvas API.

**Prefrontal Overlord : AI Coach**
Gemini 2.5 Pro-powered contextual sidebar. Reads your current module, loaded tasks, and session state. Breaks down overwhelm into structured execution plans, generates agendas, and recommends micro-habits, all without being asked.

**Kaizen Flow**
Habit tracker built on compound growth philosophy. Streak counters, visual momentum tracking, and AI-generated daily micro-habit suggestions.

**Focus Ring**
Multi-mode focus timer — Classic Pomodoro ,, Deep Work, and Ultradian rhythm cycles - with acoustic guidance generated live via Web Audio API.

**Eisenhower Matrix**
Drag-and-drop priority quadrant for separating urgency from importance.

**5-Second Rule Protocol**
Full-screen commitment activation window with countdown. Designed to interrupt avoidance loops at the moment they form.

**Binaural Beats Studio**
10 scientifically-referenced audio sessions for cognitive state shifting - alpha, beta, theta, gamma, all generated live via Web Audio API. No external audio files.

**Notebook Ledger & Bespoke Planners**
Rich note-taking with AI-generated meeting agendas. Custom planner builder with AI-assisted structure suggestions.

**Precision Tracker**
Professional timer and stopwatch for granular session logging.

---

## Tech Stack

| Layer | Implementation |
|---|---|
| Frontend | Single-file HTML5 + Vanilla JavaScript + CSS3 |
| 3D & Animation | CSS 3D transforms, Canvas particle system, mouse parallax |
| Audio | Web Audio API (binaural beats, timers, chimes + no external files) |
| AI | Gemini 2.5 Pro via Gemini API |
| Persistence | localStorage with structured data models |
| Fonts | Google Fonts : Playfair Display, Cormorant Garamond, Space Mono, Inter |
| Deployment | Google AI Studio → Cloud Run |

Zero external JavaScript libraries. Zero build steps. One file.

---

## Google Technologies

- **Gemini 2.5 Pro (Gemini API)** — powers the Prefrontal Overlord AI coach; real-time contextual analysis, task breakdown, agenda generation, habit intelligence
- **Google AI Studio** — primary development environment; entire application built and iterated through prompt - driven development in AI Studio
- **Cloud Run** — production deployment via Google AI Studio's deploy pipeline
- **Google Fonts** — typographic identity of the gothic-luxe aesthetic

---

## Running Locally

No installation required.

```bash
git clone https://github.com/casseclatreserve/intervene-ai
cd intervene-ai
# Open index.html in any modern browser
```

To enable the AI coach, add your Gemini API key in the Settings panel inside the app. The toggle is clearly marked and the rest of the app functions fully without it.

---

## Project Structure

```
intervene-ai/
└── index.html    # The entire application
```

---

## Built For

**Vibe2Ship Hackathon** G: oogle x Hackathon, Agentic AI & Productivity Track  
Problem statement: *Reclaiming Agency in a Distracted World*

---

## License

MIT
