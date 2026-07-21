# Testing Strategy

Target: **≥ 80% line coverage** on services, repositories, controllers, middlewares (backend) and components/hooks/context (frontend).

## Backend — Mocha + Chai + Sinon + Supertest

Layout mirrors `src/`:

```
backend/test/
├── unit/          controllers, services, repositories, middlewares, utils  (no DB, no HTTP)
├── integration/   full route tests via Supertest against notes_app_test
├── helpers/       test app factory, JWT/user factories, db reset
└── setup.js       loads .env.test, sets NODE_ENV=test (logger silent)
```

Run: `npm test` · `npm run test:unit` · `npm run test:integration` · `npm run test:coverage` (c8 → `coverage/lcov.info`).

> **Windows:** npm scripts run through `cmd.exe`, where the Unix `NODE_ENV=test mocha` prefix is a syntax error (`'NODE_ENV' is not recognized`). Every script that sets an env var uses `cross-env`:
> `"test": "cross-env NODE_ENV=test mocha"`. This applies to the frontend scripts too.

### Unit tests
Stub the layer below with Sinon; assert behavior, not implementation.

**Controllers** (the requirement's "controllers" layer) — stub the service, pass mock `req`/`res`/`next` objects, assert only HTTP concerns: status code, response envelope, and that errors are forwarded to `next` rather than swallowed.

- **auth.controller** — `register` responds 201 with `{ user, token }` and no `passwordHash` in the body; `login` responds 200; a service rejection is passed to `next(err)` and nothing is written to `res`; `me` reads `req.user.id`, never a client-supplied id.
- **notes.controller** — `create` responds 201; `list` passes parsed `page`/`limit`/`search` through and clamps `limit` to 50; `update` responds 200; `remove` responds 204 with an empty body; every handler passes `req.user.id` to the service so ownership can never be spoofed via the body.

**Services** (business logic)

- **auth.service** — hashes on register, rejects duplicate email with 409, returns a JWT on valid login, throws 401 `INVALID_CREDENTIALS` for wrong password *and* unknown email with the identical message.
- **notes.service** — creates with the caller's `userId`, derives `contentText` from HTML, sanitizes `<script>` out of `contentHtml`, throws 404 when the repository returns a note owned by another user.
**Data access layer** (the requirement's "data access layers")

- **user.repository** — stub the pool; `findByEmail` lowercases the input and uses a `?` placeholder; `create` returns the inserted id; row keys are mapped `snake_case` → `camelCase`; `password_hash` is only returned by the explicit `findByEmailWithHash` method.
- **note.repository** — stub the pool; assert every statement uses `?` placeholders (no concatenation) and that `user_id` appears in the `WHERE` clause of *every* select/update/delete; `findAll` applies limit/offset correctly.

**Middlewares**

- **auth.middleware** — no header → 401, malformed header → 401, expired token → 401 `TOKEN_EXPIRED`, valid token → `req.user` populated and `next()` called with no argument.
- **error.middleware** — maps `ER_DUP_ENTRY`→409, Joi error→422, unknown→500 with a generic message; asserts no stack in the body when `NODE_ENV=production`.
- **logger** — redaction test (see logging doc).

### Integration tests
Against a real `notes_app_test` database, truncated in `beforeEach`. The app is imported from `app.js` (never `server.js`) so no port is bound.

Register → login → create note → list → update → delete, plus: a second user cannot read/update/delete the first user's note (expect 404), and unauthenticated requests to every notes route return 401.

## Frontend — Jest + React Testing Library

```
frontend/src/__tests__/   or  *.test.jsx colocated
```

Config: `jest-environment-jsdom`, `@testing-library/jest-dom`, Babel transform for JSX/ESM, `identity-obj-proxy` for CSS imports. Axios is mocked at the `src/api/` module boundary — tests never hit the network.

### `import.meta.env` — the trap that stops Jest dead

Vite exposes config as `import.meta.env.VITE_API_URL`. Jest transforms to CommonJS, where `import.meta` is a **syntax error** — importing `api/client.js` fails to parse and every test touching the API layer dies before it runs.

Fix, decided up front: **no source file reads `import.meta.env` directly.** All of it goes through one module:

```js
// src/config/env.js  — the only file that mentions import.meta
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
```

Jest maps that single module to a stub via `moduleNameMapper`:

```js
moduleNameMapper: {
  '\\.(css|scss)$': 'identity-obj-proxy',
  '^.*/config/env$': '<rootDir>/src/__mocks__/env.js',
}
```

One seam, one mock, no Babel plugin. `src/__mocks__/env.js` exports a fixed `API_URL`, which also keeps tests independent of whatever is in `.env`.

### Two more traps, found while writing the suite

**Quill cannot run in jsdom.** `react-quill-new` needs selection and range APIs
jsdom does not implement. `NoteEditor.test.jsx` replaces it with a `<textarea>`
that reports changes the way Quill does (`onChange(value, delta, 'user')`).
The editor's own save/cancel/dirty behaviour is what these tests are about;
Quill is a dependency, not the subject.

**`testMatch` must be narrowed.** Jest's default picks up *every* file under
`__tests__/`, so `__tests__/helpers/render.jsx` is collected as a suite and
fails as "empty". Config restricts suites to `src/**/*.test.{js,jsx}`.

**Automocked modules return `undefined`, not a promise.** `jest.mock('../api/auth.api')`
plus a successful login means `AuthProvider` immediately calls `me()` and gets
`undefined` back. Tests that log in must stub `me` as well as `login`.

Run: `npm test` · `npm run test:coverage`.

Coverage:
- **AuthContext** — hydrates from `localStorage`, `login` stores the token, `logout` clears it.
- **ProtectedRoute** — redirects to `/login` without a token, renders children with one.
- **Login/Register forms** — client-side validation messages, submit calls the API with the typed values, server error is surfaced.
- **Dashboard** — renders the fetched list, empty state, search filters the request, delete asks for confirmation then calls the API and removes the row.
- **NoteEditor** — loads an existing note into the editor, save calls create vs update appropriately, cancel navigates back without saving.

## Rules

- Every test is independent — no shared mutable state, no ordering assumptions.
- Assert on user-visible output (roles, labels, text), not internal state.
- One behavior per `it()`; the name states the expected behavior.
- Restore all stubs in `afterEach` (`sinon.restore()` / `jest.resetAllMocks()`).
- A bug fix ships with a regression test that fails before the fix.
- Both LCOV reports are fed to SonarQube (see `06-SONARQUBE.md`).
