# Database Design — MySQL 8

Database name: `notes_app` (tests use `notes_app_test`).
Engine `InnoDB`, charset `utf8mb4`, collation `utf8mb4_unicode_ci` (emoji-safe).

## ER overview

```
users 1 ────< notes
```

One user owns many notes. Deleting a user cascades to their notes.

## `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(100) | NOT NULL | display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | stored lowercase |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt, never selected into API responses |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

Indexes: `uq_users_email (email)`.

## `notes`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT UNSIGNED | NOT NULL, FK → `users.id` ON DELETE CASCADE | owner |
| `title` | VARCHAR(200) | NOT NULL | |
| `content_html` | MEDIUMTEXT | NULL | sanitized rich text from Quill |
| `content_text` | MEDIUMTEXT | NULL | plain-text projection, used for search |
| `is_pinned` | TINYINT(1) | NOT NULL DEFAULT 0 | optional dashboard sorting |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

Indexes:
- `idx_notes_user_updated (user_id, updated_at DESC)` — the dashboard's default listing query.
- `ft_notes_search (title, content_text)` FULLTEXT — search; a `LIKE` fallback is used for short/partial terms.

## Why two content columns

Quill produces HTML. Searching HTML matches tag names and attributes, producing false hits. `content_text` is derived on write (tags stripped) and is the only column searched. `content_html` is what the editor loads back.

## Conventions

- `snake_case` in SQL; repositories map rows to `camelCase` objects at the boundary.
- Timestamps are DB-generated — the application never sends `created_at`/`updated_at`.
- All queries use **parameterized placeholders** (`?`). String concatenation into SQL is forbidden (SonarQube will flag it, and it is an injection vector).
- Schema lives in `db/schema.sql`, applied by Docker Compose on first boot via `/docker-entrypoint-initdb.d`.

## Seed data

`db/seed.sql` creates one demo user (`demo@notes.local` / `Demo@1234`) with a few notes, for manual UI checks. Never loaded in production.
