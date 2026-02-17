import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../../api/platformApi.js";
import { useCart } from "../../../data/cart.jsx";
import { useBillingRegion } from "../../../data/billingRegion.jsx";
import SubscriptionChoose from "./SubscriptionChoose.jsx";

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
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

/** max 3 words then ... */
function truncateWords(input, maxWords = 3) {
  const s = String(input || "").trim();
  if (!s) return "";
  const words = s.split(/\s+/);
  if (words.length <= maxWords) return s;
  return words.slice(0, maxWords).join(" ") + "...";
}

function computeFeaturePrice(plan, selectedFeatures) {
  const full = Number(plan?.priceMonthly || 0);
  const all = Array.isArray(plan?.features) ? plan.features : [];
  const total = all.length;
  if (!total) return full;

  const normalized = normalizeSelectedFeatures(plan, selectedFeatures);
  const count = Math.max(0, Math.min(total, normalized.length));

  return Math.round((full * count) / total);
}

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

  // fallback
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

  for (const f of required) if (all.includes(f)) set.add(f);

  const selected = Array.isArray(selectedFeatures) ? selectedFeatures : [];
  for (const f of selected) if (all.includes(f)) set.add(f);

  return Array.from(set);
}

/* ---------- tiny nav row (left sidebar) ---------- */
function NavRow({ checked, onToggle, label, indent = 0, disabled }) {
  const shown = truncateWords(label, 3);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onToggle?.();
      }}
      className={cx(
        "w-full text-left rounded-md px-2 py-1.5 transition",
        indent ? "pl-6" : "pl-2",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-50",
      )}
      title={String(label || "")}
    >
      <div className="flex items-center gap-2">
        <span
          className={cx(
            "h-4 w-4 rounded border flex items-center justify-center shrink-0",
            checked
              ? "bg-indigo-600 border-indigo-600"
              : "bg-white border-slate-300",
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
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.3a1 1 0 0 1-1.43.004L3.29 9.22a1 1 0 1 1 1.42-1.4l3.07 3.114 6.49-6.58a1 1 0 0 1 1.414-.006Z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </span>

        <span
          className={cx(
            indent
              ? "text-xs text-slate-700"
              : "text-sm font-semibold text-slate-900",
          )}
        >
          {shown}
        </span>
      </div>
    </button>
  );
}

/* ---------- Popup ---------- */
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
        <div className=" bg-white px-6 py-4 flex items-center justify-between">
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

        <div className="bg-white px-8 py-8 text-black">
          <div className="text-sm font-semibold mb-3">Features</div>
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

        <div className="bg-slate-800 px-8 pb-8">
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

/* ---------- Plan details inline ---------- */
function PlanDetailsInline({ plan, onShowMore }) {
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
              <div className="text-[10px] leading-4 text-slate-600">
                {truncateWords(f, 3)}
              </div>
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
          onShowMore?.();
        }}
        className="mt-2 text-[10px] font-semibold text-indigo-700 hover:text-indigo-600 text-left"
      >
        Addmore
      </button>
    </div>
  );
}

