# Notes App

Full-stack notes application: users sign up, log in, and manage their own rich-text notes.

**Stack:** Node.js + Express · React (Vite) · MySQL 8 · Pino · Mocha/Chai (backend tests) · Jest + RTL (frontend tests) · SonarQube · Docker · Git

## Status

Part 0 (foundation) complete — see [docs/PROGRESS.md](docs/PROGRESS.md).
The project is built in verified increments defined in [docs/00-PLAN.md](docs/00-PLAN.md).

## Documentation

| Doc | Contents |
|---|---|
| [00-PLAN.md](docs/00-PLAN.md) | build parts, locked technical decisions |
| [01-ARCHITECTURE.md](docs/01-ARCHITECTURE.md) | layering, request lifecycle, auth model |
| [02-DATABASE.md](docs/02-DATABASE.md) | schema, indexes, SQL conventions |
| [03-API.md](docs/03-API.md) | endpoint contract, status codes, error envelope |
| [04-LOGGING-AND-ERRORS.md](docs/04-LOGGING-AND-ERRORS.md) | Pino setup, redaction, global exception handling |
| [05-TESTING.md](docs/05-TESTING.md) | test strategy and coverage targets |
| [06-SONARQUBE.md](docs/06-SONARQUBE.md) | quality gate, key rules, scanner setup |
| [07-GIT-WORKFLOW.md](docs/07-GIT-WORKFLOW.md) | branching and commit conventions |
| [08-PROJECT-STRUCTURE.md](docs/08-PROJECT-STRUCTURE.md) | full directory layout and naming |

## Quick start (available from Part 2 onward)

```bash
docker compose up -d mysql          # MySQL 8 on :3306, schema auto-applied

cd backend && npm install
cp .env.example .env                # fill in JWT_SECRET
npm run dev                         # http://localhost:4000

cd ../frontend && npm install
cp .env.example .env
npm run dev                         # http://localhost:5173
```

## Ports

Frontend `5173` · Backend `4000` · MySQL `3306` · SonarQube `9000`
