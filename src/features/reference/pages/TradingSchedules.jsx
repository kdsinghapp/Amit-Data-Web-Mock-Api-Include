import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import ReferenceLayout from "./ReferenceLayout.jsx";

export default function TradingSchedules() {
  return (
    <div>
      <PageHeader eyebrow="Reference data" title="Trading schedules" />
      <ReferenceLayout>
        <div className="page-surface p-6">
          <div className="text-sm text-slate-600">Trading schedules and calendars placeholder.</div>
        </div>
      </ReferenceLayout>
    </div>
  );
}