/* ---------- Plan card ---------- */
function PlanCell({ active, meta, plan, onSelect, onShowMore, displayPrice }) {
  if (!plan) {
    return (
      <div className="h-[220px] rounded-xl border border-slate-200 bg-white/70 backdrop-blur" />
    );
  }

  const regionShown = truncateWords(meta.regionLabel, 3);
  const productShown = truncateWords(meta.productLabel, 3);
  const planShown = truncateWords(plan.name, 3);

  return (
    <div
      className={cx(
        "relative rounded-xl border p-3 text-left flex flex-col",
        "bg-gradient-to-br from-white to-slate-50",
        "transition-all duration-200 ease-out transform-gpu will-change-transform",
        active
          ? "border-indigo-600 shadow-md ring-2 ring-indigo-100"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.04] hover:-translate-y-0.5 hover:z-20",
      )}
      title={`${meta.regionLabel} • ${meta.productLabel} • ${plan.name}`}
    >
      {active ? (
        <div className="absolute right-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          Selected
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-slate-500 truncate">
            {regionShown}
          </div>
          <div className="text-[11px] font-semibold text-slate-900 truncate">
            {productShown}
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-900">
          {money(displayPrice ?? plan.priceMonthly, meta.currency)}
        </div>
      </div>

      <div className="mt-2 text-[11px] font-semibold text-slate-900 truncate">
        {planShown}
      </div>

      <div className="flex-1 min-h-0">
        <PlanDetailsInline plan={plan} onShowMore={onShowMore} />
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSelect();
        }}
        className={cx(
          "mt-3 w-full rounded-lg px-2 py-2 text-[11px] font-semibold text-white",
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

/* ---------- Summary block ---------- */
function SummaryAllBlock({
  title,
  groups,
  discountRate,
  onAddAll,
  onRemoveItem,
}) {
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

                  <div className="px-3 py-2 space-y-2">
                    {items.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0" title={r.label}>
                          <div className="text-[11px] text-slate-800 truncate">
                            {truncateWords(r.label, 3)}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onRemoveItem?.(r);
                            }}
                            className="mt-1 text-[10px] font-semibold text-rose-700 hover:text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-900">
                          {money(r.price, g.currency)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 py-2 bg-white border-t border-slate-200">
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

/* ---------- main page ---------- */
export default function SubscriptionRegionsMatrixUI() {
  const cart = useCart();
  const billing = useBillingRegion();
  const DISCOUNT_RATE = 0.1;

  const [regions, setRegions] = useState([]);
  const [productsByRegion, setProductsByRegion] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [plansByBucket, setPlansByBucket] = useState({});

  // When billing currency changes, refetch plan prices
  useEffect(() => {
    setPlansByBucket({});
    setSelectedPlanByBucket({});
  }, [billing.currency]);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedRegionsByProduct, setSelectedRegionsByProduct] = useState({});
  const [selectedPlanByBucket, setSelectedPlanByBucket] = useState({});

  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // popup
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [featuresPlan, setFeaturesPlan] = useState(null);
  const [featuresCurrency, setFeaturesCurrency] = useState("USD");
  const [featuresKey, setFeaturesKey] = useState(null); // "{bucket}:{planKey}"

  // selected features per (bucket + planKey)
  const [selectedFeaturesByBucketPlan, setSelectedFeaturesByBucketPlan] =
    useState({});

  function openFeatures(meta, plan) {
    const key = `${meta.bucket}:${plan.key}`;

    setSelectedFeaturesByBucketPlan((prev) => {
      const current = prev[key];
      const requiredDefault = getRequiredFeatures(plan);

      if (current) {
        return { ...prev, [key]: normalizeSelectedFeatures(plan, current) };
      }

      return { ...prev, [key]: requiredDefault };
    });

    setFeaturesKey(key);
    setFeaturesPlan(plan);
    setFeaturesCurrency(meta?.currency || "USD");
    setFeaturesOpen(true);
  }

  function closeFeatures() {
    setFeaturesOpen(false);
    setFeaturesPlan(null);
    setFeaturesKey(null);
  }

  function toggleFeatureInModal(feature) {
    if (!featuresKey || !featuresPlan) return;

    const all = Array.isArray(featuresPlan?.features) ? featuresPlan.features : [];
    if (!all.length) return;

    const required = getRequiredFeatures(featuresPlan);
    if (required.includes(feature)) return;

    setSelectedFeaturesByBucketPlan((prev) => {
      const current = Array.isArray(prev[featuresKey]) ? prev[featuresKey] : required;

      const has = current.includes(feature);
      const next = has ? current.filter((x) => x !== feature) : [...current, feature];

      const normalized = normalizeSelectedFeatures(featuresPlan, next);
      return { ...prev, [featuresKey]: normalized };
    });
  }

  /* load regions */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoadingRegions(true);
      try {
        const res = await api.regions({ signal: ac.signal });
        setRegions(Array.isArray(res?.data) ? res.data : []);
      } catch {
        setRegions([]);
      }
      setLoadingRegions(false);
    })();
    return () => ac.abort();
  }, []);

  /* prefetch products for all regions */
  useEffect(() => {
    if (!regions.length) return;

    const ac = new AbortController();
    (async () => {
      setLoadingProducts(true);

      const nextProductsByRegion = {};
      const unique = new Map();

      for (const r of regions) {
        const rk = r.key;
        try {
          const res = await api.productsByRegion(rk, { signal: ac.signal });
          const list = Array.isArray(res?.data) ? res.data : [];
          nextProductsByRegion[rk] = list;
          for (const p of list) if (p?.key && !unique.has(p.key)) unique.set(p.key, p);
        } catch {
          nextProductsByRegion[rk] = [];
        }
      }

      setProductsByRegion(nextProductsByRegion);
      setAllProducts(
        Array.from(unique.values()).sort((a, b) =>
          String(a.label || a.key).localeCompare(String(b.label || b.key)),
        ),
      );

      setLoadingProducts(false);
    })();

    return () => ac.abort();
  }, [regions]);

  function regionObj(k) {
    return regions.find((x) => x.key === k);
  }
  function regionLabel(k) {
    return regionObj(k)?.label || k;
  }
  function regionCurrency(k) {
    return regionObj(k)?.currency || "USD";
  }
  function productLabelForGlobal(productKey) {
    const found = allProducts.find((p) => p.key === productKey);
    return found?.label || titleCase(productKey);
  }

  // product -> supported regions
  const regionsByProduct = useMemo(() => {
    const map = {};
    for (const p of allProducts) map[p.key] = [];

    for (const rk of Object.keys(productsByRegion)) {
      const list = productsByRegion[rk] || [];
      for (const p of list) {
        if (!p?.key) continue;
        if (!map[p.key]) map[p.key] = [];
        map[p.key].push(rk);
      }
    }

    for (const pk of Object.keys(map)) {
      map[pk] = Array.from(new Set(map[pk])).sort((a, b) =>
        regionLabel(a).localeCompare(regionLabel(b)),
      );
    }

    return map;
  }, [allProducts, productsByRegion, regions]);

  function toggleProduct(productKey) {
    setSelectedProducts((prev) => {
      const has = prev.includes(productKey);
      const next = has ? prev.filter((x) => x !== productKey) : [...prev, productKey];

      if (has) {
        setSelectedRegionsByProduct((m) => {
          const copy = { ...m };
          delete copy[productKey];
          return copy;
        });

        setSelectedPlanByBucket((pp) => {
          const copy = { ...pp };
          Object.keys(copy).forEach((k) => {
            if (k.endsWith(`:${productKey}`)) delete copy[k];
          });
          return copy;
        });

        setSelectedFeaturesByBucketPlan((prevF) => {
          const copy = { ...prevF };
          Object.keys(copy).forEach((k) => {
            const parts = String(k).split(":");
            if (parts[1] === productKey) delete copy[k];
          });
          return copy;
        });
      }

      return next;
    });
  }

  function toggleRegionForProduct(productKey, regionKey) {
    setSelectedRegionsByProduct((prev) => {
      const current = Array.isArray(prev[productKey]) ? prev[productKey] : [];
      const has = current.includes(regionKey);
      const nextForProduct = has
        ? current.filter((x) => x !== regionKey)
        : [...current, regionKey];

      if (has) {
        const bucket = `${regionKey}:${productKey}`;

        setSelectedPlanByBucket((pp) => {
          const copy = { ...pp };
          delete copy[bucket];
          return copy;
        });

        setSelectedFeaturesByBucketPlan((prevF) => {
          const copy = { ...prevF };
          const prefix = `${bucket}:`;
          Object.keys(copy).forEach((k) => {
            if (k.startsWith(prefix)) delete copy[k];
          });
          return copy;
        });
      }

      return { ...prev, [productKey]: nextForProduct };
    });
  }

  // prune invalid selections if API changes
  useEffect(() => {
    if (loadingProducts) return;

    setSelectedRegionsByProduct((prev) => {
      const next = { ...prev };
      for (const pk of Object.keys(next)) {
        const supported = new Set(regionsByProduct[pk] || []);
        next[pk] = (next[pk] || []).filter((rk) => supported.has(rk));
        if (!next[pk].length) delete next[pk];
      }
      return next;
    });
  }, [regionsByProduct, loadingProducts]);

  const selectedBuckets = useMemo(() => {
    const out = [];
    for (const pk of selectedProducts) {
      const rks = selectedRegionsByProduct[pk] || [];
      for (const rk of rks) {
        out.push({
          regionKey: rk,
          productKey: pk,
          bucket: `${rk}:${pk}`,
          regionLabel: regionLabel(rk),
          productLabel: productLabelForGlobal(pk),
          currency: billing.currency,
        });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProducts, selectedRegionsByProduct, regions, allProducts]);

  /* load plans for selected buckets */
  useEffect(() => {
    if (!selectedBuckets.length) return;
    const ac = new AbortController();

    (async () => {
      const next = { ...plansByBucket };

      for (const b of selectedBuckets) {
        if (next[b.bucket]) continue;
        try {
          const res = await api.plans(b.regionKey, b.productKey, billing.currency, { signal: ac.signal });
          {
            const raw = Array.isArray(res?.data) ? res.data : [];
            next[b.bucket] = raw.map((p) => ({ ...p, currency: billing.currency }));
          }
        } catch {
          next[b.bucket] = [];
        }
      }

      setPlansByBucket(next);
    })();

    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuckets.map((b) => b.bucket).join("|"), billing.currency]);

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

      const currency = b.currency || "USD";
      const items = map.get(currency) || [];

      items.push({
        id: `${b.bucket}:${plan.key}`,
        currency,
        label: `${b.regionLabel} • ${b.productLabel} • ${plan.name}`,
        price: computeFeaturePrice(
          plan,
          selectedFeaturesByBucketPlan[`${b.bucket}:${plan.key}`],
        ),
        meta: b,
        plan,
      });

      map.set(currency, items);
    }

    return Array.from(map.entries()).map(([currency, items]) => ({
      currency,
      items,
    }));
  }, [selectedBuckets, plansByBucket, selectedPlanByBucket, selectedFeaturesByBucketPlan]);

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

  const step1Enabled = true;
  const step2Enabled = selectedProducts.length > 0;
  const step3Enabled = selectedBuckets.length > 0;

  return (
    <div className="overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white">
      <div className="mx-auto max-w-7xl">
        <SubscriptionChoose />

        <div className="mt-5 grid gap-5 lg:grid-cols-12 h-[calc(100vh-120px)]">
          {/* LEFT */}
          <aside className="lg:col-span-2 space-y-4 h-full overflow-hidden">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Markets</div>
                <div className="text-[11px] text-slate-500">
                  {loadingProducts ? "Loading…" : `${selectedBuckets.length} selected`}
                </div>
              </div>

              <div className="mt-3">
                {loadingProducts ? (
                  <div className="text-xs text-slate-500 px-2 py-2">
                    Loading products…
                  </div>
                ) : allProducts.length === 0 ? (
                  <div className="text-xs text-slate-500 px-2 py-2">No products.</div>
                ) : (
                  <div className="space-y-1">
                    {allProducts.map((p) => {
                      const pk = p.key;
                      const productChecked = selectedProducts.includes(pk);
                      const supportedRegions = regionsByProduct[pk] || [];
                      const selectedRegions = selectedRegionsByProduct[pk] || [];

                      return (
                        <div key={pk} className="rounded-lg">
                          <NavRow
                            checked={productChecked}
                            disabled={!step1Enabled}
                            label={p.label || pk}
                            onToggle={() => toggleProduct(pk)}
                            indent={0}
                          />

                          {productChecked ? (
                            <div className="mt-1 space-y-0.5">
                              {supportedRegions.length === 0 ? (
                                <div className="text-[11px] text-slate-500 pl-6 py-1">
                                  No countries
                                </div>
                              ) : (
                                supportedRegions.map((rk) => (
                                  <NavRow
                                    key={`${pk}:${rk}`}
                                    checked={selectedRegions.includes(rk)}
                                    disabled={!step2Enabled}
                                    label={regionLabel(rk)}
                                    indent={1}
                                    onToggle={() => toggleRegionForProduct(pk, rk)}
                                  />
                                ))
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* MIDDLE */}
          <main className="lg:col-span-8 h-full overflow-y-auto pr-2">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm">
              <div className="rounded-xl border border-slate-200 p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-900">Plans</div>
                </div>

                {!step2Enabled ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    Select product first.
                  </div>
                ) : !step3Enabled ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    Select country under a product.
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
                            title={col}
                          >
                            {truncateWords(col, 3)}
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

                            return (
                              <PlanCell
                                key={`${b.bucket}:${colName}`}
                                active={active}
                                meta={b}
                                plan={plan}
                                displayPrice={
                                  plan
                                    ? computeFeaturePrice(
                                        plan,
                                        selectedFeaturesByBucketPlan[`${b.bucket}:${plan.key}`],
                                      )
                                    : undefined
                                }
                                onSelect={() => plan && selectPlan(b, plan)}
                                onShowMore={() => plan && openFeatures(b, plan)}
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
