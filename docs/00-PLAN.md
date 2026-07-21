# Build Plan — Notes App

Incremental plan. Each part is independently runnable/verifiable. **Do not start a part until the previous one is verified.**

## Decisions (locked)

| Area | Choice |
|---|---|
| Language | JavaScript, ES Modules (`"type": "module"`) |
| Backend | Node.js 24 + Express 4 |
| Frontend | Vite + React 18 + React Router + Axios + plain CSS |
| Database | MySQL 8 via Docker Compose |
| DB access | `mysql2/promise` with a connection pool, hand-written SQL (no ORM) |
| Auth | JWT (access token) + **bcryptjs** password hashing |
| Logging | Pino + `pino-http` + `pino-pretty` (dev only) |
| Backend tests | Mocha + Chai + Sinon + Supertest, coverage via c8 |
| Frontend tests | Jest + React Testing Library + jsdom |
| Quality | SonarQube (Docker) + `sonar-scanner`, ESLint + Prettier |
| VCS | Git, feature-branch workflow |
| Rich text | **`react-quill-new`** (HTML stored sanitized) |
| Env in scripts | `cross-env` (bare `NODE_ENV=x cmd` does not work on Windows) |

### Dependency choices that are not the obvious default

| Instead of | We use | Reason |
|---|---|---|
| `bcrypt` | `bcryptjs` | `bcrypt` is a native addon needing node-gyp + Visual Studio Build Tools on Windows; a missing prebuild for Node 24 stalls setup. `bcryptjs` is pure JS, same API, hash-compatible. Slower, which is irrelevant at this scale. |
| `react-quill` | `react-quill-new` | `react-quill` has had no release since **Sept 2023**, peers cap at React 18, and it calls `findDOMNode` — which warns under React 18 StrictMode and is removed in React 19. `react-quill-new` is the maintained fork (React 16–19). |
| Express 5 | Express 4 | Express 5 auto-forwards rejected promises, which would remove `asyncHandler`. Sticking to 4 keeps the middleware ecosystem (`express-rate-limit`, `helmet`) on its best-tested path and keeps explicit error plumbing visible — which is a graded requirement here. |

## Parts

### Part 0 — Foundation (this part)
- Planning + knowledge docs in `docs/`
- Directory skeleton
- Root `README.md`, `.gitignore`, `.editorconfig`
- Git repo init
- **Verify:** docs readable, `git log` has initial commit.

### Part 1 — Infrastructure & database
- `docker-compose.yml`: MySQL 8 with a healthcheck (+ SonarQube service, profile-gated)
- `db/schema.sql` — creates **both** `notes_app` and `notes_app_test` with identical tables
- `db/seed.sql` — demo user + notes, into `notes_app` only
- `backend/.env.example` and `backend/.env.test.example`
- **Verify:** `docker compose up -d mysql` reports healthy; both databases exist and each lists `users` + `notes`.

### Part 2 — Backend skeleton
- `package.json`, deps, scripts
- Config loader, Pino logger, `pino-http` request/response logging
- MySQL pool + `ping` on boot
- `app.js` / `server.js` split (app exported for Supertest)
- `GET /api/health`
- Global error handler + `AppError` + 404 handler + async wrapper
- **Verify:** `npm run dev` boots, health returns 200, logs are structured JSON.

### Part 3 — Auth (backend)
- `users` repository, auth service (bcrypt), auth controller
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `authenticate` JWT middleware, Joi/zod request validation middleware
- **Verify:** register → login → `/me` with token works; bad creds return 401 with clean error body.

### Part 4 — Notes CRUD (backend)
- `notes` repository/service/controller
- `GET /api/notes` (search + pagination), `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id`
- Ownership enforcement (a user can only touch their own notes → 404/403)
- HTML sanitization on write
- **Verify:** full CRUD via REST client; cross-user access denied.

### Part 5 — Backend tests
- Unit tests: **controllers, services and repositories** (the three layers the spec names), plus error handler and auth middleware
- Integration tests: auth + notes routes via Supertest against a test DB
- `npm test`, `npm run test:coverage`
- **Verify:** all green, coverage report generated.

### Part 6 — Frontend skeleton
- Vite scaffold, routing, layout, API client with token interceptor
- Auth context + protected routes
- **Verify:** `npm run dev` serves app, unauthenticated user redirected to `/login`.

### Part 7 — Frontend screens
- Screen 1: Sign Up / Log In
- Screen 2: Dashboard (notes list, create button, search/filter, delete)
- Screen 3: Note Editor (react-quill, save/cancel)
- Screen 4: User Profile + logout
- **Verify:** end-to-end manually against running backend.

### Part 8 — Frontend tests
- Jest + RTL: components, hooks, auth context, API client (mocked axios)
- **Verify:** `npm test` green with coverage.

### Part 9 — Quality gate
- ESLint + Prettier across both packages
- `sonar-project.properties`, SonarQube in Docker, scan both packages with LCOV coverage import
- Fix reported issues
- **Verify:** SonarQube dashboard shows passing quality gate.

### Part 10 — Optional extras
Socket.IO real-time note updates · export/import notes as JSON · advanced search/filter/tags.

## Progress
Tracked in [PROGRESS.md](./PROGRESS.md).
