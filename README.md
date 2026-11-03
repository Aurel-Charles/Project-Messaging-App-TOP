# Full-Stack Template: React + Express + Prisma

Starter template with a React front end and an Express REST API in a single repository.

## Stack

| Folder | Tech |
|---|---|
| `client/` | React, Vite, Vitest, Testing Library, ESLint |
| `server/` | Express 5, Prisma 7 (PostgreSQL), CORS, Vitest, SuperTest |

## Project structure

```
.
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── test/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── setupTests.js
│   ├── .env.example
│   └── vite.config.js
└── server/
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── controllers/
    │   ├── db/
    │   │   └── prisma.js
    │   ├── middlewares/
    │   ├── routes/
    │   ├── test/
    │   ├── app.js
    │   └── server.js
    ├── .env.example
    └── prisma7.config.ts
```

`app.js` builds and exports the Express app; `server.js` only starts it. This split lets SuperTest import the app without opening a port.

## Getting started

### 1. Environment variables

Copy each example file and fill in the values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**server/.env**

| Variable | Description |
|---|---|
| `APP_NAME` | Name shown in the server log and on the `/` route |
| `APP_MESSAGE` | Message returned by the `/` route |
| `DATABASE_URL` | PostgreSQL connection string |
| `TEST_DATABASE_URL` | Separate database used when `NODE_ENV=test` |
| `CORS_ORIGINS` | Allowed front-end URLs, comma-separated, no spaces |
| `PORT` | API port (defaults to `3000`) |

**client/.env**

| Variable | Description |
|---|---|
| `VITE_APP_TITLE` | Title shown in the app |
| `VITE_API_URL` | Base URL of the API |

Only variables prefixed with `VITE_` are exposed to the client, and they end up in the browser bundle: never put secrets in `client/.env`.

### 2. Install

```bash
cd server && npm install
cd ../client && npm install
```

`npm install` in `server/` also runs `prisma generate` (via `postinstall`).

### 3. Database

Add your models to `server/prisma/schema.prisma`, then:

```bash
cd server
npx prisma migrate dev --name init
```

### 4. Run in development

In two terminals:

```bash
cd server && npm run dev   # http://localhost:3000
cd client && npm run dev   # http://localhost:5173
```

## Scripts

| Folder | Command | Description |
|---|---|---|
| `server/` | `npm run dev` | Start the API with auto-reload (`node --watch`) |
| `server/` | `npm start` | Start the API (production) |
| `server/` | `npm test` | Run Vitest + SuperTest (uses `TEST_DATABASE_URL`) |
| `client/` | `npm run dev` | Start the Vite dev server |
| `client/` | `npm run build` | Build for production into `dist/` |
| `client/` | `npm test` | Run Vitest + Testing Library |
| `client/` | `npm run lint` | Run ESLint |

## Deployment

- **API (e.g. Render)**: build command `npm install`, start command `npm start`, root directory `server`. Set all `server/.env` variables in the dashboard, with `CORS_ORIGINS` pointing to the deployed front end.
- **Front end (e.g. Netlify)**: base directory `client`, build command `npm run build`, publish directory `client/dist`. Set `VITE_API_URL` to the deployed API URL.
