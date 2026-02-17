import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import AnalyticsLayout from "./AnalyticsLayout.jsx";

export default function GreeksIV() {
  return (
    <div>
      <PageHeader eyebrow="Data analytics" title="Greeks and Implied Volatility" />
      <AnalyticsLayout>
        <div className="page-surface p-6">
          <div className="text-sm text-slate-600">
            Greeks and implied volatility endpoints placeholder.
          </div>
        </div>
      </AnalyticsLayout>
    </div>
  );
}
