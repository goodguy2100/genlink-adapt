# Contribution record — Genlink Hub x ADAPT

Maintained by Randy Phillips (GitHub: goodguy2100).
Repo: https://github.com/goodguy2100/genlink-adapt (private).

## What was built here

### 1. The merged construct
- Three-engine split: **Genlink Hub** (identity, courses, XP, admin) + **ADAPT** (adaptive loop, consent gate) + **StudyGenius** (grounded explanation layer).
- Decision: no code merge. One contract at the boundary, two deploys.
- Contract drafted: `POST /diagnose`, `POST /learn`, `POST /outcome`, `GET /proposals`, `POST /adaptations/:id/decision`.
- Key constraint carried from ADAPT: no adaptation row without a recorded learner decision.

### 2. Integration code (this repo)
- `src/adapt/engine.ts` — adaptive item selection (theta), per-topic bands, behavioural metrics, falsifiable hypotheses, proposals, audit ids.
- `src/adapt/store.ts` — persistence boundary, swap for Supabase without touching UI.
- `src/adapt/assessment.ts` — aptitude bank, four domains (web, data, business, cyber), two lanes (spark, deep), mix profile (lane preference, stamina, hint rate).
- `src/components/adapt/MixedCheck.tsx` — mixed check UI in Genlink's design system; hint before explanation; correct option revealed only after the learner asks why.
- `src/components/adapt/Boundary.tsx` — visible render errors instead of blank screens.
- `src/pages/AdaptivePractice.tsx` — page built with Genlink's own `PillarHeader`, `StickyNav`, `GoldParticles`, `bg-cinematic-surface`, Card and Badge components.
- `src/App.tsx` — `/adaptive` route. `src/components/Navbar.tsx` — 'Aptitude check' entry (Router `Link`, no page reload).

### 3. Artefacts produced alongside
- Single-file interactive demo: `DEMO.html` (32 KB, runs offline, four tabs: student loop, school view, StudyGenius, architecture).
- `CONSTRUCT.md` / `CONSTRUCT.pdf` — decision brief: ownership table, cost controls for NVIDIA (call classes, content-hash cache, delta context, author-offline, backoff + local fallback).

## Timestamps
- `fd519dc` — 2026-10-23 21:45:34 +0300 — first integration commit.
- `2ce2c29` — 2026-10-23 21:49:52 +0300 — clean root commit pushed to this repo.
- File times: engine/store 20:55, Boundary 21:22, assessment/MixedCheck/page 21:31 on 2026-10-23.

## Note on the pitch deck
- The deck (Genlink Hub x Adapt, RU Design Thinking Hackathon 2026) presents the two-engine model and the 'plugs in like a socket' contract.
- Its team slide lists five members and does not include Randy Phillips.
- Its credits line reads 'Adapt engine built by our teammates' without names.
- Requested correction: an explicit credit line, and no write access to this repo granted without a conversation.