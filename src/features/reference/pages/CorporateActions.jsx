import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import ReferenceLayout from "./ReferenceLayout.jsx";

export default function CorporateActions() {
  return (
    <div>
      <PageHeader eyebrow="Reference data" title="Corporate actions" />
      <ReferenceLayout>
        <div className="page-surface p-6">
          <div className="text-sm text-slate-600">
            Corporate actions: splits, dividends, mergers, symbol changes. Placeholder.
          </div>
        </div>
      </ReferenceLayout>
    </div>
  );
}
