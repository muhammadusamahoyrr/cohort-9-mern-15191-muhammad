# Project Structure

Two independent npm packages (`backend/`, `frontend/`) in one repository. No workspace tooling: each is installed and run on its own, which keeps the Jest and Mocha configs from colliding.

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
│   ├── 09-REQUIREMENTS-COVERAGE.md     # brief requirements mapped to parts
│   ├── 10-DESIGN-SYSTEM.md             # visual language and tokens
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
    ├── mock-server.cjs                 # stub API for driving the UI without a backend
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
        ├── config/
        │   └── env.js                  # the only file reading import.meta.env
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── CollectionsContext.jsx  # notebooks + boards, localStorage backed
        │   └── SettingsContext.jsx     # preferences, localStorage backed
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useCollections.js
        │   ├── useDismiss.js           # click-outside + Escape for popovers
        │   ├── useNotes.js
        │   └── useSettings.js
        ├── components/
        │   ├── AppHeader.jsx           # top bar: brand, Write split button, settings
        │   ├── Sidebar.jsx             # nav rail
        │   ├── CollectionGroup.jsx     # notebooks / boards rail sections
        │   ├── Brand.jsx
        │   ├── Avatar.jsx
        │   ├── UserMenu.jsx            # avatar dropdown: profile + logout
        │   ├── LogoutButton.jsx        # logout + confirm, used in two places
        │   ├── NoteList.jsx            # list pane
        │   ├── NoteCard.jsx
        │   ├── ListOptionsMenu.jsx     # sort, filter, preview size
        │   ├── NoteSidePanel.jsx       # info / collaborators panel
        │   ├── TodoEditor.jsx          # checklist body for To Do notes
        │   ├── DrawCanvas.jsx          # sketch surface for Draw notes
        │   ├── FileDrop.jsx            # capture + attach drop target
        │   ├── MediaPanel.jsx          # audio + video recording
        │   ├── ColorPicker.jsx
        │   ├── ReminderPicker.jsx
        │   ├── SettingsDrawer.jsx
        │   ├── Menu.jsx                # shared dropdown
        │   ├── ConfirmDialog.jsx
        │   ├── Spinner.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── ErrorBoundary.jsx
        │   ├── icons.jsx               # lucide icons, aliased in one place
        │   ├── listViews.js            # per-view list pane config
        │   ├── notePalette.js          # note colour swatches
        │   └── settingsSchema.js       # settings drawer described as data
        ├── pages/
        │   ├── Login.jsx               # Screen 1
        │   ├── Register.jsx            # Screen 1
        │   ├── Workspace.jsx           # Screen 2 shell: rail + list + editor
        │   ├── NoteEditor.jsx          # Screen 3
        │   ├── EditorEmpty.jsx         # right pane when no note is open
        │   ├── Profile.jsx             # Screen 4
        │   ├── SearchView.jsx
        │   ├── BoardView.jsx
        │   ├── TrashView.jsx
        │   └── NotFound.jsx
        ├── utils/
        │   ├── date.js                 # relative + absolute timestamp formatting
        │   └── todoContent.js          # checklist HTML parse/serialize
        ├── styles/
        │   ├── tokens.css              # the design system (see 10-DESIGN-SYSTEM.md)
        │   ├── base.css                # elements, buttons, fields, .sheet surface
        │   ├── shell.css               # header, rail, containers, auth, profile
        │   └── notes.css               # list pane, cards, editor, dialogs
        └── __tests__/
            ├── helpers/render.jsx
            ├── api/  context/  hooks/  utils/
            └── pages/  components/
```

## Naming conventions

- Backend files: `<domain>.<layer>.js` (`notes.service.js`). Directories are plural for layers, singular for the domain inside a filename.
- React components and pages: `PascalCase.jsx`, one component per file.
- Hooks: `useThing.js`. Context: `ThingContext.jsx`.
- Tests: `<subject>.test.js` / `.test.jsx`, mirroring the source path.
- Environment variables: `SCREAMING_SNAKE_CASE`, and frontend ones must be prefixed `VITE_`.

## Ports

| Service | Port |
|---|---|
| Frontend (Vite) | 5173 |
| Backend (Express) | 4000 |
| MySQL | 3306 |
| SonarQube | 9000 |
