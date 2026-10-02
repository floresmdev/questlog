# frontend/

Stack, commands, Node version: [README.md](README.md). Root rules: [../CLAUDE.md](../CLAUDE.md).

## src/ map
- `main.tsx` — mounts `<App>` in `BrowserRouter`.
- `App.tsx` — routes: `/overview`, `/tasks`, `*` → `/overview`; all under `AppLayout`.
- `api/` — data access layer (see below). `types.ts` mirrors HANDOFF §3, camelCased.
- `mocks/` — sample data from the design refs. `dashboard.ts` = pre-aggregated stats.
- `pages/` — one file per route; fetch data, compose components.
- `components/layout/` — `AppLayout`, `Sidebar*`, `TopBar`, `CurrentBuildCard`.
- `components/ui/` — generic primitives (`Panel`, `Tag`, `Avatar`, `icons`, …).
- `components/shared/` — widgets used on both screens (`StatCard`, `RecentActivity`).
- `components/tasks/`, `components/overview/` — screen-specific widgets.
- `hooks/` — `useApi` (call + loading/error state), `useCurrentUser` (outlet context).
- `lib/` — `now.ts`, `styles.ts`, `format.ts`, `calendar.ts`, `percent.ts`, `app.ts` (`GAME_NAME`).

## API layer
- `api/client.ts` — `QuestlogApi` interface; one method per future `GET /api/*` endpoint (path in a trailing comment).
- `api/mockClient.ts` — `mockApi` implements it over `mocks/`; helper lookups stand in for SQL joins.
- `api/index.ts` — `export const api: QuestlogApi = mockApi;` — the single switch point.
- Switch clients: write `httpClient.ts` implementing `QuestlogApi` with `fetch('/api/…')`, change the assignment in `index.ts`. Nothing else should change.
- Components/pages import `api` and types from `../api` only — never from `mocks/`, never `fetch` directly.
- Interface is read-only so far; mutations (drag-drop, comments, edits) get added here first.
- Pattern in pages: `const { data } = useApi(() => api.getX(), [deps])`.

## Styling
- Tailwind only. Tokens in `tailwind.config.ts` (from HANDOFF §2 + extra greys/tints from the refs): `bg`, `surface`, `ink-*`, `primary-*`, `lane-*`, `area-*`, `priority-*`, `done-*`, `avatar-*`, radii `rounded-card` / `rounded-task`.
- Enum → class/label maps live in `lib/styles.ts` (`areaTagClass`, `priorityTagClass`, `laneStyle`, …). Use full literal class strings — never interpolate (Tailwind purge).
- Pixel values from the refs are fine as arbitrary values (`px-[18px]`).
- Fonts: Plus Jakarta Sans / JetBrains Mono via Google Fonts in `index.html`.

## Time
- `lib/now.ts` exports `APP_NOW` (2026-09-28 16:20). Use it for every "today"/relative date — never `new Date()` directly. Becomes `new Date()` when real data lands.

## Adding a page
1. `src/pages/FooPage.tsx` exporting `FooPage`; render its own `<TopBar>`; get user via `useCurrentUser()`.
2. Add `<Route path="/foo" …>` inside the `AppLayout` route in `App.tsx`.
3. Add a `SidebarNavItem` in `components/layout/Sidebar.tsx`.
4. New data → method on `QuestlogApi` + types in `api/types.ts` + mock impl.

## Adding a component
- One named-export component per file, in the folder matching its scope (ui → shared → screen).
- Typed props interface in the same file; data comes in via props, not by calling `api` (only pages and `AppLayout` fetch).
- Spanish copy; new enum styles go in `lib/styles.ts`.
