# Project Structure

Two independent npm packages (`backend/`, `frontend/`) in one repository. No workspace tooling — each is installed and run on its own, which keeps Jest and Mocha configs from colliding.

```
10P/
├── README.md
├── .gitignore
├── .editorconfig
├── docker-compose.yml                  # mysql (+ sonarqube, profile: sonar)
├── sonar-project.properties
│
├── docs/
│   ├── 00-PLAN.md                      # build parts + decisions
│   ├── 01-ARCHITECTURE.md              # layering, request lifecycle, auth model
│   ├── 02-DATABASE.md                  # schema, indexes, conventions
│   ├── 03-API.md                       # endpoint contract
│   ├── 04-LOGGING-AND-ERRORS.md        # Pino config, error model
│   ├── 05-TESTING.md                   # Mocha/Chai + Jest strategy
│   ├── 06-SONARQUBE.md                 # quality gate + rules
│   ├── 07-GIT-WORKFLOW.md              # branching + commits
│   ├── 08-PROJECT-STRUCTURE.md         # this file
│   └── PROGRESS.md                     # live status tracker
│
├── db/
│   ├── schema.sql                      # notes_app + notes_app_test, users, notes, indexes
│   └── seed.sql                        # demo user + notes (notes_app only, dev)
│
├── backend/
│   ├── package.json
│   ├── .env.example                    # copy to .env
│   ├── .env.test.example               # copy to .env.test (points at notes_app_test)
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── .mocharc.json
│   ├── src/
│   │   ├── server.js                   # boot, listen, signal handlers
│   │   ├── app.js                      # express app (exported for tests)
│   │   ├── config/
│   │   │   ├── env.js                  # loads + validates env vars
│   │   │   ├── logger.js               # pino instance (+ redaction)
│   │   │   └── database.js             # mysql2 pool + ping/close
│   │   ├── routes/
│   │   │   ├── index.js                # /api router
│   │   │   ├── auth.routes.js
│   │   │   ├── notes.routes.js
│   │   │   └── health.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── notes.controller.js
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   └── notes.service.js
│   │   ├── repositories/
│   │   │   ├── user.repository.js
│   │   │   └── note.repository.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js      # JWT verification
│   │   │   ├── validate.middleware.js  # schema validation
│   │   │   ├── requestLogger.middleware.js  # pino-http
│   │   │   ├── notFound.middleware.js
│   │   │   └── error.middleware.js     # global handler (registered last)
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── notes.validator.js
│   │   └── utils/
│   │       ├── AppError.js
│   │       ├── asyncHandler.js
│   │       ├── jwt.js
│   │       └── sanitize.js             # html sanitize + text extraction
│   └── test/
│       ├── setup.js
│       ├── helpers/
│       ├── unit/
│       └── integration/
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── jest.config.js
    ├── babel.config.cjs
    ├── .eslintrc.json                  # react + react-hooks rules
    ├── .prettierrc
    ├── .env.example                    # VITE_API_URL
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx                     # routes
        ├── api/
        │   ├── client.js               # axios instance + interceptors
        │   ├── auth.api.js
        │   └── notes.api.js
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   └── useNotes.js
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── Navbar.jsx              # shell: wordmark, nav, user menu
        │   ├── UserMenu.jsx            # avatar dropdown: profile + logout
        │   ├── Avatar.jsx
        │   ├── LogoutButton.jsx        # logout + confirm, used in two places
        │   ├── NoteCard.jsx
        │   ├── SearchBar.jsx
        │   ├── EmptyState.jsx          # ruled-sheet illustration + action
        │   ├── ConfirmDialog.jsx
        │   ├── Spinner.jsx
        │   └── ErrorBoundary.jsx
        ├── pages/
        │   ├── Login.jsx               # Screen 1
        │   ├── Register.jsx            # Screen 1
        │   ├── Dashboard.jsx           # Screen 2
        │   ├── NoteEditor.jsx          # Screen 3
        │   ├── Profile.jsx             # Screen 4
        │   └── NotFound.jsx
        ├── utils/
        │   └── date.js                 # relative + absolute timestamp formatting
        ├── styles/
        │   ├── tokens.css              # the design system (see 10-DESIGN-SYSTEM.md)
        │   ├── base.css                # elements, buttons, fields, .sheet surface
        │   ├── shell.css               # navbar, containers, auth, profile
        │   └── notes.css               # grid, cards, dialog, editor
        └── __tests__/
```

## Naming conventions

- Backend files: `<domain>.<layer>.js` (`notes.service.js`). Directories plural for layers, singular for the domain inside a filename.
- React components and pages: `PascalCase.jsx`, one component per file.
- Hooks: `useThing.js`. Context: `ThingContext.jsx`.
- Tests: `<subject>.test.js` / `.test.jsx`, mirroring the source path.
- Environment variables: `SCREAMING_SNAKE_CASE`; frontend ones must be prefixed `VITE_`.

## Ports

| Service | Port |
|---|---|
| Frontend (Vite) | 5173 |
| Backend (Express) | 4000 |
| MySQL | 3306 |
| SonarQube | 9000 |
