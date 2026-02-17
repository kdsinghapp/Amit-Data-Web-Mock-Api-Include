// src/data/analyticsData.js
// Mock data + config for the "Indices" screens under Data -> Data Analytics.

export const INDEX_LIST = [
  { key: "IBC50", label: "IBC50" },
  { key: "SPX", label: "S&P 500 (SPX)" },
  { key: "NDX", label: "Nasdaq 100 (NDX)" },
];

// Config drives the embedded forms (fields) and the result table (columns).
export const INDICES_FORMS_CONFIG = {
  title: "Indices",
  description:
    "Run small screens to retrieve current and historical constituents and prices. Everything on this page is driven by API config.",
  groups: [
    {
      key: "constituent",
      label: "Constituent",
      tabs: [
        {
          key: "current",
          label: "Current",
          endpoint: "/analytics/indices/constituent/current",
          fields: [
            {
              key: "index",
              label: "Index",
              type: "select",
              required: true,
              options: INDEX_LIST,
              defaultValue: "IBC50",
            },
          ],
          columns: [
            { key: "symbol", title: "Symbol" },
            { key: "name", title: "Name" },
            { key: "assetType", title: "AssetType" },
          ],
        },
        {
          key: "historical",
          label: "Historical",
          endpoint: "/analytics/indices/constituent/historical",
          fields: [
            {
              key: "index",
              label: "Index",
              type: "select",
              required: true,
              options: INDEX_LIST,
              defaultValue: "IBC50",
            },
            { key: "from", label: "From Date", type: "date", required: true, defaultValue: "2025-07-01" },
            { key: "to", label: "To Date", type: "date", required: true, defaultValue: "2025-07-03" },
          ],
          columns: [
            { key: "date", title: "Date" },
            { key: "symbol", title: "Symbol" },
            { key: "name", title: "Name" },
            { key: "assetType", title: "AssetType" },
          ],
        },
      ],
    },
    {
      key: "constituentPrice",
      label: "Constituent Price",
      tabs: [
        {
          key: "current",
          label: "Current",
          endpoint: "/analytics/indices/constituent-price/current",
          fields: [
            {
              key: "index",
              label: "Index",
              type: "select",
              required: true,
              options: INDEX_LIST,
              defaultValue: "IBC50",
            },
          ],
          columns: [
            { key: "symbol", title: "Symbol" },
            { key: "name", title: "Name" },
            { key: "assetType", title: "AssetType" },
            { key: "closePrice", title: "ClosePrice" },
          ],
        },
        {
          key: "historical",
          label: "Historical",
          endpoint: "/analytics/indices/constituent-price/historical",
          fields: [
            {
              key: "index",
              label: "Index",
              type: "select",
              required: true,
              options: INDEX_LIST,
              defaultValue: "IBC50",
            },
            { key: "from", label: "From Date", type: "date", required: true, defaultValue: "2025-07-01" },
            { key: "to", label: "To Date", type: "date", required: true, defaultValue: "2025-07-03" },
          ],
          columns: [
            { key: "date", title: "Date" },
            { key: "symbol", title: "Symbol" },
            { key: "name", title: "Name" },
            { key: "assetType", title: "AssetType" },
            { key: "closePrice", title: "ClosePrice" },
          ],
        },
      ],
    },
  ],
};

// -------------------------
// Results datasets
// -------------------------

const BASE_CONSTITUENTS = {
  IBC50: [
    { symbol: "A1", name: "A1 Inc", assetType: "Equity" },
    { symbol: "A2", name: "A2 Inc", assetType: "Equity" },
    { symbol: "B1", name: "B1 Corp", assetType: "Equity" },
  ],
  SPX: [
    { symbol: "AAPL", name: "Apple Inc", assetType: "Equity" },
    { symbol: "MSFT", name: "Microsoft", assetType: "Equity" },
    { symbol: "AMZN", name: "Amazon", assetType: "Equity" },
  ],
  NDX: [
    { symbol: "NVDA", name: "NVIDIA", assetType: "Equity" },
    { symbol: "META", name: "Meta Platforms", assetType: "Equity" },
    { symbol: "TSLA", name: "Tesla", assetType: "Equity" },
  ],
};

const PRICE_BY_DATE = {
  "2025-07-01": { A1: 101, A2: 101.5, B1: 295 },
  "2025-07-02": { A1: 102.25, A2: 101, B1: 292 },
  "2025-07-03": { A1: 104, A2: 99, B1: 294 },
};

export function getCurrentConstituents(indexKey) {
  const key = String(indexKey || "IBC50").toUpperCase();
  return BASE_CONSTITUENTS[key] || BASE_CONSTITUENTS.IBC50;
}

export function getHistoricalConstituents(indexKey, from, to) {
  // For demo purposes we return repeated constituent snapshots by date.
  const key = String(indexKey || "IBC50").toUpperCase();
  const rows = [];
  const dates = Object.keys(PRICE_BY_DATE).sort();
  const f = String(from || dates[0]);
  const t = String(to || dates[dates.length - 1]);
  for (const d of dates) {
    if (d < f || d > t) continue;
    for (const c of getCurrentConstituents(key)) {
      rows.push({ date: d, ...c });
    }
  }
  return rows;
}

export function getCurrentConstituentPrices(indexKey) {
  const key = String(indexKey || "IBC50").toUpperCase();
  const constituents = getCurrentConstituents(key);
  // Use the latest date in PRICE_BY_DATE.
  const dates = Object.keys(PRICE_BY_DATE).sort();
  const latest = dates[dates.length - 1];
  const priceMap = PRICE_BY_DATE[latest] || {};
  return constituents.map((c) => ({ ...c, closePrice: priceMap[c.symbol] ?? "" }));
}

export function getHistoricalConstituentPrices(indexKey, from, to) {
  const key = String(indexKey || "IBC50").toUpperCase();
  const rows = [];
  const dates = Object.keys(PRICE_BY_DATE).sort();
  const f = String(from || dates[0]);
  const t = String(to || dates[dates.length - 1]);
  for (const d of dates) {
    if (d < f || d > t) continue;
    const priceMap = PRICE_BY_DATE[d] || {};
    for (const c of getCurrentConstituents(key)) {
      rows.push({ date: d, ...c, closePrice: priceMap[c.symbol] ?? "" });
    }
  }
  return rows;
}
