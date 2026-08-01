# API Contract

Base URL: `http://localhost:4000/api`
All requests/responses are JSON. Protected endpoints require `Authorization: Bearer <token>`.

## Response envelope

Success:
```json
{ "success": true, "data": { } }
```

Error:
```json
{
  "success": false,
  "error": { "message": "Invalid credentials", "code": "INVALID_CREDENTIALS", "details": null },
  "requestId": "req-8f2a"
}
```

`details` carries the per-field array on validation failures. `requestId` matches the id in the Pino log line, so a user-reported error can be traced back to its log entry.

## Status codes

| Code | Used for |
|---|---|
| 200 | successful read/update |
| 201 | resource created |
| 204 | successful delete |
| 400 | malformed request |
| 401 | missing/invalid/expired token, bad credentials |
| 403 | authenticated but not permitted |
| 404 | not found **or** not owned by the caller |
| 409 | email already registered |
| 422 | request body failed validation |
| 429 | rate limit exceeded |
| 500 | unhandled server error |

## Health

`GET /api/health` -> `200 { success, data: { status: "ok", db: "up", uptime } }`

## Auth

### `POST /api/auth/register`
Body: `{ name, email, password }`, password 8+ chars, must contain a letter and a digit.
-> `201 { data: { user: { id, name, email, createdAt }, token } }`
-> `409` if the email exists, `422` on validation failure.

### `POST /api/auth/login`
Body: `{ email, password }`
-> `200 { data: { user, token } }`, or `401 INVALID_CREDENTIALS`. Unknown email and wrong password return an identical body, so there's no user enumeration.

### `POST /api/auth/logout` *(protected)*
-> `200 { data: { message: "Logged out" } }`. Logs the event, and the client discards the token.

### `GET /api/auth/me` *(protected)*
-> `200 { data: { user: { id, name, email, createdAt } } }`

## Notes *(all protected, all scoped to the caller)*

### `GET /api/notes`
Query: `search` (string), `page` (default 1), `limit` (default 10, max 50), `sort` (`updated_at`|`created_at`|`title`), `order` (`asc`|`desc`).
-> `200 { data: { notes: [...], pagination: { page, limit, total, totalPages } } }`

There are two shapes here. The list never ships full note bodies, so a dashboard holding 50 long notes stays small.

**List item** (`GET /api/notes` only):
```json
{ "id": 12, "title": "Standup notes", "preview": "Discussed the release...", "isPinned": false, "createdAt": "...", "updatedAt": "..." }
```
`preview` is the first 160 characters of `content_text`, plain text, never HTML.

**Full note** (`GET /api/notes/:id`, and the response of `POST`/`PUT`):
```json
{ "id": 12, "title": "Standup notes", "contentHtml": "<p>...</p>", "isPinned": false, "createdAt": "...", "updatedAt": "..." }
```
`contentText` is an internal search column and is never returned by the API.

### `POST /api/notes`
Body: `{ title, contentHtml, isPinned? }`, title 1-200 chars.
-> `201 { data: { note } }`

### `GET /api/notes/:id`
-> `200 { data: { note } }`, or `404` if missing or owned by someone else.

### `PUT /api/notes/:id`
Body: `{ title?, contentHtml?, isPinned? }`, at least one field required.
-> `200 { data: { note } }`, or `404`

### `DELETE /api/notes/:id`
-> `204` no body, or `404`

## Cross-cutting

- **CORS:** only `CORS_ORIGIN` (default `http://localhost:5173`) is allowed.
- **Rate limit:** 100 req / 15 min per IP globally, 10 req / 15 min on `/api/auth/*`.
  **The limiter must be disabled when `NODE_ENV === 'test'`.** The integration suite makes dozens of register/login calls from `127.0.0.1`, and with the limiter on it starts returning 429 partway through, which reads as flaky tests rather than a config problem. There's a dedicated unit test covering the limiter's own behaviour instead.
- **Body limit:** 4 MB (`express.json({ limit: '4mb' })`).
  1 MB is too small here. Quill embeds pasted images as base64 `data:` URIs, so a single screenshot blows past it and you get a confusing `PayloadTooLargeError` on save. The sanitizer also **strips `<img>` tags with `data:` sources**, so images never reach the database and `content_html` stays text, which is what `MEDIUMTEXT` is sized for. Image upload is out of scope.
- **Sanitization:** `contentHtml` is sanitized server-side. `contentText` is derived, never accepted from the client.
