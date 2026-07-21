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
| `routes/` | URL → middleware chain → controller | contain logic |
| `middlewares/` | auth, validation, request logging, error handling | know about SQL |
| `controllers/` | read `req`, call service, shape HTTP response | contain business rules or SQL |
| `services/` | business rules, hashing, tokens, ownership checks | touch `req`/`res` |
| `repositories/` | SQL only, returns plain objects | contain business rules |
| `utils/`, `config/` | cross-cutting helpers, env loading | import controllers |

**Dependency direction is one-way:** route → controller → service → repository. Never upward. This keeps services unit-testable with a stubbed repository and no HTTP or DB.

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
- Logout is client-side token disposal; the endpoint exists for logging/auditing.

## Frontend structure

- `AuthContext` holds `{ user, token, login, register, logout, loading }`, hydrated from `localStorage` on mount.
- `<ProtectedRoute>` redirects to `/login` when there is no token.
- `api/` wraps Axios; components never call Axios directly — this keeps Jest mocks at one seam.
- Pages: `Login`, `Register`, `Dashboard`, `NoteEditor`, `Profile`.

## Ownership & security

- Every notes query is scoped by `user_id` in the `WHERE` clause — never fetched then filtered in JS.
- A note belonging to another user returns **404** (not 403), so IDs cannot be enumerated.
- Rich-text HTML is sanitized server-side before insert/update; the client renders sanitized HTML only.
