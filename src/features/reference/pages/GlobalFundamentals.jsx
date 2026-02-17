import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import ReferenceLayout from "./ReferenceLayout.jsx";

export default function GlobalFundamentals() {
  return (
    <div>
      <PageHeader eyebrow="Reference data" title="Global Fundamentals" />
      <ReferenceLayout>
        <div className="page-surface p-6">
          <div className="text-sm font-semibold text-slate-900">Overview</div>
          <p className="mt-2 text-sm text-slate-600">
            Fundamental data allows proper trading decisions. Global Fundamentals and Reference Data are provided via APIs with simple integration and queryable fundamentals databases.
          </p>

          <div className="mt-6 text-sm font-semibold text-slate-900">Sources</div>
          <p className="mt-2 text-sm text-slate-600">
            Add vendors, normalize identifiers, and unify fields across exchanges.
          </p>
        </div>
      </ReferenceLayout>
    </div>
  );
}
