// src/api/platformApi.js
// All backend endpoints used by the UI (Postman mock or real API)

import { get } from "./http.js";

function withQuery(path, params) {
  const sp = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

// ---------- Navigation ----------
export const api = {
  navTop: (opts) => get("/navigation/top", opts),
  navData: (opts) => get("/navigation/data", opts),

  // ---------- Billing / Pricing ----------
  pricingRegions: (opts) => get("/pricing/regions", opts),

  // ---------- Subscription ----------
  regions: (opts) => get("/subscription/regions", opts),
  productsByRegion: (regionKey, opts) =>
    get(`/subscription/regions/${regionKey}/products`, opts),
  plans: (regionKey, productKey, billingCurrency, opts) =>
    get(`/subscription/regions/${regionKey}/products/${productKey}/plans`, {
      ...(opts || {}),
      params: { ...(opts?.params || {}), currency: billingCurrency },
    }),

  // Geography coverage (continent -> markets)
  geoRegions: (opts) => get("/subscription/geo/regions", opts),
  geoMarkets: (geoKey, opts) => get(`/subscription/geo/regions/${geoKey}/markets`, opts),

  // ---------- Market Data (UI like screenshot) ----------
  marketCategories: (opts) => get("/market/categories", opts),
  marketCategory: (categoryKey, opts) => get(`/market/categories/${categoryKey}`, opts),
  marketRegions: (categoryKey, opts) => get(`/market/categories/${categoryKey}/regions`, opts),
  marketRegion: (categoryKey, regionKey, opts) =>
    get(`/market/categories/${categoryKey}/regions/${regionKey}`, opts),

  // ---------- Data Analytics (Indices) ----------
  indicesConfig: (opts) => get("/analytics/indices/config", opts),
  indicesRun: (endpoint, params, opts) => get(withQuery(endpoint, params), opts),
};
