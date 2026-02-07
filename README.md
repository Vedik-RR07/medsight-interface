# MedSight

**Multi-Agent Intelligence for Medical Research & Care**

MedSight is a frontend interface for searching, synthesizing, and reasoning across medical literature using collaborative AI agents. It aims to improve on single-model systems by using multiple specialized agents that cross-verify results and surface confidence, citations, and ethical considerations.

## What it does

- **Research** — Search and synthesize medical literature (PubMed, trials, systematic reviews) with citation tracking and conflict detection.
- **Clinical reasoning** — Step-by-step differential diagnosis and evidence-based reasoning with explicit assumptions and uncertainty.
- **Data visualization** — Interactive charts for outcomes, risk, and population data.
- **Patient care** — Plain-language summaries and discussion points for patient communication.
- **Ethics & bias** — Analysis of bias, population representation, and ethical issues in research and recommendations.

The app provides a **Dashboard** for running medical queries, an **Agent Explorer** to learn about each agent’s role and limitations, **Results** views for synthesized outputs, **Patient Care** tools for summaries and talking points, and **Saved Research** for bookmarked work.

## Tech stack

- **Vite** + **TypeScript** + **React**
- **React Router** for routing
- **TanStack Query** for server state
- **shadcn/ui** + **Tailwind CSS** for UI
- **Framer Motion** for animations

## Getting started

```sh
npm install
npm run dev
```

Runs the app at [http://localhost:8080](http://localhost:8080).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start development server |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint               |
| `npm run test` | Run tests                |
