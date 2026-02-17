# Mock API (Postman) + Frontend Setup (Beginner)

## 1) Endpoints used by this project

All endpoints return this shape:

```json
{ "data": ... }
```

### Navigation
- `GET /navigation/top`  -> Top navbar
- `GET /navigation/data` -> Mega menu

### Data analytics (Indices forms)
- `GET /analytics/indices/config` -> UI config (tabs, form fields, result columns)
- `GET /analytics/indices/constituent/current?index=IBC50`
- `GET /analytics/indices/constituent/historical?index=IBC50&from=2025-07-01&to=2025-07-03`
- `GET /analytics/indices/constituent-price/current?index=IBC50`
- `GET /analytics/indices/constituent-price/historical?index=IBC50&from=2025-07-01&to=2025-07-03`

### Subscription catalog
- `GET /subscription/regions`
- `GET /subscription/regions/{region}/products`
- `GET /subscription/regions/{region}/products/{product}/plans`

### Geography coverage
- `GET /subscription/geo/regions`
- `GET /subscription/geo/regions/{geo}/markets`

---

## 2) Create Postman Mock Server

1. Postman → **Import**
2. Select: `Amit_Sir_Postman_Collection.json`

For Data Analytics (Indices) use: `Amit_Sir_Postman_Collection_UPDATED.json`
3. In Postman sidebar → Collection → `...` → **Mock collection / Create mock server**
4. Create the mock server
5. Copy the generated base URL (example):
   `https://xxxxxx.mock.pstmn.io`

---

## (Optional) Run Local Mock Server (NO Postman needed)

This repo includes a small Express mock server that serves the same endpoints.

```bash
npm install
npm run dev:mock
```

It runs on:

- `http://localhost:4000` (API)
- `http://localhost:5173` (Vite app)

Make sure `.env` has:

```bash
VITE_API_BASE_URL=http://localhost:4000
```

---

## 3) Connect the React app with the mock URL (MOST IMPORTANT)

In project root, create `.env` (NOT `.env.example`):

```bash
cp .env.example .env
```

Then set:

```bash
VITE_API_BASE_URL=https://xxxxxx.mock.pstmn.io
```

Restart Vite (very important):

```bash
# stop current dev server
Ctrl + C

# start again
npm run dev
```

If `.env` is missing, the app will call relative URLs like:
`http://localhost:5173/subscription/regions` (this is the exact issue you were seeing)

---

## 4) Change mock data

Postman → open the imported collection → open a request → **Examples** → edit JSON → **Save**.

---

## 5) Where it's integrated in code

- `src/config/env.js`                → reads `VITE_API_BASE_URL`
- `src/api/http.js`                  → fetch wrapper (uses base URL)
- `src/api/platformApi.js`           → endpoint functions (api.regions(), api.plans(), etc.)
- `src/app/layout/Navbar.jsx`        → loads `/navigation/top`
- `src/app/layout/MegaMenu.jsx`      → loads `/navigation/data`
- `src/features/subscription/pages/` → subscription screens using API
