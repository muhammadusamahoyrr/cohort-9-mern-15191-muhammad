# Requirements Coverage Matrix

Every line of the project brief mapped to where it is designed and which part builds it. Re-check this before declaring the project done.

## Technology stack

| Required | Covered by | Part |
|---|---|---|
| Node.js | Express API, `backend/` | 2 |
| React.js | Vite SPA, `frontend/` | 6–7 |
| MySQL | MySQL 8 via Docker, `db/schema.sql` | 1 |
| Pino Logger | `config/logger.js` + `pino-http` | 2 |
| Mocha (+ Chai) | backend unit + integration tests | 5 |
| Jest | frontend component/hook/context tests | 8 |
| Logger (app-wide) | logging at every layer, see `04-…` | 2–4 |
| SonarQube | `sonar-project.properties` + dockerized scanner | 9 |
| Git | branch-per-part, Conventional Commits | all |

## Key features

| Requirement | Design | Part |
|---|---|---|
| Users can sign up, log in, log out | `POST /auth/register`, `/auth/login`, `/auth/logout` | 3 |
| Notes associated with individual authenticated users | `notes.user_id` FK; every query scoped by `user_id` | 1, 4 |
| Create / edit / delete notes | `POST`, `PUT /:id`, `DELETE /:id` | 4 |
| Rich text editing | `react-quill`; `content_html` stored sanitized | 7 |
| Logging throughout the application | Pino instance imported at every layer | 2–4 |
| Log important events, errors, **http request and response**, user activities | `pino-http` req/res logging + the event table in `04-…` | 2–4 |
| Database schema for users, notes, related data | `02-DATABASE.md`, `db/schema.sql` | 1 |
| Global exception handling middleware | `error.middleware.js`, registered last | 2 |
| Meaningful error messages to users | error envelope with `code` + `details` + `requestId` | 2 |
| Log exceptions using Pino | 5xx at `error` with stack, 4xx at `warn` | 2 |
| Unit tests: **controllers, services, data access layers** | explicit per-layer test list in `05-TESTING.md` | 5 |
| SonarQube analysis + JS rules configured | quality gate + rule list in `06-SONARQUBE.md` | 9 |
| React interactive + responsive UI | plain CSS, mobile-first breakpoints | 7 |
| Dashboard showing notes + user profile | Screens 2 and 4 | 7 |
| Git branching and merging strategy | `07-GIT-WORKFLOW.md`, `--no-ff` merges | all |
| CRUD APIs on Node backend | `03-API.md` | 3–4 |

## Application screens

| Screen | Components required | Operations required | Built in |
|---|---|---|---|
| 1. Sign Up / Log In | sign-up form, log-in form | register, authenticate, redirect on success | Part 7 (`Register.jsx`, `Login.jsx`) |
| 2. Dashboard | list of user-specific notes, create-note button | fetch user notes, display list, navigate to editor | Part 7 (`Dashboard.jsx`, `NoteCard.jsx`) |
| 3. Note Editor | rich text editor, save + cancel buttons | create or edit, save to backend, return to dashboard | Part 7 (`NoteEditor.jsx`) |
| 4. User Profile *(optional)* | user details, logout button | display user info, log out | Part 7 (`Profile.jsx`) |

## Optional features

| Feature | Decision | Part |
|---|---|---|
| Real-time updates (Socket.IO) | deferred — decide after Part 9 | 10 |
| Export / import notes to a file | deferred | 10 |
| Search and filter | **search is not deferred** — `?search=` is in the core API and Dashboard | 4, 7 |

## Deliberate deviations from the brief

| Brief says | We do | Why |
|---|---|---|
| "MySQL or PostgreSQL / MongoDB" | MySQL 8 | listed explicitly in the required stack |
| "tasks" (in the optional-features wording) | notes | the brief's optional section reuses task wording from a template; the domain is notes |
| Profile screen "[optional]" | building it | it is small and satisfies "dashboard to display … user profile" |
