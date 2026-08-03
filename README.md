# Notes App

Cohort 9 MERN-style (Node.js + React) assignment, Muhammad Usama. MySQL replaces MongoDB.

Full-stack notes application: users sign up, log in, and manage their own rich-text notes.

**Stack:** Node.js + Express, React (Vite), MySQL 8, Pino, Mocha/Chai (backend tests), Jest + RTL (frontend tests), SonarQube, Docker, Git

## Status

The frontend ships in three pull requests: this one is the foundation —
build tooling, styles, the API client and the auth/data layer. Components
and pages follow in part 2, the Jest suite in part 3.

It is written against a REST API it expects on `http://localhost:4000/api`.
The backend comes after the frontend lands, so until then any screen that
fetches will show its error state.

## Quick start

```bash
cd frontend && npm install
echo "VITE_API_URL=http://localhost:4000/api" > .env
npm run dev                         # http://localhost:5173
```

Only `VITE_*` variables reach the browser bundle.

Once the backend lands, from the repository root:

```bash
docker compose up -d mysql          # MySQL 8 on :3306, schema auto-applied

cd backend && npm install
cp .env.example .env                # fill in JWT_SECRET
npm run dev                         # http://localhost:4000
```

## Tests

```bash
cd frontend
npm test
npm run test:coverage
npm run lint
```

## Ports

Frontend `5173`, backend `4000`, MySQL `3306`, SonarQube `9000`.
