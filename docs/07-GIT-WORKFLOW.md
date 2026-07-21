# Git Workflow

## Branches

| Branch | Purpose |
|---|---|
| `main` | stable, always runnable |
| `develop` | integration branch for finished parts |
| `feature/<part>-<slug>` | one branch per plan part |
| `fix/<slug>` | bug fixes |

Feature branches come off `develop` and merge back with `--no-ff` so each part stays visible as a unit in the history.

```bash
git checkout develop
git checkout -b feature/03-auth-backend
# work, commit in small steps
git checkout develop
git merge --no-ff feature/03-auth-backend
git branch -d feature/03-auth-backend
```

`develop` merges into `main` once a part is verified end-to-end, tagged `v0.<part>.0`.

## Branch per plan part

```
feature/01-infra-database
feature/02-backend-skeleton
feature/03-auth-backend
feature/04-notes-crud
feature/05-backend-tests
feature/06-frontend-skeleton
feature/07-frontend-screens
feature/08-frontend-tests
feature/09-quality-sonarqube
```

## Commit messages — Conventional Commits

```
<type>(<scope>): <imperative summary>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`.
Scopes: `auth`, `notes`, `db`, `logger`, `api`, `ui`, `ci`, `config`.

```
feat(auth): add JWT login endpoint with bcrypt verification
fix(notes): scope update query by user_id to block cross-user edits
test(notes): cover ownership enforcement in notes service
docs(api): document pagination parameters for GET /api/notes
```

Rules: imperative mood, ≤ 72-char subject, no trailing period, one logical change per commit. Body explains *why* when the reason is not obvious from the diff.

## Never commit

`.env`, `node_modules/`, `dist/`, `coverage/`, `*.log`, `.sonar/`, MySQL data volumes, SonarQube tokens, real user data. Covered by `.gitignore` — check `git status` before every commit.

## Before pushing

```bash
npm run lint && npm test
```

A branch that does not build or whose tests fail does not get merged.
