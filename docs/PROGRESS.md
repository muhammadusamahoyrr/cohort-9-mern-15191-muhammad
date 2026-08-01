# Progress Tracker

Status: ⬜ not started, 🟨 in progress, ✅ verified

| Part | Description | Status | Verified by |
|---|---|---|---|
| 0 | Foundation (docs, skeleton, git) | ✅ | docs written, repo initialized |
| 1 | Infrastructure & database (Docker + schema) | ⬜ | |
| 2 | Backend skeleton (config, logger, pool, health, error handler) | ⬜ | |
| 3 | Auth backend (register/login/logout/me, JWT middleware) | ⬜ | |
| 4 | Notes CRUD backend (+ ownership, search, pagination) | ⬜ | |
| 5 | Backend tests (Mocha/Chai/Sinon/Supertest + coverage) | ⬜ | |
| 6 | Frontend skeleton (Vite, routing, auth context, api client) | ✅ | `npm run build` clean, unauthenticated visit redirects to `/login` |
| 7 | Frontend screens (login, workspace, editor, profile) | ✅ | all four screens driven end-to-end in a browser against the stub API |
| 8 | Frontend tests (Jest + RTL) | ✅ | 96 tests green, `coverage/lcov.info` written |
| 9 | Quality gate (ESLint, Prettier, SonarQube scan) | ⬜ | |
| 10 | Optional extras (Socket.IO, export/import, filters) | ⬜ | |

## Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-07-21 | JavaScript ESM over TypeScript | fastest path, least test/build config friction |
| 2026-07-21 | MySQL 8 via Docker Compose | no local MySQL installed, and it's reproducible and resettable |
| 2026-07-21 | Vite + React + plain CSS | light, fast dev server and test runs, no UI-library weight |
| 2026-07-21 | Raw SQL with `mysql2` instead of an ORM | schema design is a project requirement, and this keeps the SQL explicit and reviewable |
| 2026-07-21 | `schema.sql` creates `notes_app_test` too | integration tests need it and nothing else was creating it |
| 2026-07-21 | List endpoint returns `preview`, not `contentHtml` | keeps list payloads small, full body only on a single-note fetch |
| 2026-07-21 | Search stays in core scope, not optional Part 10 | `?search=` is cheap once `content_text` exists, and the list needs it |
| 2026-07-21 | `bcryptjs` over `bcrypt` | the native addon needs VS Build Tools on Windows, pure JS avoids a setup wall |
| 2026-07-21 | `react-quill-new` over `react-quill` | upstream unpublished since Sept 2023, uses `findDOMNode`, caps at React 18 |
| 2026-07-21 | `cross-env` in all npm scripts | `NODE_ENV=x cmd` is a syntax error on Windows |
| 2026-07-21 | Dropped FULLTEXT for a scoped `LIKE` | FULLTEXT doesn't compose with `WHERE user_id`, min-token and stopwords surprise users, and one code path beats two |
| 2026-07-21 | Rate limiter off when `NODE_ENV=test` | otherwise the integration suite 429s partway through and looks flaky |
| 2026-07-21 | Single `src/config/env.js` for `import.meta.env` | `import.meta` is a syntax error under Jest, so one mockable seam beats a Babel plugin |
| 2026-07-21 | Body limit 4 MB, `data:` images stripped | Quill pastes base64 images, 1 MB fails on a screenshot, and images don't belong in `MEDIUMTEXT` |
| 2026-07-21 | UTC end to end (`TZ=UTC`, pool `timezone: 'Z'`) | otherwise timestamps shift by the host offset, which is invisible on a UTC CI box |
| 2026-07-21 | Sanitize on read as well as write | write-only sanitizing trusts every pre-existing or seeded row forever |
| 2026-07-21 | JWT in `localStorage` | simple SPA auth, with a documented trade-off against httpOnly cookies (XSS exposure) |
| 2026-07-21 | 401 interceptor skips `/auth/login` and `/auth/register` | a wrong password is a 401 too, and redirecting there wipes the form and hides the message |
| 2026-07-21 | Response interceptor unwraps `{ success, data }` | callers deal in domain objects, so the envelope is handled once instead of at every call site |
| 2026-07-21 | Quill toolbar limited to the sanitizer's allowlist | offering formats the server strips would silently discard the user's work |
| 2026-07-21 | Search debounced 300 ms, stale responses discarded | one request per keystroke, and out-of-order replies can't overwrite newer results |
| 2026-07-21 | Fonts self-hosted via `@fontsource-variable` | no CDN request, identical rendering offline, nothing leaked to a font host |
| 2026-07-21 | Logout moved into the header user menu | it was only reachable from the Profile screen, and `LogoutButton` keeps both entry points identical |
| 2026-07-21 | Editor "dirty" tracked from Quill's `source === 'user'` | Quill rewrites HTML into its own canonical form on load, so comparing values reported unsaved changes the moment a note opened |
| 2026-08-01 | Visual identity rebuilt against Zoho Notebook, replacing the stationery theme | the stationery palette was invented and never matched a real product. Tokens are now measured from a live reference, see `10-DESIGN-SYSTEM.md`. The old accent names survive as aliases for the auth and profile screens |
| 2026-08-01 | Icons come from `lucide-react` | ~40 hand-drawn SVGs were 300 lines of `icons.jsx` to maintain for no benefit. Aliased in one file so swapping an icon stays a one-line change |
| 2026-08-01 | `clsx` for conditional classNames | the chained-ternary template literals had got to four conditions on one line in `NoteEditor` |
| 2026-08-01 | `date-fns` for date maths, `Intl` kept for formatting | date-fns replaces the hand-rolled elapsed-time ladder and calendar grid. Formatting stays on `Intl` so the rendered strings don't change |
| 2026-08-01 | `use-debounce` in `useNotes`, shared `useDismiss` hook | the debounce effect and the click-outside effect were being copied between files (the latter into five components) |

## Open questions

- Refresh tokens and token rotation. Out of scope for now, revisit if session length becomes an issue.
- Should the Part 10 extras be built at all, or is Part 9 the finish line? Decide after Part 9.
- `08-PROJECT-STRUCTURE.md` lists a backend tree that doesn't exist yet. Re-check it against reality once Parts 1-5 land.
