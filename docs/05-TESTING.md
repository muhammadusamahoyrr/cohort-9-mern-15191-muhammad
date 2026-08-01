# Testing Strategy

Target: **80%+ line coverage** on services, repositories, controllers and middlewares (backend), and components/hooks/context (frontend).

## Backend: Mocha + Chai + Sinon + Supertest

Layout mirrors `src/`:

```
backend/test/
├── unit/          controllers, services, repositories, middlewares, utils  (no DB, no HTTP)
├── integration/   full route tests via Supertest against notes_app_test
├── helpers/       test app factory, JWT/user factories, db reset
└── setup.js       loads .env.test, sets NODE_ENV=test (logger silent)
```

Run: `npm test`, `npm run test:unit`, `npm run test:integration`, `npm run test:coverage` (c8 writes `coverage/lcov.info`).

> **Windows:** npm scripts run through `cmd.exe`, where the Unix `NODE_ENV=test mocha` prefix is a syntax error (`'NODE_ENV' is not recognized`). Every script that sets an env var uses `cross-env`:
> `"test": "cross-env NODE_ENV=test mocha"`. Same applies to the frontend scripts.

### Unit tests
Stub the layer below with Sinon, and assert behaviour rather than implementation.

**Controllers** (the requirement's "controllers" layer). Stub the service, pass mock `req`/`res`/`next` objects, and assert only HTTP concerns: status code, response envelope, and that errors get forwarded to `next` instead of swallowed.

- **auth.controller**: `register` responds 201 with `{ user, token }` and no `passwordHash` in the body. `login` responds 200. A service rejection is passed to `next(err)` with nothing written to `res`. `me` reads `req.user.id`, never a client-supplied id.
- **notes.controller**: `create` responds 201. `list` passes parsed `page`/`limit`/`search` through and clamps `limit` to 50. `update` responds 200. `remove` responds 204 with an empty body. Every handler passes `req.user.id` to the service, so ownership can't be spoofed via the body.

**Services** (business logic)

- **auth.service**: hashes on register, rejects a duplicate email with 409, returns a JWT on valid login, throws 401 `INVALID_CREDENTIALS` for a wrong password *and* for an unknown email, with the identical message.
- **notes.service**: creates with the caller's `userId`, derives `contentText` from HTML, sanitizes `<script>` out of `contentHtml`, throws 404 when the repository returns a note owned by another user.

**Data access layer** (the requirement's "data access layers")

- **user.repository**: stub the pool. `findByEmail` lowercases the input and uses a `?` placeholder, `create` returns the inserted id, row keys map from `snake_case` to `camelCase`, and `password_hash` only comes back from the explicit `findByEmailWithHash` method.
- **note.repository**: stub the pool. Assert every statement uses `?` placeholders with no concatenation, that `user_id` appears in the `WHERE` clause of *every* select/update/delete, and that `findAll` applies limit/offset correctly.

**Middlewares**

- **auth.middleware**: no header is 401, malformed header is 401, expired token is 401 `TOKEN_EXPIRED`, and a valid token populates `req.user` and calls `next()` with no argument.
- **error.middleware**: maps `ER_DUP_ENTRY` to 409, a Joi error to 422, anything unknown to 500 with a generic message, and asserts there's no stack in the body when `NODE_ENV=production`.
- **logger**: the redaction test (see the logging doc).

### Integration tests
Against a real `notes_app_test` database, truncated in `beforeEach`. The app is imported from `app.js`, never `server.js`, so no port gets bound.

Register, login, create a note, list, update, delete. Plus: a second user can't read, update or delete the first user's note (expect 404), and unauthenticated requests to every notes route return 401.

## Frontend: Jest + React Testing Library

```
frontend/src/__tests__/   or  *.test.jsx colocated
```

Config: `jest-environment-jsdom`, `@testing-library/jest-dom`, Babel transform for JSX/ESM, `identity-obj-proxy` for CSS imports. Axios is mocked at the `src/api/` module boundary, so tests never hit the network.

### `import.meta.env` will stop Jest dead

Vite exposes config as `import.meta.env.VITE_API_URL`. Jest transforms to CommonJS, where `import.meta` is a **syntax error**, so importing `api/client.js` fails to parse and every test touching the API layer dies before it runs.

The fix, decided up front: **no source file reads `import.meta.env` directly.** All of it goes through one module:

```js
// src/config/env.js  - the only file that mentions import.meta
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
jsdom doesn't implement. `NoteEditor.test.jsx` swaps it for a `<textarea>`
that reports changes the way Quill does (`onChange(value, delta, 'user')`).
These tests are about the editor's own save/cancel/dirty behaviour. Quill is a
dependency here, not the subject.

**`testMatch` has to be narrowed.** Jest's default picks up *every* file under
`__tests__/`, so `__tests__/helpers/render.jsx` gets collected as a suite and
fails as "empty". Config restricts suites to `src/**/*.test.{js,jsx}`.

**Automocked modules return `undefined`, not a promise.** `jest.mock('../api/auth.api')`
plus a successful login means `AuthProvider` immediately calls `me()` and gets
`undefined` back. Tests that log in have to stub `me` as well as `login`.

Run: `npm test`, `npm run test:coverage`.

Coverage:
- **AuthContext**: hydrates from `localStorage`, `login` stores the token, `logout` clears it.
- **ProtectedRoute**: redirects to `/login` without a token, renders children with one.
- **Login/Register forms**: client-side validation messages, submit calls the API with the typed values, a server error is surfaced.
- **Workspace**: renders the fetched list, the empty state, search filters the request, and delete asks for confirmation before calling the API and removing the row.
- **NoteEditor**: loads an existing note into the editor, save calls create or update as appropriate, cancel navigates back without saving.

## Rules

- Every test is independent. No shared mutable state, no ordering assumptions.
- Assert on user-visible output (roles, labels, text), not internal state.
- One behaviour per `it()`, and the name states the expected behaviour.
- Restore all stubs in `afterEach` (`sinon.restore()` or `jest.resetAllMocks()`).
- A bug fix ships with a regression test that fails before the fix.
- Both LCOV reports are fed to SonarQube (see `06-SONARQUBE.md`).
