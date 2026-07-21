# Testing Strategy

Target: **≥ 80% line coverage** on services, repositories, controllers, middlewares (backend) and components/hooks/context (frontend).

## Backend — Mocha + Chai + Sinon + Supertest

Layout mirrors `src/`:

```
backend/test/
├── unit/          services, repositories, middlewares, utils  (no DB, no HTTP)
├── integration/   full route tests via Supertest against notes_app_test
├── helpers/       test app factory, JWT/user factories, db reset
└── setup.js       loads .env.test, sets NODE_ENV=test (logger silent)
```

Run: `npm test` · `npm run test:unit` · `npm run test:integration` · `npm run test:coverage` (c8 → `coverage/lcov.info`).

### Unit tests
Stub the layer below with Sinon; assert behavior, not implementation.

- **auth.service** — hashes on register, rejects duplicate email with 409, returns a JWT on valid login, throws 401 `INVALID_CREDENTIALS` for wrong password *and* unknown email with the identical message.
- **notes.service** — creates with the caller's `userId`, derives `contentText` from HTML, sanitizes `<script>` out of `contentHtml`, throws 404 when the repository returns a note owned by another user.
- **notes.repository** — stub the pool; assert the SQL is parameterized and that `user_id` appears in every `WHERE`.
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
