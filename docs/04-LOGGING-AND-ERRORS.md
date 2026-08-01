# Logging (Pino) & Exception Handling

## Logger

Single instance in `backend/src/config/logger.js`, imported everywhere. No `console.log` in application code, and ESLint enforces that.

```
level:      LOG_LEVEL (dev: debug, prod: info, test: silent)
transport:  pino-pretty in development only; raw JSON otherwise
base:       { service: "notes-api", env }
timestamp:  ISO 8601
```

### Redaction (mandatory)

```
redact: [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.body.password',
  'req.body.confirmPassword',
  '*.password',
  '*.passwordHash',
  '*.token'
]
```
Secrets must never reach the log stream. There's a unit test that logs a payload containing a password and asserts `[Redacted]`.

## HTTP logging with `pino-http`

Mounted as the first middleware, so every request is logged even if a later one throws.

- `genReqId`: reuse the `x-request-id` header if present, otherwise generate a UUID. The id is echoed in error responses and set on the `x-request-id` response header.
- `customLogLevel`: under 400 is info, 4xx is warn, 5xx or a transport error is error.
- Serializers trim `req` to `{ id, method, url, remoteAddress }` and `res` to `{ statusCode }`. Full headers are noise.
- `/api/health` is logged at `debug` to keep polling out of production logs.

## What gets logged, deliberately

| Event | Level | Fields |
|---|---|---|
| Server started / shutting down | info | port, env |
| DB pool connected / connection lost | info / error | host, database |
| User registered | info | userId, email |
| Login success | info | userId |
| Login failure | warn | email, reason (never the password) |
| Logout | info | userId |
| Note created / updated / deleted | info | userId, noteId |
| Validation rejection | warn | path, field errors |
| Unhandled exception | error | err (stack), reqId, userId |
| `unhandledRejection` / `uncaughtException` | fatal | err, then graceful exit |

## Error model

`AppError extends Error` with `{ statusCode, code, details, isOperational: true }`.
Factories: `badRequest`, `unauthorized`, `forbidden`, `notFound`, `conflict`, `validationError`, `tooManyRequests`.

Services throw `AppError`. Controllers never build error responses by hand.

## `asyncHandler`

Every async controller is wrapped so a rejected promise reaches Express's error pipeline instead of hanging the request:

```js
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

## Global error handler: `middlewares/error.middleware.js`

Registered **last**, after all routes. What it does:

1. Normalize. Known library errors get translated: `ER_DUP_ENTRY` to 409, `JsonWebTokenError` to 401 `INVALID_TOKEN`, `TokenExpiredError` to 401 `TOKEN_EXPIRED`, Joi `ValidationError` to 422. Anything else becomes 500 `INTERNAL_ERROR`.
2. Log. 5xx at `error` with the full stack, 4xx at `warn` without it.
3. Respond with the standard error envelope. **Stack traces are only included when `NODE_ENV !== 'production'`**, and internal 500 messages are swapped for a generic string so DB and driver internals never leak.

A `notFoundHandler` sits just before it to turn unmatched routes into a 404 `AppError`.

## Process-level safety net

`server.js` registers handlers for `unhandledRejection`, `uncaughtException`, `SIGINT` and `SIGTERM`. Each logs at fatal, closes the HTTP server and the MySQL pool, then exits non-zero. Don't leave the process running in an unknown state.
