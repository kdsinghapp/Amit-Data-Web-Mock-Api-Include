import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../api/platformApi.js";
import { useCart } from "../../../data/cart.jsx";
import { useBillingRegion } from "../../../data/billingRegion.jsx";

function money(value, currency) {
  const v = Number(value || 0);
  const symbol =
    currency === "INR"
      ? "₹"
      : currency === "EUR"
        ? "€"
        : currency === "AUD"
          ? "A$"
          : "$";
  return `${symbol}${v.toFixed(0)}`;
}

function LimitRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-slate-600">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function SubscriptionPlans() {
  const { region, product } = useParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [regionMeta, setRegionMeta] = useState(null);
  const [productMeta, setProductMeta] = useState(null);
  const cart = useCart();
  const billing = useBillingRegion();

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    Promise.all([
      api.regions({ signal: ac.signal }),
      api.productsByRegion(region, { signal: ac.signal }),
      api.plans(region, product, billing.currency, { signal: ac.signal }),
    ])
      .then(([rRes, prRes, plRes]) => {
        const regions = rRes?.data || [];
        setRegionMeta(regions.find((x) => x.key === region) || null);

        const products = prRes?.data || [];
        setProductMeta(products.find((x) => x.key === product) || null);

        const items = plRes?.data || [];
        setPlans(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        setPlans([]);
        setRegionMeta(null);
        setProductMeta(null);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [region, product, billing.currency]);

  const productLabel = useMemo(() => productMeta?.label || product, [productMeta, product]);

  return (
    <div className="page-surface p-8">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Step 3</div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">{productLabel} plans</h1>
      <p className="mt-2 text-sm text-slate-600">
        Region: <span className="font-semibold">{regionMeta?.label || region}</span>
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Loading plans...
          </div>
        ) : plans.map((p) => {
          const inCart = cart.items.some((x) => x.id === p.id);
          return (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{p.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{p.summary}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-slate-900">
                    {money(p.priceMonthly, p.currency)}
                    <span className="text-sm font-medium text-slate-500">/mo</span>
                  </div>
                  <div className="text-xs text-slate-500">{p.currency}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-2">
                <LimitRow label="API calls / month" value={p.limits.apiCallsPerMonth} />
                <LimitRow label="WebSocket connections" value={p.limits.websocketConnections} />
                <LimitRow label="Symbols" value={p.limits.symbols} />
                <LimitRow label="Users" value={p.limits.users} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {p.features.slice(0, 6).map((f) => (
                  <span key={f} className="chip chip-slate">{f}</span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to={`/subscription/${region}/market-data/${product}/plans/${p.key}`}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  View details
                </Link>

                <button
                  type="button"
                  disabled={inCart}
                  onClick={() =>
                    cart.add({
                      id: p.id,
                      name: `${productLabel} - ${p.name}`,
                      region,
                      product,
                      priceMonthly: p.priceMonthly,
                      priceMonthlyUSD: p.priceMonthlyUSD,
                      currency: p.currency,
                      meta: { planKey: p.key },
                    })
                  }
                  className={
                    inCart
                      ? "rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
                      : "rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
                  }
                >
                  {inCart ? "Added" : "Add to cart"}
                </button>

                <Link className="text-sm font-semibold text-slate-700 hover:text-slate-900" to="/cart">
                  Cart →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link className="text-sm font-semibold text-orange-600 hover:text-orange-500" to={`/subscription/${region}/market-data`}>
          ← Back
        </Link>
        <Link className="text-sm font-semibold text-slate-700 hover:text-slate-900" to="/subscription">
          Subscription home →
        </Link>
      </div>
    </div>
  );
}
