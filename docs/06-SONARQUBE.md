# SonarQube & Code Quality

## Running SonarQube locally

SonarQube Community runs as a Docker Compose service under the `sonar` profile, so it does not start with the normal dev stack:

```bash
docker compose --profile sonar up -d sonarqube   # http://localhost:9000
```

First login `admin` / `admin` → set a new password → **My Account → Security → generate a token** → put it in `.env` as `SONAR_TOKEN` (never commit it).

## Scanner

Run from the repo root after tests have produced coverage:

```powershell
npm run test:coverage --prefix backend
npm run test:coverage --prefix frontend

docker run --rm `
  -v "${PWD}:/usr/src" `
  -e SONAR_HOST_URL="http://host.docker.internal:9000" `
  -e SONAR_TOKEN="$env:SONAR_TOKEN" `
  sonarsource/sonar-scanner-cli
```

Using the dockerized scanner avoids installing `sonar-scanner` and a JDK on Windows.

> **Windows note:** do **not** use `--network host` — on Docker Desktop for Windows it does not give the container access to the host's ports, and the scan fails to reach SonarQube. `host.docker.internal` is the correct address for a container calling a service on the Windows host.

## `sonar-project.properties` (repo root)

```properties
sonar.projectKey=notes-app
sonar.projectName=Notes App

sonar.sources=backend/src,frontend/src
sonar.tests=backend/test,frontend/src/__tests__

# frontend/src/__tests__ sits inside sonar.sources, so it MUST be excluded from
# sources or the scanner aborts with "File can't be indexed twice".
sonar.exclusions=**/node_modules/**,**/coverage/**,**/dist/**,**/build/**,frontend/src/__tests__/**,**/*.test.js,**/*.test.jsx
sonar.test.inclusions=**/*.test.js,**/*.test.jsx,backend/test/**

sonar.javascript.lcov.reportPaths=backend/coverage/lcov.info,frontend/coverage/lcov.info
sonar.sourceEncoding=UTF-8
```

The same trap applies to colocated `*.test.jsx` files — keeping frontend tests in `frontend/src/__tests__/` (as the structure doc specifies) keeps this exclusion to a single line.

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
