// src/data/marketData.js
// Mock data for Market Data pages (Equities, Futures, etc.) to match the UI screenshot style.

export const MARKET_CATEGORIES = [
  { key: "equities", label: "Equities & ETFs", route: "/data/market/equities" },
  { key: "futures", label: "Futures", route: "/data/market/futures" },
  { key: "options", label: "Options", route: "/data/market/options" },
  { key: "indices", label: "Indices", route: "/data/market/indices" },
  { key: "fixed-income", label: "Fixed income", route: "/data/market/fixed-income" },
  { key: "forex", label: "Forex", route: "/data/market/forex" },
  { key: "crypto", label: "Cryptocurrencies", route: "/data/market/crypto" },
  { key: "spot", label: "Spot", route: "/data/market/spot" },
];

export const MARKET_CATEGORY_META = {
  equities: {
    title: "Equities & ETFs",
    description:
      "Provides access to data feeds for equities and ETFs from the main US, EU, Turkey exchanges and OTC markets. Market data is available via low latency APIs in real-time, delayed and historical replay streams, or as a historical data download.",
  },
  futures: {
    title: "Futures",
    description:
      "Futures market data feeds for major venues. Data is available via low latency APIs in real-time, delayed and historical replay streams, or as a historical data download.",
  },
  options: { title: "Options", description: "Options market data (placeholder)." },
  indices: { title: "Indices", description: "Index market data (placeholder)." },
  "fixed-income": { title: "Fixed income", description: "Fixed income market data (placeholder)." },
  forex: { title: "Forex", description: "FX market data (placeholder)." },
  crypto: { title: "Cryptocurrencies", description: "Crypto market data (placeholder)." },
  spot: { title: "Spot", description: "Spot market data (placeholder)." },
};

export const MARKET_REGIONS = {
  equities: [
    { key: "us", label: "United States" },
    { key: "ca", label: "Canada" },
    { key: "eu", label: "European Union" },
    { key: "au", label: "Australia" },
    { key: "tr", label: "Turkey" },
  ],
  futures: [
    { key: "us", label: "United States" },
    { key: "eu", label: "European Union" },
    { key: "au", label: "Australia" },
  ],
  options: [
    { key: "us", label: "United States" },
    { key: "eu", label: "European Union" },
  ],
  indices: [
    { key: "global", label: "Global" },
  ],
  "fixed-income": [
    { key: "global", label: "Global" },
  ],
  forex: [
    { key: "global", label: "Global" },
  ],
  crypto: [
    { key: "global", label: "Global" },
  ],
  spot: [
    { key: "global", label: "Global" },
  ],
};

