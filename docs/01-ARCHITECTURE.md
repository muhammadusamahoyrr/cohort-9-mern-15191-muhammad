# Architecture

## High level

```
Browser (React SPA, Vite :5173)
        │  JSON over HTTP, Authorization: Bearer <JWT>
        ▼
Express API (Node.js :4000)
  routes → validation → controller → service → repository
        │                                │
        │                                ▼
        │                          mysql2 pool
        │                                ▼
        │                          MySQL 8 (Docker :3306)
        ▼
  pino / pino-http  →  stdout (JSON)  →  pino-pretty in dev
```

## Backend layering rules

| Layer | Responsibility | Must NOT |
|---|---|---|
| `routes/` | URL to middleware chain to controller | contain logic |
| `middlewares/` | auth, validation, request logging, error handling | know about SQL |
| `controllers/` | read `req`, call service, shape HTTP response | contain business rules or SQL |
| `services/` | business rules, hashing, tokens, ownership checks | touch `req`/`res` |
| `repositories/` | SQL only, returns plain objects | contain business rules |
| `utils/`, `config/` | cross-cutting helpers, env loading | import controllers |

**Dependency direction is one-way:** route, controller, service, repository, and never back upward. That is what keeps services unit-testable with a stubbed repository and no HTTP or DB.

## Request lifecycle

1. `pino-http` assigns a request id and logs the incoming request.
2. CORS + `express.json()` + `helmet` + rate limiter.
3. Route match; `validate(schema)` rejects bad payloads with 422.
4. `authenticate` verifies JWT, sets `req.user = { id, email }`.
5. Controller (wrapped in `asyncHandler`) delegates to the service.
6. Service enforces rules, calls repository.
7. Response sent; `pino-http` logs status + duration.
8. Any thrown error skips to the global error handler, which logs it and returns a normalized body.

## Auth model

- Password hashed with bcrypt (cost 10) on register.
- Login returns a JWT signed with `JWT_SECRET`, `exp = JWT_EXPIRES_IN` (default `1d`), payload `{ sub: userId, email }`.
- Frontend stores the token in `localStorage`, attaches it via an Axios request interceptor.
- A response interceptor catching 401 clears the token and redirects to `/login`.
- Logout is client-side token disposal. The endpoint exists for logging/auditing.

## Frontend structure

- `AuthContext` holds `{ user, token, login, register, logout, loading }`, hydrated from `localStorage` on mount.
- `<ProtectedRoute>` redirects to `/login` when there is no token.
- `api/` wraps Axios. Components never call Axios directly, which keeps the Jest mocks at one seam.
- Pages: `Login`, `Register`, `Workspace` (list + editor panes), `NoteEditor`, `Profile`.

## Ownership & security

- Every notes query is scoped by `user_id` in the `WHERE` clause, rather than fetched and then filtered in JS.
- A note belonging to another user returns **404** rather than 403, so IDs cannot be enumerated.

### Rich text is the main XSS surface

Quill produces HTML, we store it, and the editor and preview render it with `dangerouslySetInnerHTML`. That is a stored-XSS path unless it is closed deliberately:

- Sanitize on write, server-side, with `sanitize-html` and a strict allowlist (`p, br, strong, em, u, s, h1-h3, ul, ol, li, blockquote, pre, code, a`). Use an allowlist rather than a blocklist, since a blocklist loses to the next encoding trick.
- `a` keeps only `href` (schemes limited to `http`, `https`, `mailto`) and gets `rel="noopener noreferrer"` forced. No `style`, no `on*` handlers, and no `<script>`, `<iframe>`, `<object>` or `<svg>`.
- Don't trust the client's sanitizer. Quill runs in the browser, and an attacker just calls the API directly with curl.
- Sanitize on read as well as write. Sanitizing only on write means any row written before a rule was tightened, or inserted by a seed script or manual SQL, is rendered as-is forever. Passing through the sanitizer on output makes the rendering path safe no matter how a row got into the table.
- `contentText` is derived server-side by stripping tags. It is never accepted from the client, so it can't be used to smuggle markup into search results.

### JWT logout is not revocation

A known limitation. `/auth/logout` deletes the client's copy of the token, but the token itself stays cryptographically valid until `exp`, so anyone who copied it beforehand can keep using it. A short `JWT_EXPIRES_IN` (1d) limits the window. Real revocation needs a server-side denylist, or short access tokens plus refresh rotation, which is out of scope here.
