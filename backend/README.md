# MedSight Backend

Node + TypeScript server for paper ingestion (PubMed, OpenAlex), multi-agent analysis, and the `/analyze` pipeline. The frontend talks only to this backend; API keys never reach the browser.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and set:
   - **GEMINI_API_KEY** (required) — for Trial-Quality, Statistics, and Synthesis agents
   - **PUBMED_API_KEY** (optional) — for higher rate limits with NCBI E-utilities
   - **OPENALEX_EMAIL** (optional) — for polite OpenAlex usage
   - **SUPABASE_URL** and **SUPABASE_SERVICE_ROLE_KEY** (optional) — for storing searches later

## Run

- `npm run dev` — start with tsx watch (port 3001)
- `npm run build` then `npm start` — production

## Endpoints

- `GET /health` — returns `{ "status": "ok" }`
- `POST /analyze` — body: `{ "query": "string", "patient": { "ageRange", "sex", "condition", "comorbidities" }? }`; returns full analysis (papers, literature, trialQuality, statistics, patientMatch, synthesis)

## Structure

- **server.ts** — Express app, CORS, JSON, routes
- **routes/analyze.ts** — POST /analyze handler
- **analyzePipeline.ts** — orchestrates fetch → literature → trial quality + statistics + patient match → synthesis
- **services/paperSources.ts** — PubMed (esearch + efetch) and OpenAlex; normalized paper format
- **agents/** — literature (rank/filter), trialQuality (rules + Gemini), statistics (Gemini), patientMatch (match score), synthesis (Gemini, aggregates and conflicts)
