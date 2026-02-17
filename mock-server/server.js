import express from "express";
import cors from "cors";

import { TOP_NAV, DATA_MENU } from "../src/data/navData.js";
import { REGIONS, GEO_REGIONS, getGeoRegionsDetailed, getAvailableProducts, getPlans, REGION_PRODUCTS } from "../src/data/subscriptionData.js";
import { MARKET_CATEGORIES, MARKET_CATEGORY_META, MARKET_REGIONS, MARKET_REGION_DETAIL } from "../src/data/marketData.js";
import {
  INDICES_FORMS_CONFIG,
  getCurrentConstituents,
  getHistoricalConstituents,
  getCurrentConstituentPrices,
  getHistoricalConstituentPrices,
} from "../src/data/analyticsData.js";

const app = express();
app.use(cors());
app.use(express.json());

function ok(res, data) {
  return res.json({ data });
}

function notFound(res, message = "Not found") {
  return res.status(404).json({ error: message });
}

app.get("/health", (req, res) => {
  ok(res, { status: "ok" });
});

// ---------- Navigation ----------
app.get("/navigation/top", (req, res) => {
  // Ensure no Subscription link in navbar.
  const cleaned = (TOP_NAV || []).filter((it) => it?.key !== "subscription" && it?.label !== "Subscription");
  ok(res, cleaned);
});

app.get("/navigation/data", (req, res) => {
  ok(res, DATA_MENU);
});

// ---------- Pricing / Billing ----------
app.get("/pricing/regions", (req, res) => {
  // Reuse subscription regions as billing regions (currency display + checkout)
  ok(res, REGIONS);
});

// ---------- Data Analytics (Indices) ----------

// Config for dynamic forms + result columns
app.get("/analytics/indices/config", (req, res) => {
  ok(res, INDICES_FORMS_CONFIG);
});

// Constituent (current)
app.get("/analytics/indices/constituent/current", (req, res) => {
  const index = String(req.query.index || "IBC50");
  ok(res, { rows: getCurrentConstituents(index) });
});

// Constituent (historical)
app.get("/analytics/indices/constituent/historical", (req, res) => {
  const index = String(req.query.index || "IBC50");
  const from = String(req.query.from || "2025-07-01");
  const to = String(req.query.to || "2025-07-03");
  ok(res, { rows: getHistoricalConstituents(index, from, to) });
});

// Constituent price (current)
app.get("/analytics/indices/constituent-price/current", (req, res) => {
  const index = String(req.query.index || "IBC50");
  ok(res, { rows: getCurrentConstituentPrices(index) });
});

// Constituent price (historical)
app.get("/analytics/indices/constituent-price/historical", (req, res) => {
  const index = String(req.query.index || "IBC50");
  const from = String(req.query.from || "2025-07-01");
  const to = String(req.query.to || "2025-07-03");
  ok(res, { rows: getHistoricalConstituentPrices(index, from, to) });
});

// ---------- Subscription catalog ----------
app.get("/subscription/regions", (req, res) => {
  ok(res, REGIONS);
});

// Geography (continent) regions -> markets
app.get("/subscription/geo/regions", (req, res) => {
  // Example response:
  // [
  //   { key: "asia", label: "Asia", markets: [{ key:"india", label:"INDIA", name:"India", currency:"INR", geo:"asia" }] }
  // ]
  ok(res, getGeoRegionsDetailed());
});

app.get("/subscription/geo/regions/:geo/markets", (req, res) => {
  const geoKey = String(req.params.geo || "").toLowerCase();
  const geo = (GEO_REGIONS || []).find((g) => g.key === geoKey);
  if (!geo) return notFound(res, "Unknown geography region");
  const markets = (geo.markets || []).map((mk) => REGIONS.find((r) => r.key === mk)).filter(Boolean);
  ok(res, markets);
});

app.get("/subscription/regions/:region/products", (req, res) => {
  const regionKey = String(req.params.region || "").toLowerCase();
  const region = REGIONS.find((r) => r.key === regionKey);
  if (!region) return notFound(res, "Unknown region");
  ok(res, getAvailableProducts(regionKey));
});

app.get("/subscription/regions/:region/products/:product/plans", (req, res) => {
  const regionKey = String(req.params.region || "").toLowerCase();
  const productKey = String(req.params.product || "").toLowerCase();

  const region = REGIONS.find((r) => r.key === regionKey);
  if (!region) return notFound(res, "Unknown region");

  const allowed = REGION_PRODUCTS?.[regionKey] || [];
  if (!allowed.includes(productKey)) return notFound(res, "Product not available for region");

  const currency = String(req.query.currency || "").toUpperCase();
  ok(res, getPlans(productKey, regionKey, currency));
});


// ---------- Market Data (UI like screenshot) ----------
app.get("/market/categories", (req, res) => {
  ok(res, { categories: MARKET_CATEGORIES });
});

app.get("/market/categories/:category", (req, res) => {
  const key = String(req.params.category || "").toLowerCase();
  const category = MARKET_CATEGORY_META?.[key] || null;
  if (!category) return notFound(res, "Unknown category");
  ok(res, { category: { key, ...category } });
});

app.get("/market/categories/:category/regions", (req, res) => {
  const key = String(req.params.category || "").toLowerCase();
  const regions = MARKET_REGIONS?.[key] || null;
  if (!regions) return notFound(res, "Unknown category");
  ok(res, { regions });
});

app.get("/market/categories/:category/regions/:region", (req, res) => {
  const categoryKey = String(req.params.category || "").toLowerCase();
  const regionKey = String(req.params.region || "").toLowerCase();
  const region = MARKET_REGION_DETAIL?.[categoryKey]?.[regionKey] || null;
  if (!region) return notFound(res, "Unknown region");
  ok(res, { region });
});


// Fallback
app.use((req, res) => notFound(res));

const port = Number(process.env.MOCK_API_PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Mock API running: http://localhost:${port}`);
});
