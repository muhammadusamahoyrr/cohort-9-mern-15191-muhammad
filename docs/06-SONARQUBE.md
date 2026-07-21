# SonarQube & Code Quality

## Running SonarQube locally

SonarQube Community runs as a Docker Compose service under the `sonar` profile, so it does not start with the normal dev stack:

```bash
docker compose --profile sonar up -d sonarqube   # http://localhost:9000
```

First login `admin` / `admin` → set a new password → **My Account → Security → generate a token** → put it in `.env` as `SONAR_TOKEN` (never commit it).

## Scanner

Run from the repo root after tests have produced coverage:

```bash
npm run test:coverage --prefix backend
npm run test:coverage --prefix frontend
docker run --rm --network host \
  -v "${PWD}:/usr/src" \
  -e SONAR_TOKEN \
  sonarsource/sonar-scanner-cli
```

Using the dockerized scanner avoids installing `sonar-scanner` and Java on Windows.

## `sonar-project.properties` (repo root)

```properties
sonar.projectKey=notes-app
sonar.projectName=Notes App
sonar.sources=backend/src,frontend/src
sonar.tests=backend/test,frontend/src/__tests__
sonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/*.test.js,**/*.test.jsx
sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info
sonar.sourceEncoding=UTF-8
```

## Quality gate targets

| Metric | Target |
|---|---|
| Coverage on new code | ≥ 80% |
| Duplicated lines | < 3% |
| Bugs / Vulnerabilities | 0 |
| Security hotspots | all reviewed |
| Maintainability rating | A |
| Cognitive complexity per function | ≤ 15 |

## Rules that matter for this codebase

- **S2077 / S3649** — SQL built by concatenation. Every query must use `?` placeholders; this is the single most important rule here.
- **S2068** — hardcoded credentials. Secrets come from `.env` only; `.env` is gitignored and `.env.example` holds placeholders.
- **S4507** — stack traces in responses. Only outside production (see error middleware).
- **S1481 / S1854** — unused and dead variables.
- **S3776** — cognitive complexity; split any controller/service function that trips it.
- **S6551 / react hooks rules** — missing `useEffect` dependencies.

## Local gate before pushing

ESLint (`eslint:recommended` + `plugin:react/recommended` + `plugin:react-hooks/recommended`, with `no-console: error` in backend `src/`) and Prettier run first:

```bash
npm run lint && npm run format:check && npm test
```

Fixing lint locally means SonarQube surfaces only the issues that actually need thought.
