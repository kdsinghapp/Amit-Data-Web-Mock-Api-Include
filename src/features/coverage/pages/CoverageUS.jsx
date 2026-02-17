import React from "react";
import PageHeader from "../../../components/PageHeader.jsx";
import Badge from "../../../components/Badge.jsx";
import CoverageLayout from "./CoverageLayout.jsx";

export default function CoverageUS() {
  return (
    <div>
      <PageHeader eyebrow="Coverage" title="United States" />
      <CoverageLayout>
        <div className="space-y-6">
          <div className="page-surface p-6">
            <div className="text-sm text-slate-600">
              Market data services cover US equities, indices, fixed income, and spot. Provided via API as live, delayed, and historical replay.
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🇺🇸</span>
                  <div className="text-sm font-semibold text-slate-900">Equities & ETFs</div>
                </div>
                <Badge variant="orange">CTA</Badge>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 p-4">
                <div className="text-sm font-semibold text-slate-900">
                  Consolidated US Equities (NYSE, Nasdaq, NYSE American)
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  CTA (CTS/CQS) feed for consolidated equities.
                </div>
              </div>
            </div>
          </div>

          <div className="page-surface p-6">
            <div className="text-sm font-semibold text-slate-900">Map</div>
            <div className="mt-3 h-48 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
              World map placeholder
            </div>
          </div>
        </div>
      </CoverageLayout>
    </div>
  );
}
