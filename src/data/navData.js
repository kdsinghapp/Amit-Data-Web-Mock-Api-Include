// src/data/navData.js
// Navigation mock data used by both:
// - Vite UI (Navbar + MegaMenu)
// - Express mock server (/navigation/top and /navigation/data)

export const TOP_NAV = [
  // NOTE: Navbar.jsx ensures the Data mega-menu exists even if the backend omits it.
  { key: "products", label: "Products", to: "/products" },
  { key: "developers", label: "Developers", to: "/developers" },
  { key: "company", label: "Company", to: "/company" },
  { key: "support", label: "Support", to: "/support" },
];

// Mega-menu content for "Data" (matches the screenshots).
export const DATA_MENU = {
  label: "Data",
  description:
    "Discover a range of reliable and comprehensive financial data services with dxFeed, ensuring easy access and analysis for your business.",
  middle: [
    {
      key: "market",
      label: "Market Data",
      right: [
        { label: "Equities", to: "/data/market/equities" },
        { label: "Futures", to: "/data/market/futures" },
        { label: "Explore All", to: "/data/market/equities" },
      ],
    },
    {
      key: "reference",
      label: "Reference Data",
      right: [
        { label: "Global Fundamentals", to: "/data/reference/fundamentals" },
        { label: "Corporate Actions", to: "/data/reference/actions" },
        { label: "Trading Schedules", to: "/data/reference/schedules" },
      ],
    },
    {
      key: "analytics",
      label: "Data Analytics",
      right: [
        { label: "Options Analytics", to: "/data/analytics/options" },
        { label: "Indices", to: "/data/analytics/indices" },
        { label: "Greeks and Implied Volatility", to: "/data/analytics/greeks" },
        { label: "Market Indicators", to: "/data/analytics/indicators" },
      ],
    },
    {
      key: "coverage",
      label: "Coverage",
      right: [
        { label: "United States", to: "/data/coverage/united-states" },
        { label: "Europe", to: "/data/coverage/europe" },
        { label: "Asia", to: "/data/coverage/asia" },
      ],
    },
    {
      key: "services",
      label: "Data Services",
      right: [{ label: "Explore All", to: "/data/services" }],
    },
    {
      key: "news",
      label: "News data feed",
      right: [{ label: "Explore All", to: "/data/news" }],
    },
  ],
};
