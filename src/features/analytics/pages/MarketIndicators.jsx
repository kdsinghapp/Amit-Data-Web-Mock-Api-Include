import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import AnalyticsLayout from "./AnalyticsLayout.jsx";

export default function MarketIndicators() {
  return (
    <div>
      <PageHeader eyebrow="Data analytics" title="Market Indicators" />
      <AnalyticsLayout>
        <div className="page-surface p-6">
          <div className="text-sm text-slate-600">Market indicators placeholder.</div>
        </div>
      </AnalyticsLayout>
    </div>
  );
}
