import React from "react";
import SideNav from "../../../components/SideNav.jsx";

const items = [
  { label: "Options Analytics", to: "/data/analytics/options" },
  { label: "Indices", to: "/data/analytics/indices" },
  { label: "Greeks and Implied Volatility", to: "/data/analytics/greeks" },
  { label: "Market Indicators", to: "/data/analytics/indicators" },
];

export default function AnalyticsLayout({ children }) {
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:col-span-2 ">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data analytics</div>
        <div className="mt-3">
          <SideNav title="Data analytics" items={items} />
        </div>
      </aside>
      <section className="lg:col-span-10">{children}</section>
    </div>
  );
}
