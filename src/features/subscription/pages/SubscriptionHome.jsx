import React from "react";
import { Link } from "react-router-dom";

export default function SubscriptionHome() {
  return (
    <div className="page-surface p-8">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Order data
      </div>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">
        Choose your data plan
      </h1>
      <p className="mt-3 text-sm text-slate-600 max-w-2xl">
        You can select multiple regions, pick products per region, and choose
        exactly one plan per product. Add all selected plans to cart and
        checkout.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        <Link
          to="/subscription/coverage"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
        >
          <div className="text-sm font-semibold text-slate-900">
            Region-based coverage
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Select by geography (Asia / North America / Europe / Oceania) then
            pick markets under each region.
          </div>
        </Link>
        <Link
          to="/subscription/regions"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
        >
          <div className="text-sm font-semibold text-slate-900">
            Country-based coverage
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Pick one or more regions (INDIA/US/EU/AU) to scope coverage and
            pricing.
          </div>
        </Link>
        <Link
          to="/subscription/products"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
        >
          <div className="text-sm font-semibold text-slate-900">
            Market data products
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Products can differ by region (e.g., US: Forex + Future Option,
            India: Equity + Forex).
          </div>
        </Link>
      </div>
    </div>
  );
}
