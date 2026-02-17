// Subscription catalog
// - Regions can enable different products.
// - Each region+product can have exactly one plan selected.

export const REGIONS = [
  { key: "india", label: "INDIA", name: "India", currency: "INR", geo: "asia" },
  { key: "us", label: "US", name: "United States", currency: "USD", geo: "north_america" },
  { key: "ue", label: "EU", name: "European Union", currency: "EUR", geo: "europe" },
  { key: "au", label: "AU", name: "Australia", currency: "AUD", geo: "oceania" },
];

// NOTE: Mock FX rates for pricing display & mock API conversions.
// Baseline is USD.
export const FX_FROM_USD = {
  USD: 1,
  EUR: 0.92,
  INR: 83,
  AUD: 1.55,
};

export function convertFromUSD(amount, currency) {
  const v = Number(amount || 0);
  const cur = String(currency || "USD").toUpperCase();
  const rate = FX_FROM_USD[cur] ?? 1;
  return Math.round(v * rate);
}

export const GEO_REGIONS = [
  { key: "asia", label: "Asia", markets: ["india"] },
  { key: "north_america", label: "North America", markets: ["us"] },
  { key: "europe", label: "Europe", markets: ["ue"] },
  { key: "oceania", label: "Oceania", markets: ["au"] },
];

export function getGeoRegionsDetailed() {
  // Returns GEO regions with embedded market metadata
  return GEO_REGIONS.map((g) => ({
    ...g,
    markets: (g.markets || [])
      .map((mk) => REGIONS.find((r) => r.key === mk))
      .filter(Boolean),
  }));
}
export const PRODUCT_MAP = {
  equity: { key: "equity", label: "EQUITY", short: "Equities & ETFs" },
  forex: { key: "forex", label: "FOREX", short: "FX (Spot & Forwards)" },
  futures_options: { key: "futures_options", label: "FUTURE OPTION", short: "Futures & Options market data" },
  bonds: { key: "bonds", label: "BOND", short: "Rates, treasuries & corporate bonds" },
};

// Region-wise product availability (edit this as your business expands)
export const REGION_PRODUCTS = {
  us: ["forex", "futures_options"],
  india: ["equity", "forex"],
  ue: ["equity", "forex"],
  au: ["equity"],
};

// Export a flat list of all products (used by older pages)
export const PRODUCTS = Object.values(PRODUCT_MAP);

export const PLAN_KEYS = ["starter", "business", "elite", "pro", "anyone"];

const COMMON_FEATURES = {
  starter: [
    "REST API access",
    "Real-time snapshots (polling)",
    "1 year historical OHLCV",
    "Standard rate limits",
    "Email support",
  ],
  business: [
    "REST + WebSocket streaming",
    "Tick-by-tick (where available)",
    "5 years historical OHLCV",
    "Higher rate limits",
    "Priority email support",
  ],
  elite: [
    "REST + WebSocket streaming",
    "Tick-by-tick (where available)",
    "10 years historical OHLCV + replay",
    "Burst rate limits",
    "Priority support (SLA)",
    "Multiple API keys + team seats",
  ],
  pro: [
    "Dedicated throughput profile",
    "Advanced entitlement controls",
    "Custom symbols & coverage packs",
    "SLA + phone/Slack support",
    "Audit logs + usage analytics",
  ],
  anyone: [
    "Single-product access",
    "Simplified onboarding",
    "Fair-use limits",
    "Community support",
  ],
};

const ADDONS = {
  equity: {
    starter: ["Basic fundamentals", "Top-of-book (where available)", "Corporate actions (basic)"],
    business: ["Extended fundamentals", "Corporate actions + dividends", "End-of-day bulk"] ,
    elite: ["Global fundamentals + statements", "Options reference (read-only)", "Low-latency routing"],
    pro: ["Custom feeds", "Entitlement-ready symbols", "Institutional routing"],
    anyone: ["Starter features", "Equity-only"],
  },
  forex: {
    starter: ["Majors + minors coverage", "1s + 1m bars", "Trading session calendar"],
    business: ["Expanded crosses", "Streaming quotes", "Fixings snapshots"],
    elite: ["Expanded crosses + exotics", "Sub-second ticks (where available)", "Forwards & swaps reference"],
    pro: ["Prime-like routing", "Custom liquidity profiles", "Dedicated endpoints"],
    anyone: ["Starter features", "Forex-only"],
  },
  futures_options: {
    starter: ["Front-month futures", "Delayed options chains", "Settlement calendar"],
    business: ["Real-time futures", "Options chains (standard)", "Open interest"] ,
    elite: ["Full chains + Greeks", "Streaming", "Historical chains (where available)"],
    pro: ["Full depth", "Custom venues", "SLA"],
    anyone: ["Starter features", "Futures/options-only"],
  },
  bonds: {
    starter: ["Treasury curve snapshots", "Reference ISIN data", "EOD yields"],
    business: ["Intraday curve updates", "Corporate bond reference", "Calendars"],
    elite: ["Streaming curves", "Expanded corporates", "Analytics add-ons"],
    pro: ["Institutional distribution", "Custom curves", "SLA"],
    anyone: ["Starter features", "Bond-only"],
  },
};

