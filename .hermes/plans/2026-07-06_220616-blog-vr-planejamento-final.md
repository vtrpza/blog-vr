# Blog VR Lead Engine — Final Planning Handoff

> **For Hermes:** Use this as the execution plan. Detailed specs live in `docs/MINIMUM_COST_PLAN.md`, `docs/SERVICE_API_MAP.md`, `docs/TECH_STACK.md`, and `SPECS.md`.

**Goal:** Build `blog.vradvogados.com.br` as an organic lead engine for VR Advogados with minimum new spend.

**Architecture:** Astro static frontend on Cloudflare Pages; Cloudflare Workers for APIs/cron; Cloudflare D1 for leads/outbox/signals; Pipedrive as CRM source of truth; OpenAI for structured editorial operations; GA4/GTM/Search Console/Clarity for measurement.

**Tech Stack:** Astro, TypeScript, MDX, Tailwind, Cloudflare Pages/Workers/D1/Turnstile, Pipedrive API, OpenAI Responses/Structured Outputs/Batch, GA4/GTM, Search Console API, Microsoft Clarity, Playwright, Lighthouse CI.

---

## Decision

Use the services already owned: **OpenAI + Pipedrive + Cloudflare**.

Do **not** add Supabase, WordPress frontend, Zapier, Make, paid SERP API, paid WhatsApp API, or paid database in the MVP.

## Core files/specs

- `docs/MINIMUM_COST_PLAN.md` — full product/implementation plan.
- `docs/SERVICE_API_MAP.md` — services, APIs, endpoints, costs, schemas.
- `docs/TECH_STACK.md` — final stack decision.
- `docs/RESEARCH.md` — evidence log.
- `SPECS.md` — product specs and acceptance criteria.

## Execution phases

### Phase 0 — Foundation

**Objective:** Create fast static SEO foundation.

**Tasks:**
1. Create Astro + TypeScript app.
2. Add Tailwind.
3. Add Content Collections schemas.
4. Add sitemap/robots/canonical support.
5. Configure Cloudflare Pages.
6. Verify build and preview deploy.

**Validation:** `npm run build`, preview URL loads, Lighthouse baseline runs.

### Phase 1 — Templates

**Objective:** Build homepage, hub, article, checklist, CTA and JSON-LD templates.

**Validation:** templates render with mock data, internal links work, schema is valid.

### Phase 2 — Lead capture

**Objective:** Build `/api/leads` with Turnstile + D1 persistence.

**Tasks:**
1. Create D1 schema.
2. Create Worker endpoint.
3. Validate Turnstile server-side.
4. Validate payload and LGPD consent.
5. Save lead before external calls.
6. Create outbox table for retries.

**Validation:** valid lead is stored; invalid Turnstile rejected; secrets not in frontend.

### Phase 3 — Pipedrive

**Objective:** Sync leads to CRM.

**Tasks:**
1. Search/create Pipedrive Person.
2. Create Lead.
3. Add contextual Note.
4. Optionally create Activity.
5. Save Pipedrive IDs in D1.
6. Implement retry cron.
7. Implement Pipedrive webhook receiver.

**Validation:** test lead appears in Pipedrive with note/label/context; retry works after simulated failure.

### Phase 4 — Tracking

**Objective:** Measure the funnel.

**Tasks:**
1. Install GTM/GA4.
2. Add `dataLayer` events.
3. Mark conversions.
4. Install Clarity.
5. Validate DebugView.

**Validation:** `generate_lead`, `whatsapp_click`, CTA and scroll events appear.

### Phase 5 — Content MVP

**Objective:** Publish initial lead-engine content.

**Tasks:**
1. Create 5 hubs.
2. Create 20 articles.
3. Create 3 checklists.
4. Add glossary.
5. Add CTAs and disclaimers.
6. Run OAB/editorial review.

**Validation:** every page has source, CTA, internal links, disclaimer, no promise of result.

### Phase 6 — AI editorial cockpit

**Objective:** Use OpenAI without turning it into a legal-liability cannon.

**Tasks:**
1. Import Search Console data.
2. Ingest STJ RSS and BCB SGS.
3. Store `source_signals`.
4. Generate structured briefs using OpenAI.
5. Save `content_briefs`.
6. Generate MDX drafts for human review.

**Validation:** brief JSON validates; sources are traceable; draft is not auto-published.

### Phase 7 — Launch QA

**Objective:** Ship only when conversion and measurement work.

**Tasks:**
1. Playwright smoke tests.
2. Lighthouse CI.
3. Link checker.
4. Rich Results Test.
5. Search Console sitemap submission.
6. Production deploy.

**Validation:** Pages load fast, schema works, lead reaches D1 + Pipedrive, GA4 sees conversion.

## Primary acceptance criteria

- Lead is never lost if Pipedrive fails.
- No new fixed paid service is required in MVP.
- No legal promise/guarantee appears in content.
- Every article maps to a cluster, intent and CTA.
- Search Console/Pipedrive data drive future content.
- OpenAI output is structured, logged and human-reviewed.

## Evidence base

The evidence and official docs are listed in `docs/MINIMUM_COST_PLAN.md` and `docs/SERVICE_API_MAP.md`.
