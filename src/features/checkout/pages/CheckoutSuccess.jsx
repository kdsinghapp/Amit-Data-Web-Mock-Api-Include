import React from "react";
import { Link } from "react-router-dom";

export default function CheckoutSuccess() {
  return (
    <div className="page-surface p-8">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Success</div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Order placed</h1>
      <p className="mt-2 text-sm text-slate-600">
        This is a demo flow. Hook this screen to your real payment + provisioning system.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/subscription"
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
        >
          Buy more plans
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
