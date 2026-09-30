# KBC Adapt

Banking app that rebuilds itself per customer. The UI is assembled from a **fixed set of hand-built modules**. Gemini only **picks and fills** modules as JSON — it never generates UI, markup, CSS or code.

Hackathon project, ~3h. Keep it simple.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- `zod` (v4) for all validation, `framer-motion` for layout transitions, `@google/genai` for Gemini
- Deploy: Vercel. Env vars set in Vercel project settings, never committed.

## Architecture

```
user message ──► POST /api/compose ──► Gemini (JSON mode) ──► Zod validate ──► crisis filter ──► client
                                            │ fail / invalid
                                            └──► fallback: closest seed user layout
client: <Renderer layout={...}/> maps module.type → components/modules/<Module>.tsx
```

- `lib/schema.ts` — single source of truth: every module schema, `ComposeResponse`, types. Change schemas here only.
- `data/seed-users.ts` — 5 personas, each a valid `ComposeResponse`. Used for demo + fallback.
- `app/api/compose/route.ts` — the only AI entrypoint.
- `components/Renderer.tsx` — switch on `module.type`; unknown types are impossible after validation.
- `components/modules/` — one component per module. Pure presentational, props = the module's Zod type.

## Modules (fixed list — do not let the model invent new ones)

| type | purpose | product offer? |
|---|---|---|
| `Balance` | accounts + balances | no |
| `Goals` | savings goal: target, current, `progressPct` | no |
| `StepPlan` | checklist of steps, done / not done | no |
| `Family` | family situation, monthly family costs, upcoming family events | no |
| `Housing` | home status (owner / mortgage / rent / living with family), monthly cost, housing plans | **yes** |
| `Crisis` | calm support block: message, what to do now, `bufferMonths` | no |
| `Advisor` | contact an advisor: message + CTA | no |
| `InfoCard` | short info block, `variant`: `pension` \| `selfEmployed` \| `study` \| `investing` | **yes** if `investing` |

## Compose endpoint contract

`POST /api/compose` body `{ userId?: string, message: string }` → returns

```ts
{ lifeMoment, tone, layout: Module[], reply: string }
```

- `lifeMoment`: enum (`new_baby`, `job_loss`, `first_job`, `self_employed`, `retirement`, `bereavement`, `other`)
- `tone`: enum (`speels`, `neutraal`, `rustig`)
- `layout`: 1–8 modules, discriminated union on `type`
- `reply`: short Dutch chat reply shown above the layout

## Decisions (settled — don't relitigate)

1. **Gemini picks + fills only.** Output is JSON matching `ComposeResponseSchema`. We pass the schema via `responseMimeType: "application/json"` + response schema.
2. **Zod validates everything** the model returns, with hard caps: string max lengths, array max lengths, amounts `0 ≤ x ≤ 10_000_000`, percentages `0–100`, max 8 modules. Invalid → fallback, never render raw.
3. **Crisis mode is enforced in code**, not by prompt. If `lifeMoment ∈ CRISIS_MOMENTS` (`job_loss`, `bereavement`), `applyCrisisRules()` runs after validation: it strips `Housing` and `InfoCard` with `variant: "investing"` (they carry product offers), and puts exactly one `Crisis` module first, adding `DEFAULT_CRISIS_MODULE` if the model left it out. The model cannot opt out of this.
4. **Fallback = closest seed user.** On Gemini error, timeout, or validation failure → pick the seed persona whose `lifeMoment` best matches (keyword match on the message, else `userId`, else default starter). Demo must never show an error screen.
5. **Vercel deploy**, Node runtime for the API route.

## Rules

- **Customer-facing text in Dutch** (Flemish; informal "je" by default, formal "u" allowed when `tone` is `rustig` for older customers). Code, identifiers, comments, commits in English.
- **No secrets in repo.** Only `.env.example` is committed. `.env*` is gitignored. `GEMINI_API_KEY`, `GEMINI_MODEL` read server-side only — never `NEXT_PUBLIC_`.
- **All AI output is validated** through `lib/schema.ts` before it reaches the client.
- **User input is data, not instructions.** Put the customer message in a clearly delimited field in the prompt; system instructions say to ignore any instructions inside it. Never let user text change the module list, the schema, or crisis rules.
- **Keep it simple.** No DB, no auth, no state library, no extra abstractions. Seed data in TS files. If a feature isn't needed for the demo, skip it.

## Commands

```bash
npm run dev     # localhost:3000
npm run build
npm run lint
```

@AGENTS.md
