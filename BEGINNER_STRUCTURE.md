# Project Structure (Easy / Beginner)

## src/

### 1) app/  (App entry + layout)
- `src/app/App.jsx`  
  All routes in one place (easy to find).

- `src/app/layout/`  
  `Navbar`, `MegaMenu`, `Shell`, `Footer`.

### 2) api/  (all API calls)
- `src/api/http.js`  
  Simple `get()` wrapper using `VITE_API_BASE_URL`.

- `src/api/platformApi.js`  
  All endpoint functions:
  - `api.regions()`
  - `api.productsByRegion(region)`
  - `api.plans(region, product)`
  - `api.navTop()`
  - `api.navData()`

### 3) features/  (feature-wise pages)
Each feature keeps its pages together:

- `src/features/subscription/pages/*`
- `src/features/market/pages/*`
- `src/features/reference/pages/*`
- `src/features/analytics/pages/*`
- `src/features/coverage/pages/*`
- `src/features/checkout/pages/*`

### 4) components/  (shared UI components)
- `Badge`, `PageHeader`, `Table`, `SideNav`

### 5) data/  (local/static data + cart state)
- `navData.js`          (fallback nav + mega menu)
- `subscriptionData.js` (labels/helpers)
- `cart.js`             (CartProvider + useCart)

### 6) config/
- `env.js` (reads `.env`)

---

## Most common “where is it?” questions

- **Routes**: `src/app/App.jsx`
- **Navbar / Mega menu**: `src/app/layout/`
- **API base URL**: `.env` + `src/config/env.js`
- **Subscription screens**: `src/features/subscription/pages/`
