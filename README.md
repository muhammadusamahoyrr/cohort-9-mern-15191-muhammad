# Notes App

Cohort 9 MERN-style (Node.js + React) assignment, Muhammad Usama. MySQL replaces MongoDB.

Full-stack notes application: users sign up, log in, and manage their own rich-text notes.

**Stack:** Node.js + Express, React (Vite), MySQL 8, Pino, Mocha/Chai (backend tests), Jest + RTL (frontend tests), SonarQube, Docker, Git

## Status

The frontend is done and covered by tests. The backend is next, and the
frontend is written against a REST API it expects on
`http://localhost:4000/api`.

Until that exists, `frontend/mock-server.cjs` is a small stub API that serves
enough for the UI to run:

```bash
node frontend/mock-server.cjs   # :4000
```

## Quick start

```bash
cd frontend && npm install
cp .env.example .env
npm run dev                         # http://localhost:5173
```

Once the backend lands:

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