function priceFor(productKey) {
  // simple baseline pricing
  const base = {
    equity: { starter: 79, business: 129, elite: 199, pro: 399, anyone: 49 },
    forex: { starter: 59, business: 99, elite: 149, pro: 299, anyone: 39 },
    futures_options: { starter: 89, business: 149, elite: 249, pro: 499, anyone: 59 },
    bonds: { starter: 49, business: 89, elite: 149, pro: 299, anyone: 29 },
  };
  return base[productKey] || base.equity;
}

function limitsFor(productKey, planKey) {
  const byProduct = {
    equity: {
      starter: { apiCallsPerMonth: "750,000", websocketConnections: "—", symbols: "5,000", users: "1" },
      business: { apiCallsPerMonth: "1,500,000", websocketConnections: "3", symbols: "15,000", users: "3" },
      elite: { apiCallsPerMonth: "3,000,000", websocketConnections: "10", symbols: "50,000+", users: "Up to 10" },
      pro: { apiCallsPerMonth: "Custom", websocketConnections: "Custom", symbols: "Custom", users: "Custom" },
      anyone: { apiCallsPerMonth: "250,000", websocketConnections: "—", symbols: "1,000", users: "1" },
    },
    forex: {
      starter: { apiCallsPerMonth: "1,000,000", websocketConnections: "—", symbols: "150", users: "1" },
      business: { apiCallsPerMonth: "2,500,000", websocketConnections: "5", symbols: "500", users: "3" },
      elite: { apiCallsPerMonth: "5,000,000", websocketConnections: "10", symbols: "2,000+", users: "Up to 10" },
      pro: { apiCallsPerMonth: "Custom", websocketConnections: "Custom", symbols: "Custom", users: "Custom" },
      anyone: { apiCallsPerMonth: "300,000", websocketConnections: "—", symbols: "75", users: "1" },
    },
    futures_options: {
      starter: { apiCallsPerMonth: "600,000", websocketConnections: "—", symbols: "2,000", users: "1" },
      business: { apiCallsPerMonth: "1,500,000", websocketConnections: "5", symbols: "10,000", users: "3" },
      elite: { apiCallsPerMonth: "3,500,000", websocketConnections: "12", symbols: "25,000", users: "Up to 10" },
      pro: { apiCallsPerMonth: "Custom", websocketConnections: "Custom", symbols: "Custom", users: "Custom" },
      anyone: { apiCallsPerMonth: "200,000", websocketConnections: "—", symbols: "1,000", users: "1" },
    },
    bonds: {
      starter: { apiCallsPerMonth: "400,000", websocketConnections: "—", symbols: "50,000 ISIN", users: "1" },
      business: { apiCallsPerMonth: "900,000", websocketConnections: "3", symbols: "150,000 ISIN", users: "3" },
      elite: { apiCallsPerMonth: "2,000,000", websocketConnections: "8", symbols: "500,000+ ISIN", users: "Up to 10" },
      pro: { apiCallsPerMonth: "Custom", websocketConnections: "Custom", symbols: "Custom", users: "Custom" },
      anyone: { apiCallsPerMonth: "150,000", websocketConnections: "—", symbols: "25,000 ISIN", users: "1" },
    },
  };
  return byProduct[productKey]?.[planKey] || byProduct.equity.starter;
}

export function getAvailableProducts(regionKey) {
  const keys = REGION_PRODUCTS[regionKey] || [];
  return keys.map((k) => PRODUCT_MAP[k]).filter(Boolean);
}

export function getPlans(productKey, regionKey, pricingCurrency) {
  const defaultCurrency = REGIONS.find((r) => r.key === regionKey)?.currency || "USD";
  const currency = String(pricingCurrency || defaultCurrency || "USD").toUpperCase();

  const pricesUsd = priceFor(productKey);
  const addons = ADDONS[productKey] || ADDONS.equity;

  const meta = {
    starter: {
      name: "Starter",
      summary: "For prototypes and light usage.",
    },
    business: {
      name: "Business",
      summary: "For growing teams and regular production.",
    },
    elite: {
      name: "Elite",
      summary: "For serious production workloads with premium limits.",
    },
    pro: {
      name: "Pro",
      summary: "Enterprise-grade access with custom limits.",
    },
    anyone: {
      name: "Any One",
      summary: "Single-product entry plan with fair-use limits.",
    },
  };

  return PLAN_KEYS.map((planKey) => {
    const features = [
      ...COMMON_FEATURES[planKey],
      ...(addons[planKey] || []),
    ];
    return {
      id: `plan_${productKey}_${regionKey}_${planKey}`,
      key: planKey,
      name: meta[planKey].name,
      product: productKey,
      region: regionKey,
      priceMonthlyUSD: pricesUsd[planKey],
      priceMonthly: convertFromUSD(pricesUsd[planKey], currency),
      currency,
      summary: meta[planKey].summary,
      features,
      limits: limitsFor(productKey, planKey),
    };
  });
}

export function productLabel(productKey) {
  return PRODUCT_MAP[productKey]?.label || productKey;
}

export function regionLabel(regionKey) {
  return REGIONS.find((r) => r.key === regionKey)?.label || regionKey;
}
