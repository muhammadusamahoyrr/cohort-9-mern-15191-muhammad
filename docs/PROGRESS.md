# Progress Tracker

Status: ⬜ not started · 🟨 in progress · ✅ verified

| Part | Description | Status | Verified by |
|---|---|---|---|
| 0 | Foundation — docs, skeleton, git | ✅ | docs written, repo initialized |
| 1 | Infrastructure & database (Docker + schema) | ⬜ | |
| 2 | Backend skeleton (config, logger, pool, health, error handler) | ⬜ | |
| 3 | Auth backend (register/login/logout/me, JWT middleware) | ⬜ | |
| 4 | Notes CRUD backend (+ ownership, search, pagination) | ⬜ | |
| 5 | Backend tests (Mocha/Chai/Sinon/Supertest + coverage) | ⬜ | |
| 6 | Frontend skeleton (Vite, routing, auth context, api client) | ✅ | `npm run build` clean; unauthenticated visit redirects to `/login` |
| 7 | Frontend screens (login, dashboard, editor, profile) | ✅ | all four screens driven end-to-end in a browser against a stub API |
| 8 | Frontend tests (Jest + RTL) | ✅ | 92 tests green; 93% statements / 84% branches, `coverage/lcov.info` written |
| 9 | Quality gate (ESLint, Prettier, SonarQube scan) | ⬜ | |
| 10 | Optional extras (Socket.IO, export/import, filters) | ⬜ | |

## Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-07-21 | JavaScript ESM over TypeScript | fastest path, least test/build config friction |
| 2026-07-21 | MySQL 8 via Docker Compose | no local MySQL installed; reproducible and resettable |
| 2026-07-21 | Vite + React + plain CSS | light, fast dev server and test runs, no UI-library weight |
| 2026-07-21 | Raw SQL with `mysql2` instead of an ORM | schema design is a project requirement; keeps SQL explicit and reviewable |
| 2026-07-21 | `schema.sql` creates `notes_app_test` too | integration tests need it; nothing else was creating it |
| 2026-07-21 | List endpoint returns `preview`, not `contentHtml` | keeps dashboard payloads small; full body only on single-note fetch |
| 2026-07-21 | Search stays in core scope, not optional Part 10 | `?search=` is cheap once `content_text` exists and the dashboard needs it |
| 2026-07-21 | `bcryptjs` over `bcrypt` | native addon needs VS Build Tools on Windows; pure-JS avoids a setup wall |
| 2026-07-21 | `react-quill-new` over `react-quill` | upstream unpublished since Sept 2023, uses `findDOMNode`, caps at React 18 |
| 2026-07-21 | `cross-env` in all npm scripts | `NODE_ENV=x cmd` is a syntax error on Windows |
| 2026-07-21 | Dropped FULLTEXT for scoped `LIKE` | FULLTEXT doesn't compose with `WHERE user_id`; min-token/stopwords surprise users; one code path beats two |
| 2026-07-21 | Rate limiter off when `NODE_ENV=test` | otherwise the integration suite 429s partway through and looks flaky |
| 2026-07-21 | Single `src/config/env.js` for `import.meta.env` | `import.meta` is a syntax error under Jest; one mockable seam instead of a Babel plugin |
| 2026-07-21 | Body limit 4 MB, `data:` images stripped | Quill pastes base64 images; 1 MB fails on a screenshot, and images don't belong in `MEDIUMTEXT` |
| 2026-07-21 | UTC end to end (`TZ=UTC`, pool `timezone: 'Z'`) | otherwise timestamps shift by the host offset — invisible on a UTC CI box |
| 2026-07-21 | Sanitize on read as well as write | write-only sanitizing trusts every pre-existing/seeded row forever |
| 2026-07-21 | JWT in `localStorage` | simple SPA auth; documented trade-off vs httpOnly cookies (XSS exposure) |
| 2026-07-21 | 401 interceptor skips `/auth/login` and `/auth/register` | a wrong password is a 401 too; redirecting there wipes the form and hides the message |
| 2026-07-21 | Response interceptor unwraps `{ success, data }` | callers deal in domain objects; the envelope is handled once instead of at every call site |
| 2026-07-21 | Quill toolbar limited to the sanitizer's allowlist | offering formats the server strips would silently discard the user's work |
| 2026-07-21 | Search debounced 300 ms, stale responses discarded | one request per keystroke, and out-of-order replies overwriting newer results |
| 2026-07-21 | Visual identity: stationery (see `10-DESIGN-SYSTEM.md`) | the UI had no point of view; palette and type are now derived from paper, graphite and pen ink rather than product-UI defaults |
| 2026-07-21 | Fonts self-hosted via `@fontsource-variable` | no CDN request, identical rendering offline, nothing leaked to a font host |
| 2026-07-21 | Logout moved into the navbar user menu | it was reachable only from the Profile screen; `LogoutButton` keeps both entry points identical |
| 2026-07-21 | Editor "dirty" tracked from Quill's `source === 'user'` | Quill rewrites HTML into its own canonical form on load, so comparing values reported unsaved changes the moment a note opened |

## Open questions

- Refresh tokens / token rotation — out of scope for now, revisit if session length becomes an issue.
- Should Part 10 extras be built at all, or is Part 9 the finish line? Decide after Part 9.
