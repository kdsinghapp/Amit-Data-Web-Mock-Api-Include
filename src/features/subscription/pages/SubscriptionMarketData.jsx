import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../api/platformApi.js";

export default function SubscriptionMarketData() {
  const { region } = useParams();
  const [products, setProducts] = useState([]);
  const [regionMeta, setRegionMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    Promise.all([
      api.regions({ signal: ac.signal }),
      api.productsByRegion(region, { signal: ac.signal }),
    ])
      .then(([rRes, pRes]) => {
        const regions = rRes?.data || [];
        const rm = regions.find((x) => x.key === region) || null;
        setRegionMeta(rm);

        const items = pRes?.data || [];
        setProducts(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        setProducts([]);
        setRegionMeta(null);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [region]);

  return (
    <div className="page-surface p-8">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Step 2
      </div>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        Market Data
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Region:{" "}
        <span className="font-semibold">{regionMeta?.label || region}</span>.
        Choose a product category.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
            Loading products...
          </div>
        ) : (
          products.map((p) => (
            <Link
              key={p.key}
              to={`/subscription/${region}/market-data/${p.key}/plans`}
              className="rounded-2xl border border-slate-200 bg-white p-6 hover:bg-slate-50 transition"
            >
              <div className="text-lg font-semibold text-slate-900">
                {p.label}
              </div>
              <div className="mt-2 text-sm text-slate-600">{p.short}</div>
              <div className="mt-4 inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                View plans
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Link
          className="text-sm font-semibold text-orange-600 hover:text-orange-500"
          to="/subscription/regions"
        >
          ← Back
        </Link>
        <Link
          className="text-sm font-semibold text-slate-700 hover:text-slate-900"
          to="/cart"
        >
          Go to cart →
        </Link>
      </div>
    </div>
  );
}
