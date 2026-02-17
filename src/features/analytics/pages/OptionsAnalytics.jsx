import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import AnalyticsLayout from "./AnalyticsLayout.jsx";

export default function OptionsAnalytics() {
  return (
    <div>
      <PageHeader eyebrow="Data analytics" title="Options Analytics" />
      <AnalyticsLayout>
        <div className="page-surface p-6">
          <div className="text-sm font-semibold text-slate-900">Market data calculations</div>
          <div className="mt-3 text-sm text-slate-600">
            Options analytics calculates theoretical option prices, greeks, implied volatilities and other metrics.
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tabs</div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              <span className="chip chip-orange">Theoretical Option Prices</span>
              <span className="chip chip-slate">Greeks</span>
              <span className="chip chip-slate">Volatilities</span>
              <span className="chip chip-slate">Various Metrics</span>
            </div>
          </div>
        </div>
      </AnalyticsLayout>
    </div>
  );
}
