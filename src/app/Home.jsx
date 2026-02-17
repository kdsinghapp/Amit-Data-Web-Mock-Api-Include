import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <div className="relative mx-auto max-w-5xl p-6 sm:p-10">
        <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
          <div className="p-7 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              Look & Feel
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Data Platform UI
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Hover <span className="font-semibold text-slate-900">Data</span> in the navbar to open the mega menu.
              Pages follow the screenshot layout with left navigation + clean content.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                className="group rounded-2xl bg-orange-500 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                to="/data/market/equities"
              >
                <div className="flex items-center justify-between">
                  <span>Market Data</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
                <div className="mt-1 text-xs font-medium text-white/80">Equities, indices, FX, crypto</div>
              </Link>

              <Link
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                to="/data/reference/fundamentals"
              >
                <div className="flex items-center justify-between">
                  <span>Reference Data</span>
                  <span className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600">
                    →
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">Fundamentals, symbology, actions</div>
              </Link>

              <Link
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                to="/data/analytics/options"
              >
                <div className="flex items-center justify-between">
                  <span>Data Analytics</span>
                  <span className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600">
                    →
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">Options, greeks, volatility</div>
              </Link>

              <Link
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                to="/data/coverage/united-states"
              >
                <div className="flex items-center justify-between">
                  <span>Coverage</span>
                  <span className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600">
                    →
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">Regions, exchanges, instruments</div>
              </Link>

              <Link
                className="group rounded-2xl bg-slate-900 px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                to="/developers"
              >
                <div className="flex items-center justify-between">
                  <span>Developers</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
                <div className="mt-1 text-xs font-medium text-white/70">Docs, keys, examples</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