export const MARKET_REGION_DETAIL = {
  equities: {
    us: {
      key: "us",
      label: "United States",
      flag: "🇺🇸",
      summary: "Consolidated US Equities (NYSE, Nasdaq, NYSE American)",
      badges: ["CTA", "UTP"],
      feeds: [
        {
          id: "cta-network-a",
          code: "CTA (CTS/CQS)",
          name: "Network A",
          description: "Consolidated market data feed for NYSE-listed equities.",
          to: "/data/market/equities/us/cta-network-a",
        },
      ],
    },
    ca: {
      key: "ca",
      label: "Canada",
      flag: "🇨🇦",
      summary: "Consolidated Canadian Equities",
      badges: [],
      feeds: [
        {
          id: "tsx",
          code: "TSX",
          name: "Toronto Stock Exchange",
          description: "Market data feed for TSX-listed equities.",
          to: "/data/market/equities/ca/tsx",
        },
      ],
    },
    eu: {
      key: "eu",
      label: "European Union",
      flag: "🇪🇺",
      summary: "Major EU Equities & ETFs",
      badges: [],
      feeds: [
        {
          id: "xetra",
          code: "XETRA",
          name: "Deutsche Börse Xetra",
          description: "Market data feed for Xetra-listed equities and ETFs.",
          to: "/data/market/equities/eu/xetra",
        },
      ],
    },
    au: {
      key: "au",
      label: "Australia",
      flag: "🇦🇺",
      summary: "Australian Securities Exchange (ASX)",
      badges: [],
      feeds: [
        {
          id: "asx",
          code: "ASX",
          name: "ASX Equities",
          description: "Market data feed for ASX-listed equities.",
          to: "/data/market/equities/au/asx",
        },
      ],
    },
    tr: {
      key: "tr",
      label: "Turkey",
      flag: "🇹🇷",
      summary: "Borsa Istanbul (BIST)",
      badges: [],
      feeds: [
        {
          id: "bist",
          code: "BIST",
          name: "Borsa Istanbul Equities",
          description: "Market data feed for BIST-listed equities.",
          to: "/data/market/equities/tr/bist",
        },
      ],
    },
  },

  futures: {
    us: {
      key: "us",
      label: "United States",
      flag: "🇺🇸",
      summary: "CME Group Futures",
      metaRight: "CME Group",
      feeds: [
        {
          id: "cme",
          code: "CME",
          name: "Chicago Mercantile Exchange (CME)",
          description: "Futures market data feed for CME instruments.",
          to: "/data/market/futures/us/cme",
        },
      ],
      table: {
        caption: "Live Sample",
        columns: [
          { key: "symbol", title: "Symbol" },
          { key: "description", title: "Description" },
          { key: "prior", title: "Prior settle" },
          { key: "price", title: "Price type" },
          { key: "date", title: "Date" },
        ],
        rows: [
          { symbol: "/ESZ6-CME", description: "S&P 500 E-mini", prior: "5000.00", price: "Real-time", date: "2026-02-09" },
          { symbol: "/NQZ6-CME", description: "Nasdaq 100 E-mini", prior: "18000.00", price: "Real-time", date: "2026-02-09" },
        ],
      },
    },
    eu: {
      key: "eu",
      label: "European Union",
      flag: "🇪🇺",
      summary: "EUREX Futures",
      metaRight: "Eurex",
      feeds: [
        {
          id: "eurex",
          code: "EUREX",
          name: "Eurex Futures",
          description: "Futures market data feed for Eurex instruments.",
          to: "/data/market/futures/eu/eurex",
        },
      ],
      table: {
        caption: "Live Sample",
        columns: [
          { key: "symbol", title: "Symbol" },
          { key: "description", title: "Description" },
        ],
        rows: [
          { symbol: "FDAX", description: "DAX Futures" },
          { symbol: "FESX", description: "EURO STOXX 50 Futures" },
        ],
      },
    },
    au: {
      key: "au",
      label: "Australia",
      flag: "🇦🇺",
      summary: "ASX Futures",
      metaRight: "ASX",
      feeds: [
        {
          id: "asx-fut",
          code: "ASX",
          name: "ASX Futures",
          description: "Futures market data feed for ASX instruments.",
          to: "/data/market/futures/au/asx",
        },
      ],
      table: {
        caption: "Live Sample",
        columns: [
          { key: "symbol", title: "Symbol" },
          { key: "description", title: "Description" },
        ],
        rows: [
          { symbol: "SPI200", description: "S&P/ASX 200 Index Futures" },
        ],
      },
    },
  },

  options: {
    us: { key: "us", label: "United States", flag: "🇺🇸", summary: "US Options (placeholder)", badges: [], feeds: [] },
    eu: { key: "eu", label: "European Union", flag: "🇪🇺", summary: "EU Options (placeholder)", badges: [], feeds: [] },
  },

  indices: {
    global: { key: "global", label: "Global", flag: "🌐", summary: "Global indices (placeholder)", badges: [], feeds: [] },
  },

  "fixed-income": {
    global: { key: "global", label: "Global", flag: "🌐", summary: "Fixed income (placeholder)", badges: [], feeds: [] },
  },

  forex: {
    global: { key: "global", label: "Global", flag: "🌐", summary: "FX (placeholder)", badges: [], feeds: [] },
  },

  crypto: {
    global: { key: "global", label: "Global", flag: "🌐", summary: "Crypto (placeholder)", badges: [], feeds: [] },
  },

  spot: {
    global: { key: "global", label: "Global", flag: "🌐", summary: "Spot (placeholder)", badges: [], feeds: [] },
  },
};
