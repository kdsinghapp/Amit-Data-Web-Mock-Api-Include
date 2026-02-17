import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/platformApi.js";
import { useCart } from "../../../data/cart.jsx";
import { useBillingRegion } from "../../../data/billingRegion.jsx";
import SubscriptionChoose from "./SubscriptionChoose.jsx";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function CardCheckbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        "w-full rounded-xl px-3 py-2 text-left transition ",
        checked
          ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cx(
            "h-5 w-5 rounded-md border flex items-center justify-center transition shrink-0",
            checked
              ? "border-indigo-600 bg-indigo-600"
              : "border-slate-300 bg-white",
          )}
        >
          {checked && (
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.3a1 1 0 0 1-1.43.004L3.29 9.22a1 1 0 1 1 1.42-1.4l3.07 3.114 6.49-6.58a1 0 0 1 1.414-.006Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>

        <span
          className={cx(
            "text-sm font-medium",
            checked ? "text-slate-700" : "text-slate-600",
          )}
        >
          {label}
        </span>
      </div>
    </button>
  );
}

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

function titleCase(s) {
  return String(s || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/* ---------- nicer checkbox ---------- */
function SmallToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx(
        "w-full flex items-center justify-between gap-3",
        "rounded-lg border px-4 py-2 text-left transition",
        checked
          ? "border-indigo-600 bg-indigo-50"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
      title={String(label || "")}
    >
      <span className="text-[11px] font-semibold text-slate-900 truncate">
        {label}
      </span>

      <span
        className={cx(
          "h-4 w-4 rounded border flex items-center justify-center shrink-0",
          checked
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 bg-white",
        )}
      >
        {checked ? (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3 w-3 text-white"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.3a1 1 0 0 1-1.43.004L3.29 9.22a1 1 0 1 1 1.42-1.4l3.07 3.114 6.49-6.58a1 0 0 1 1.414-.006Z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </span>
    </button>
  );
}

/* =========================
   ADDMORE FEATURES LOGIC
========================= */

const REQUIRED_DEFAULT_FEATURE_COUNT = 5;
const REQUIRED_FEATURE_NAMES = [
  "REST API access",
  "Real-time snapshots (polling)",
  "1 year historical OHLCV",
  "Standard rate limits",
  "Email support",
];

function getRequiredFeatures(plan) {
  const all = Array.isArray(plan?.features) ? plan.features : [];
  if (!all.length) return [];

  const required = [];
  for (const name of REQUIRED_FEATURE_NAMES) {
    if (all.includes(name) && !required.includes(name)) required.push(name);
    if (required.length >= REQUIRED_DEFAULT_FEATURE_COUNT) break;
  }

  // fallback: first 5
  for (const f of all) {
    if (required.length >= REQUIRED_DEFAULT_FEATURE_COUNT) break;
    if (!required.includes(f)) required.push(f);
  }

  return required;
}

function normalizeSelectedFeatures(plan, selectedFeatures) {
  const all = Array.isArray(plan?.features) ? plan.features : [];
  const required = getRequiredFeatures(plan);
  const set = new Set();

  // always include required
  for (const f of required) if (all.includes(f)) set.add(f);

  const selected = Array.isArray(selectedFeatures) ? selectedFeatures : [];
  for (const f of selected) if (all.includes(f)) set.add(f);

  return Array.from(set);
}

// price = proportional to selected count (same as earlier)
function computeFeaturePrice(plan, selectedFeatures) {
  const full = Number(plan?.priceMonthly || 0);
  const all = Array.isArray(plan?.features) ? plan.features : [];
  const total = all.length;
  if (!total) return full;

  const normalized = normalizeSelectedFeatures(plan, selectedFeatures);
  const count = Math.max(0, Math.min(total, normalized.length));

  return Math.round((full * count) / total);
}

/* ---------- Modal with required locked + optional checkboxes ---------- */
function FeaturesModal({
  open,
  onClose,
  plan,
  currency,
  selectedFeatures,
  onToggleFeature,
  computedPrice,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !plan) return null;

  const allFeatures = Array.isArray(plan.features) ? plan.features : [];
  const required = getRequiredFeatures(plan);
  const requiredSet = new Set(required);

  const normalizedSelected = normalizeSelectedFeatures(plan, selectedFeatures);
  const selectedSet = new Set(normalizedSelected);

  const additional = allFeatures.filter((f) => !requiredSet.has(f));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Close features modal"
      />

      <div className="relative w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <div className="text-black">
            <div className="text-xl font-semibold">Features</div>
            <div className="text-sm opacity-90">
              {plan.name} • {money(computedPrice ?? plan.priceMonthly, currency)}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 rounded-lg bg-slate-600 text-white hover:bg-slate-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bg-white px-8 py-8 text-black max-h-[70vh] overflow-auto">
          <div className="text-sm font-semibold mb-3">Included (required)</div>
          <ul className="list-disc pl-5 space-y-2 text-sm opacity-95">
            {required.map((f, i) => (
              <li key={`${f}-${i}`}>{f}</li>
            ))}
          </ul>

          <div className="mt-7">
            <div className="text-sm font-semibold mb-3">
              Add Additional Feature
            </div>

            {additional.length === 0 ? (
              <div className="text-sm opacity-80">No additional features.</div>
            ) : (
              <div className="space-y-3">
                {additional.map((f, i) => {
                  const checked = selectedSet.has(f);
                  return (
                    <div
                      key={`${f}-${i}`}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="text-sm">{f}</div>

                      <label className="inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleFeature?.(f)}
                          className="h-4 w-4 accent-indigo-500"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800 px-8 pb-8 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl px-3 py-3 text-sm font-semibold text-white hover:brightness-110"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- inline details (preview + Addmore) ---------- */
function PlanDetailsInline({ plan, onAddMore }) {
  const required = getRequiredFeatures(plan);
  const preview = required.slice(0, 5);

  return (
    <div className="mt-2 flex flex-col min-h-0">
      <div className="text-[10px] font-semibold text-slate-600">
        Plan Details
      </div>

      <div className="mt-1 space-y-1">
        {preview.length ? (
          preview.map((f, idx) => (
            <div key={`${f}-${idx}`} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <div className="text-[10px] leading-4 text-slate-600">{f}</div>
            </div>
          ))
        ) : (
          <div className="text-[10px] leading-4 text-slate-500">No details</div>
        )}
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddMore?.();
        }}
        className="mt-2 text-[10px] font-semibold text-indigo-700 hover:text-indigo-600 text-left"
      >
        Addmore
      </button>
    </div>
  );
}

/* ---------- attractive plan card ---------- */
function PlanCell({
  active,
  meta,
  plan,
  onSelect,
  onAddMore,
  displayPrice,
}) {
  if (!plan) {
    return (
      <div className="h-[220px] rounded-xl border border-slate-200 bg-white/70 backdrop-blur" />
    );
  }

  return (
    <div
      className={cx(
        "relative h-auto rounded-xl border p-3 text-left flex flex-col",
        "bg-gradient-to-br from-white to-slate-50",
        "transition-all duration-200 ease-out transform-gpu will-change-transform",
        active
          ? "border-indigo-600 shadow-md ring-2 ring-indigo-100"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.04] hover:-translate-y-0.5 hover:z-20",
      )}
    >
      {active ? (
        <div className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          Selected
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-slate-500 truncate">
            {meta.regionLabel}
          </div>
          <div className="text-[11px] font-semibold text-slate-900 truncate">
            {meta.productLabel}
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-900">
          {money(displayPrice ?? plan.priceMonthly, meta.currency)}
        </div>
      </div>

      <div className="mt-2 text-[11px] font-semibold text-slate-900 truncate">
        {plan.name}
      </div>

      <div className="flex-1 min-h-0">
        <PlanDetailsInline plan={plan} onAddMore={onAddMore} />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
        }}
        className={cx(
          "mt-3 w-full rounded-lg px-2 py-2 text-[11px] font-semibold text-white mt-auto",
          active
            ? "bg-indigo-600"
            : "bg-gradient-to-r from-indigo-600 to-violet-600",
          "transition-all duration-200",
          "hover:brightness-110 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]",
        )}
      >
        {active ? "Selected" : "Select plan"}
      </button>
    </div>
  );
}

/* ---------- ONE CARD: all currencies inside ---------- */
function SummaryAllBlock({
  title,
  groups,
  discountRate,
  onAddAll,
  onRemoveItem,
}) {
  const groupOrder = [
    "equity",
    "forex",
    "option",
    "future options",
    "fixed income",
    "crypto",
  ];

  function groupItems(items) {
    const map = new Map();
    for (const it of items) {
      const key = String(it.groupKey || it.groupLabel || "").toLowerCase();
      const arr = map.get(key) || [];
      arr.push(it);
      map.set(key, arr);
    }

    const keys = Array.from(map.keys());
    keys.sort((a, b) => {
      const ia = groupOrder.indexOf(a);
      const ib = groupOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    return keys.map((k) => ({
      key: k,
      label: map.get(k)?.[0]?.groupLabel || titleCase(k),
      rows: (map.get(k) || [])
        .slice()
        .sort((x, y) => String(x.label).localeCompare(String(y.label))),
    }));
  }

  const hasItems = groups?.some((g) => (g.items || []).length) || false;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-[11px] font-semibold text-slate-500">
          {groups?.length ? `${groups.length} currency` : "—"}
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
        {!hasItems ? (
          <div className="p-3 text-xs text-slate-600 bg-slate-50">
            No plans selected.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {groups.map((g) => {
              const items = g.items || [];
              if (!items.length) return null;

              const subtotal = items.reduce((s, it) => s + Number(it.price || 0), 0);
              const discount = subtotal > 0 ? subtotal * discountRate : 0;
              const total = subtotal - discount;

              const grouped = groupItems(items);

              return (
                <div key={g.currency} className="bg-white">
                  <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-slate-800">
                      {g.currency} Summary
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Discount {Math.round(discountRate * 100)}%
                    </div>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {grouped.map((grp) => (
                      <div key={grp.key}>
                        <div className="px-3 py-2 text-[10px] font-semibold text-slate-700 bg-white">
                          {grp.label}
                        </div>

                        <div className="px-3 pb-2 space-y-2">
                          {grp.rows.map((r) => (
                            <div key={r.id}>
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onRemoveItem?.(r);
                                  }}
                                  className="shrink-0 rounded-md border border-slate-200 bg-white p-1.5 text-slate-700 hover:border-rose-200 hover:text-rose-700 hover:shadow-sm"
                                  aria-label={`Remove ${r.label}`}
                                  title="Remove"
                                >
                                  <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M8 6V4h8v2" />
                                    <path d="M19 6l-1 14H6L5 6" />
                                    <path d="M10 11v6" />
                                    <path d="M14 11v6" />
                                  </svg>
                                </button>
                              </div>

                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex items-center gap-2">
                                  <div
                                    className="text-[11px] text-slate-800 truncate"
                                    title={r.label}
                                  >
                                    {r.label}
                                  </div>
                                </div>

                                <div className="text-[11px] font-semibold text-slate-900">
                                  {money(r.price, g.currency)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="px-3 py-2 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-slate-700">
                          Discount
                        </div>
                        <div className="text-[11px] font-semibold text-slate-900">
                          -{money(discount, g.currency)}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-[12px] font-semibold text-slate-900">
                          Total
                        </div>
                        <div className="text-[12px] font-semibold text-slate-900">
                          {money(total, g.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onAddAll}
        disabled={!hasItems}
        className={cx(
          "mt-3 w-full rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 transform-gpu",
          !hasItems
            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
            : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:brightness-110 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]",
        )}
      >
        Add all to cart
      </button>
    </div>
  );
}

/* ---------- main ---------- */
export default function SubscriptionRegionsMatrixUI() {
  const cart = useCart();
  const billing = useBillingRegion();

  const initialRegionsFromQuery = useMemo(() => {
    if (typeof window === "undefined") return [];
    const sp = new URLSearchParams(window.location.search || "");
    const raw = sp.get("regions") || sp.get("r") || "";
    return raw
      .split(",")
      .map((s) => String(s || "").trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const DISCOUNT_RATE = 0.1;

  // Data
  const [regions, setRegions] = useState([]);
  const [productsByRegion, setProductsByRegion] = useState({});
  const [plansByBucket, setPlansByBucket] = useState({});

  // When billing currency changes, refetch plan prices
  useEffect(() => {
    setPlansByBucket({});
  }, [billing.currency]);

  // Selections
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedProductsByRegion, setSelectedProductsByRegion] = useState({});
  const [selectedPlanByBucket, setSelectedPlanByBucket] = useState({});

  const [loadingRegions, setLoadingRegions] = useState(true);

  // features selected per (bucket + planKey)
  const [selectedFeaturesByBucketPlan, setSelectedFeaturesByBucketPlan] =
    useState({});

  // Modal state
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [featuresPlan, setFeaturesPlan] = useState(null);
  const [featuresCurrency, setFeaturesCurrency] = useState("USD");
  const [featuresKey, setFeaturesKey] = useState(null); // `${bucket}:${plan.key}`

  const visibleFilterRequested =
    Array.isArray(initialRegionsFromQuery) && initialRegionsFromQuery.length > 0;

  function openFeatures(meta, plan) {
    const key = `${meta.bucket}:${plan.key}`;

    setSelectedFeaturesByBucketPlan((prev) => {
      const current = prev[key];
      const requiredDefault = getRequiredFeatures(plan);
      if (current) return { ...prev, [key]: normalizeSelectedFeatures(plan, current) };
      return { ...prev, [key]: requiredDefault }; // default only required 5
    });

    setFeaturesKey(key);
    setFeaturesPlan(plan);
    setFeaturesCurrency(meta.currency || "USD");
    setFeaturesOpen(true);
  }

  function closeFeatures() {
    setFeaturesOpen(false);
    setFeaturesPlan(null);
    setFeaturesKey(null);
  }

  function toggleFeatureInModal(feature) {
    if (!featuresKey || !featuresPlan) return;

    const required = getRequiredFeatures(featuresPlan);
    if (required.includes(feature)) return; // locked

    setSelectedFeaturesByBucketPlan((prev) => {
      const current = Array.isArray(prev[featuresKey]) ? prev[featuresKey] : required;
      const has = current.includes(feature);
      const next = has ? current.filter((x) => x !== feature) : [...current, feature];
      return { ...prev, [featuresKey]: normalizeSelectedFeatures(featuresPlan, next) };
    });
  }

  /* 1) Load regions */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoadingRegions(true);
      try {
        const res = await api.regions({ signal: ac.signal });
        const r = Array.isArray(res?.data) ? res.data : [];

        if (r.length) {
          if (visibleFilterRequested) {
            const wanted = new Set(initialRegionsFromQuery.map((s) => String(s).toLowerCase()));
            const filtered = r.filter((x) =>
              wanted.has(String(x.key || x.key).toLowerCase()),
            );

            setRegions(filtered.length ? filtered : r);

            const valid = (filtered.length ? filtered : r)
              .map((x) => x.key)
              .filter(Boolean);
            setSelectedRegions(valid);
          } else {
            setRegions(r);
          }
        } else {
          setRegions(r);
        }
      } catch {
        setRegions([]);
      }
      setLoadingRegions(false);
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 2) Load products for selected regions */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const next = { ...productsByRegion };
      for (const rk of selectedRegions) {
        if (next[rk]) continue;
        try {
          const res = await api.productsByRegion(rk, { signal: ac.signal });
          next[rk] = Array.isArray(res?.data) ? res.data : [];
        } catch {
          next[rk] = [];
        }
      }
      setProductsByRegion(next);
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegions.join("|")]);

  /* 3) Load plans for selected products */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const next = { ...plansByBucket };
      for (const regionKey of selectedRegions) {
        const products = selectedProductsByRegion[regionKey] || [];
        for (const productKey of products) {
          const bucket = `${regionKey}:${productKey}`;
          if (next[bucket]) continue;
          try {
            const res = await api.plans(regionKey, productKey, billing.currency, { signal: ac.signal });
            {
              const raw = Array.isArray(res?.data) ? res.data : [];
              next[bucket] = raw.map((p) => ({ ...p, currency: billing.currency }));
            }
          } catch {
            next[bucket] = [];
          }
        }
      }
      setPlansByBucket(next);
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegions, selectedProductsByRegion, billing.currency]);

  function regionObj(k) {
    return regions.find((x) => x.key === k);
  }
  function regionLabel(k) {
    const r = regionObj(k);
    return r?.label || k;
  }
  function regionCurrency(k) {
    const r = regionObj(k);
    return r?.currency || "USD";
  }
  function productLabelFor(regionKey, productKey) {
    const list = productsByRegion[regionKey] || [];
    const found = list.find((p) => p.key === productKey);
    return found?.label || productKey;
  }

  function toggleRegion(regionKey) {
    setSelectedRegions((prev) => {
      const exists = prev.includes(regionKey);
      const next = exists ? prev.filter((x) => x !== regionKey) : [...prev, regionKey];

      if (exists) {
        setSelectedProductsByRegion((pp) => {
          const copy = { ...pp };
          delete copy[regionKey];
          return copy;
        });
        setSelectedPlanByBucket((pp) => {
          const copy = { ...pp };
          Object.keys(copy).forEach((k) => {
            if (k.startsWith(`${regionKey}:`)) delete copy[k];
          });
          return copy;
        });

        // clear features for all buckets of that region
        setSelectedFeaturesByBucketPlan((pf) => {
          const copy = { ...pf };
          Object.keys(copy).forEach((k) => {
            if (k.startsWith(`${regionKey}:`)) delete copy[k];
          });
          return copy;
        });
      }
      return next;
    });
  }

  function toggleProduct(regionKey, productKey) {
    setSelectedProductsByRegion((prev) => {
      const copy = { ...prev };
      const arr = copy[regionKey] ? [...copy[regionKey]] : [];
      const exists = arr.includes(productKey);

      copy[regionKey] = exists ? arr.filter((x) => x !== productKey) : [...arr, productKey];

      if (exists) {
        const bucket = `${regionKey}:${productKey}`;

        setSelectedPlanByBucket((pp) => {
          const c = { ...pp };
          delete c[bucket];
          return c;
        });

        // clear features for that bucket (all plans)
        setSelectedFeaturesByBucketPlan((pf) => {
          const c = { ...pf };
          const prefix = `${bucket}:`;
          Object.keys(c).forEach((k) => {
            if (k.startsWith(prefix)) delete c[k];
          });
          return c;
        });
      }
      return copy;
    });
  }

  const selectedBuckets = useMemo(() => {
    const out = [];
    for (const rk of selectedRegions) {
      const products = selectedProductsByRegion[rk] || [];
      for (const pk of products) {
        out.push({
          regionKey: rk,
          productKey: pk,
          bucket: `${rk}:${pk}`,
          regionLabel: regionLabel(rk),
          productLabel: productLabelFor(rk, pk),
          currency: billing.currency,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegions, selectedProductsByRegion, regions, productsByRegion]);

  const planColumns = useMemo(() => {
    const names = new Set();
    for (const b of selectedBuckets) {
      const plans = plansByBucket[b.bucket] || [];
      plans.forEach((p) => names.add(p.name));
    }
    const preferred = ["Starter", "Pro", "Business", "Elite"];
    const found = Array.from(names);

    found.sort((a, b) => {
      const ia = preferred.indexOf(a);
      const ib = preferred.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return String(a).localeCompare(String(b));
    });

    return found;
  }, [selectedBuckets, plansByBucket]);

  function selectPlan(meta, plan) {
    setSelectedPlanByBucket((prev) => ({ ...prev, [meta.bucket]: plan.key }));

    // init required 5 for this bucket+plan
    const k = `${meta.bucket}:${plan.key}`;
    setSelectedFeaturesByBucketPlan((prevF) => {
      const current = prevF[k];
      if (current) return { ...prevF, [k]: normalizeSelectedFeatures(plan, current) };
      return { ...prevF, [k]: getRequiredFeatures(plan) };
    });
  }

  function addToCart(meta, plan) {
    const k = `${meta.bucket}:${plan.key}`;

    const selectedRaw = Array.isArray(selectedFeaturesByBucketPlan[k])
      ? selectedFeaturesByBucketPlan[k]
      : getRequiredFeatures(plan);

    const selected = normalizeSelectedFeatures(plan, selectedRaw);
    const computed = computeFeaturePrice(plan, selected);

    cart.add({
      id: plan.id,
      name: `${meta.regionKey} • ${meta.productKey} • ${plan.name}`,
      region: meta.regionKey,
      product: meta.productKey,
      priceMonthly: computed,
      priceMonthlyUSD: plan.priceMonthlyUSD,
      currency: billing.currency,
      meta: { planKey: plan.key, selectedFeatures: selected },
    });
  }

  const summaryByCurrency = useMemo(() => {
    const map = new Map();

    for (const b of selectedBuckets) {
      const plans = plansByBucket[b.bucket] || [];
      if (!plans.length) continue;

      const selectedKey = selectedPlanByBucket[b.bucket];
      if (!selectedKey) continue;

      const plan = plans.find((p) => p.key === selectedKey);
      if (!plan) continue;

      const selKey = `${b.bucket}:${plan.key}`;
      const selected = selectedFeaturesByBucketPlan[selKey];
      const price = computeFeaturePrice(plan, selected);

      const currency = b.currency || "USD";
      const items = map.get(currency) || [];

      items.push({
        id: `${b.bucket}:${plan.key}`,
        currency,
        groupKey: String(b.productLabel || b.productKey).toLowerCase(),
        groupLabel: titleCase(b.productLabel || b.productKey),
        label: `${b.regionLabel} ${plan.name}`,
        price: Number(price || 0),
        meta: b,
        plan,
      });

      map.set(currency, items);
    }

    return Array.from(map.entries()).map(([currency, items]) => ({
      currency,
      items,
    }));
  }, [
    selectedBuckets,
    plansByBucket,
    selectedPlanByBucket,
    selectedFeaturesByBucketPlan,
  ]);

  function addAllToCart() {
    for (const b of selectedBuckets) {
      const plans = plansByBucket[b.bucket] || [];
      if (!plans.length) continue;

      const selectedKey = selectedPlanByBucket[b.bucket];
      if (!selectedKey) continue;

      const plan = plans.find((p) => p.key === selectedKey);
      if (!plan) continue;

      addToCart(b, plan);
    }
  }

  function removeSummaryItem(item) {
    const bucket = item?.meta?.bucket;
    if (!bucket) return;

    setSelectedPlanByBucket((prev) => {
      const copy = { ...prev };
      delete copy[bucket];
      return copy;
    });
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="mx-auto max-w-7xl h-full flex flex-col">
        <SubscriptionChoose />

        <div className="mt-5 grid gap-5 lg:grid-cols-12 flex-1 min-h-0">
          {/* LEFT */}
          <aside className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  Country
                </div>
                <div className="text-[11px] text-slate-500">
                  {loadingRegions ? "Loading…" : `${selectedRegions.length} selected`}
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {loadingRegions ? (
                  <div className="text-xs text-slate-500">
                    Loading countries…
                  </div>
                ) : (
                  regions.map((r) => (
                    <CardCheckbox
                      key={r.key}
                      checked={selectedRegions.includes(r.key)}
                      onChange={() => toggleRegion(r.key)}
                      label={r.label || r.key}
                    />
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* MIDDLE */}
          <main className="lg:col-span-8 min-h-0">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm h-full overflow-y-auto">
              {/* Products */}
              <div className="grid gap-4 md:grid-cols-2">
                {selectedRegions.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 md:col-span-2">
                    Select a Country
                  </div>
                ) : (
                  selectedRegions.map((rk) => {
                    const prods = productsByRegion[rk] || [];
                    const chosen = selectedProductsByRegion[rk] || [];
                    return (
                      <div
                        key={rk}
                        className="rounded-xl border border-slate-200 p-3 bg-gradient-to-br from-white to-slate-50"
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {regionLabel(rk)}
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          {prods.length === 0 ? (
                            <div className="col-span-2 text-xs text-slate-500">
                              Loading products…
                            </div>
                          ) : (
                            prods.map((p) => (
                              <SmallToggle
                                key={p.key}
                                checked={chosen.includes(p.key)}
                                onChange={() => toggleProduct(rk, p.key)}
                                label={p.label || p.key}
                              />
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Plans matrix */}
              <div className="mt-5 rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">
                    Plans
                  </div>
                </div>

                {selectedBuckets.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    Select products to show plan matrix.
                  </div>
                ) : planColumns.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    Loading plans…
                  </div>
                ) : (
                  <div className="mt-3 overflow-auto">
                    <div className="p-2">
                      <div
                        className="grid gap-3"
                        style={{
                          gridTemplateColumns: `repeat(${planColumns.length}, minmax(140px, 1fr))`,
                        }}
                      >
                        {planColumns.map((col) => (
                          <div
                            key={col}
                            className="text-[11px] font-semibold text-slate-700 text-center"
                          >
                            {col}
                          </div>
                        ))}

                        {selectedBuckets.map((b) => {
                          const plans = plansByBucket[b.bucket] || [];
                          const byName = {};
                          plans.forEach((p) => {
                            byName[p.name] = p;
                          });

                          return planColumns.map((colName) => {
                            const plan = byName[colName] || null;
                            const chosenKey = selectedPlanByBucket[b.bucket];
                            const active = plan ? chosenKey === plan.key : false;

                            const displayPrice =
                              plan
                                ? computeFeaturePrice(
                                    plan,
                                    selectedFeaturesByBucketPlan[`${b.bucket}:${plan.key}`],
                                  )
                                : undefined;

                            return (
                              <PlanCell
                                key={`${b.bucket}:${colName}`}
                                active={active}
                                meta={b}
                                plan={plan}
                                displayPrice={displayPrice}
                                onSelect={() => plan && selectPlan(b, plan)}
                                onAddMore={() => plan && openFeatures(b, plan)}
                              />
                            );
                          });
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* RIGHT */}
          <aside className="lg:col-span-2">
            <div className="sticky top-5 space-y-4">
              <SummaryAllBlock
                title="Summary"
                groups={summaryByCurrency}
                discountRate={DISCOUNT_RATE}
                onAddAll={addAllToCart}
                onRemoveItem={removeSummaryItem}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Features Popup */}
      <FeaturesModal
        open={featuresOpen}
        onClose={closeFeatures}
        plan={featuresPlan}
        currency={featuresCurrency}
        selectedFeatures={featuresKey ? selectedFeaturesByBucketPlan[featuresKey] : undefined}
        onToggleFeature={toggleFeatureInModal}
        computedPrice={
          featuresPlan
            ? computeFeaturePrice(
                featuresPlan,
                featuresKey ? selectedFeaturesByBucketPlan[featuresKey] : undefined,
              )
            : undefined
        }
      />
    </div>
  );
}
