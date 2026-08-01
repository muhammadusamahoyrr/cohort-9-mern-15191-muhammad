# Database Design (MySQL 8)

Engine `InnoDB`, charset `utf8mb4`, collation `utf8mb4_unicode_ci` (emoji-safe).

## Two databases

| Database | Used by | Created by |
|---|---|---|
| `notes_app` | dev + runtime | `MYSQL_DATABASE` in `docker-compose.yml` |
| `notes_app_test` | Mocha integration tests | `db/schema.sql`, explicitly |

`db/schema.sql` therefore creates **both** databases and both sets of tables:

```sql
CREATE DATABASE IF NOT EXISTS notes_app      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notes_app_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

...then applies the identical `users`/`notes` DDL to each. Integration tests truncate `notes_app_test` between cases and never touch dev data. `db/seed.sql` loads into `notes_app` only.

> Scripts in `/docker-entrypoint-initdb.d` run **only on first boot**, when the data volume is empty. After changing `schema.sql`, re-apply with `docker compose down -v && docker compose up -d mysql`. Without `-v` the old volume persists and your change silently does nothing.

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
| `user_id` | BIGINT UNSIGNED | NOT NULL, FK to `users.id` ON DELETE CASCADE | owner |
| `title` | VARCHAR(200) | NOT NULL | |
| `content_html` | MEDIUMTEXT | NULL | sanitized rich text from Quill |
| `content_text` | MEDIUMTEXT | NULL | plain-text projection, used for search |
| `is_pinned` | TINYINT(1) | NOT NULL DEFAULT 0 | optional dashboard sorting |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

Indexes:
- `idx_notes_user_updated (user_id, is_pinned DESC, updated_at DESC)` matches the dashboard's default ordering exactly (`WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC`), so the sort is index-covered instead of a filesort.

### Why there's no FULLTEXT index

An earlier draft specified `FULLTEXT(title, content_text)`. Dropped, for three reasons:

1. **It doesn't compose with the ownership filter.** Every query here is `WHERE user_id = ?`. InnoDB resolves `MATCH...AGAINST` first across the whole table and only then filters by user, which is backwards for us, and it gets slower as other users' notes pile up.
2. **Its defaults surprise users.** `innodb_ft_min_token_size` is 3, so searching "to" or "AI" returns nothing, and natural-language mode applies a stopword list. Someone searching their own notes expects substring matching.
3. **It forces two code paths.** FULLTEXT for long terms plus a `LIKE` fallback for short ones means two SQL branches, two sets of tests, and a SonarQube cognitive-complexity hit.

We use `WHERE user_id = ? AND (title LIKE ? OR content_text LIKE ?)` with `%term%` instead. The leading wildcard rules out an index on the text, but the query is already constrained to one user's notes, which is tens to hundreds of rows. Revisit only if a single user goes past ~10k notes, which won't happen here.

**The `%` and `_` characters in user input must be escaped** before being interpolated into the `LIKE` parameter, or a search for `100%` silently matches everything.

## Why two content columns

Quill produces HTML. Searching HTML matches tag names and attributes, which produces false hits. `content_text` is derived on write (tags stripped) and is the only column searched. `content_html` is what the editor loads back.

## Time zones, settle this before writing a single query

Three places have to agree, or notes show the wrong "last edited" time:

1. **MySQL container** runs in UTC (`TZ=UTC` and `--default-time-zone=+00:00` in `docker-compose.yml`).
2. **Connection pool** sets `timezone: 'Z'`, so `mysql2` reads returned `DATETIME`/`TIMESTAMP` values as UTC instead of guessing the host zone.
3. **API** serializes every timestamp as an ISO-8601 UTC string (`2026-07-21T14:03:00.000Z`). Converting to local time for display is the frontend's job, not the backend's.

Miss step 2 and the value gets silently reinterpreted in the server's local zone, putting every timestamp off by the UTC offset. That one is invisible in tests run on a UTC machine and obvious to a user in PKT.

## Conventions

- `snake_case` in SQL. Repositories map rows to `camelCase` objects at the boundary.
- Timestamps are DB-generated. The application never sends `created_at`/`updated_at`.
- **Caveat on `ON UPDATE CURRENT_TIMESTAMP`:** MySQL only bumps it when at least one column value actually *changes*. Re-saving a note without editing it leaves `updated_at` untouched and `affectedRows` at 0. So the update repository method has to tell "no such note (or not yours)" apart from "nothing changed", using `resultSetHeader.affectedRows` against a prior existence check. Otherwise an unmodified save returns a spurious 404. There's a dedicated integration test for this.
- All queries use **parameterized placeholders** (`?`). String concatenation into SQL is forbidden. SonarQube will flag it, and it's an injection vector.
- Schema lives in `db/schema.sql`, applied by Docker Compose on first boot via `/docker-entrypoint-initdb.d`.

## Seed data

`db/seed.sql` creates one demo user (`demo@notes.local` / `Demo@1234`) with a few notes, for manual UI checks. Never loaded in production.
