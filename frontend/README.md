# Questlog · frontend

Vite + React + TypeScript + Tailwind CSS + React Router. Static phase: all data
comes from the mock API client.

```bash
npm install
npm run dev        # http://localhost:5173 → /overview, /tasks
npm run build      # typecheck + production build to dist/
```

Requires Node 20.19+ (Vite 8).

## Layout

- `src/api/` — the only data access layer. `client.ts` defines `QuestlogApi`
  (one method per future `/api/*` endpoint), `mockClient.ts` implements it over
  `src/mocks/`, `index.ts` exports the active implementation.
- `src/mocks/` — typed sample data from the design references.
- `src/lib/now.ts` — `APP_NOW`, the fixed "today" (2026-09-28 16:20) the UI uses
  for relative dates. Replace with `new Date()` once real data is wired.
- `src/components/{layout,ui,shared,tasks,overview}/` — one component per file.
- `tailwind.config.ts` — design tokens from `docs/HANDOFF.md` §2.
