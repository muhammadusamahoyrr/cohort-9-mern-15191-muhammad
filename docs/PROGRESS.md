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
| 6 | Frontend skeleton (Vite, routing, auth context, api client) | ⬜ | |
| 7 | Frontend screens (login, dashboard, editor, profile) | ⬜ | |
| 8 | Frontend tests (Jest + RTL) | ⬜ | |
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
| 2026-07-21 | JWT in `localStorage` | simple SPA auth; documented trade-off vs httpOnly cookies (XSS exposure) |

## Open questions

- Refresh tokens / token rotation — out of scope for now, revisit if session length becomes an issue.
- Should Part 10 extras be built at all, or is Part 9 the finish line? Decide after Part 9.
