// src/data/businessMarketData.js
export const BUSINESS_MARKETDATA = {
  data: {
    Equity: {
      path: "/data/market/equities",
      component: "MarketDataPage",
      apiEndpoint: "http://localhost:3001/business-equity",
    },
    Futures: {
      path: "/futures",
      component: "FuturesPage",
      apiEndpoint: "http://localhost:3001/business-futures",
    },
    Options: {
      path: "/options",
      component: "OptionsPage",
      apiEndpoint: "http://localhost:3001/business-options",
    },
    Forex: {
      path: "/forex",
      component: "ForexPage",
      apiEndpoint: "http://localhost:3001/business-forex",
    },
  },
};

export async function fetchBusinessMarketData(baseUrl = "http://localhost:3001") {
  const res = await fetch(`${baseUrl}/business-marketdata`);
  if (!res.ok) throw new Error(`Failed to fetch business-marketdata: ${res.status}`);
  const payload = await res.json();
  return transformPayload(payload);
}

export function transformPayload(payload) {
  if (!payload || !payload.data) return [];
  return Object.entries(payload.data).map(([label, cfg]) => ({
    key: label.toLowerCase().replace(/\s+/g, "-"),
    label,
    path: cfg.path,
    to: cfg.path ? `/data/market${cfg.path}` : cfg.to || null,
    component: cfg.component,
    apiEndpoint: cfg.apiEndpoint,
  }));
}