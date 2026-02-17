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

/** show only N words then "…" */
function truncateWords(text, maxWords = 3) {
  const s = String(text || "").trim();
  if (!s) return "";
  const parts = s.split(/\s+/);
  if (parts.length <= maxWords) return s;
  return `${parts.slice(0, maxWords).join(" ")}…`;
}

/** Region label like screenshot (IN/AU/US/EU) */
function regionCode(region) {
  const r = String(region || "").trim().toLowerCase();
  const map = {
    india: "IN",
    australia: "AU",
    usa: "US",
    united_states: "US",
    "united states": "US",
    united_kingdom: "UK",
    "united kingdom": "UK",
    europe: "EU",
  };
  return (map[r] || r || "—").toUpperCase();
}

/** Product label like screenshot (EQUITY, FX, CRYPTO, etc.) */
function productCode(product) {
  const p = String(product || "").trim();
  return (p || "—").toUpperCase();
}

/* ---------- REQUIRED + pricing ---------- */
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

  // fallback: if API names differ, lock first 5 as required
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

function computeFeaturePrice(plan, selectedFeatures) {
  const full = Number(plan?.priceMonthly || 0);
  const all = Array.isArray(plan?.features) ? plan.features : [];
  const total = all.length;
  if (!total) return full;

  const normalized = normalizeSelectedFeatures(plan, selectedFeatures);
  const count = Math.max(0, Math.min(total, normalized.length));
  return Math.round((full * count) / total);
}

/* ---------- LEFT TREE ROW (group + child) ---------- */
function TreeRow({
  checked,
  onChange,
  label,
  indent = 0,
  disabled,
  isGroup = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onChange?.(!checked);
      }}
      className={cx(
        "w-full rounded-md px-2 py-1.5 text-left transition",
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
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.3a1 1 0 0 1-1.43.004L3.29 9.22a1 1 0 1 1 1.42-1.4l3.07 3.114 6.49-6.58a1 0 0 1 1.414-.006Z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </span>

        <span
          className={cx(
            isGroup
              ? "text-sm font-semibold text-slate-900"
              : "text-xs text-slate-700",
          )}
        >
          {truncateWords(label, 3)}
        </span>
      </div>
    </button>
  );
}

/* ---------- small toggle (product pick per country) ---------- */
function SmallToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx(
        "flex items-center justify-between gap-3 rounded-lg border p-2 text-left transition",
        checked
          ? "border-indigo-600 bg-indigo-50"
          : "border-slate-200 bg-white hover:bg-slate-50",
      )}
      title={String(label || "")}
    >
      <div className="text-[11px] font-semibold text-slate-900 truncate">
        {truncateWords(label, 3)}
      </div>
      <div
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
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.3a1 0 0 1-1.43.004L3.29 9.22a1 1 0 1 1 1.42-1.4l3.07 3.114 6.49-6.58a1 0 0 1 1.414-.006Z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
      </div>
    </button>
  );
}

/** TOP TITLES */
function PlansHeaderRow() {
  const labels = ["Starter", "Pro", "Business", "Elite"];
  return (
    <div className="hidden lg:block">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur pb-2">
        <div className="grid grid-cols-4 gap-3">
          {labels.map((l) => (
            <div
              key={l}
              className="flex items-center justify-center text-xs font-semibold text-slate-700"
            >
              {l}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- FEATURES MODAL with locked 5 + additional checkboxes ---------- */
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

  const all = Array.isArray(plan.features) ? plan.features : [];
  const required = getRequiredFeatures(plan);
  const requiredSet = new Set(required);

  const normalizedSelected = normalizeSelectedFeatures(plan, selectedFeatures);
  const selectedSet = new Set(normalizedSelected);

  const additional = all.filter((f) => !requiredSet.has(f));

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
          <div className="text-black min-w-0">
            <div className="text-xl font-semibold">Features</div>
            <div className="text-sm opacity-90">
              {plan.name} • {money(computedPrice ?? plan.priceMonthly, currency)}
            </div>
            <div className="mt-1 text-[12px] text-slate-600">
              {regionCode(plan.region)} • {productCode(plan.product)}
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
          <div className="text-sm font-semibold mb-3">Features (included)</div>
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
                      title={String(f || "")}
                    >
                      <div className="text-sm truncate">
                        {truncateWords(f, 3)}
                      </div>

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

/* ---------- plan card ---------- */
function CompactPlanCard({
  active,
  plan,
  currency,
  onSelect,
  onShowMore,
  displayPrice,
}) {
  if (!plan) return null;

  const allFeatures = Array.isArray(plan.features) ? plan.features : [];
  const previewFeatures = getRequiredFeatures(plan).slice(0, 5);
  const hasMore = allFeatures.length > 5;

  return (
    <div
      className={cx(
        "relative rounded-2xl border p-3 text-left flex flex-col h-full",
        "bg-gradient-to-br from-white to-slate-50",
        "transition-all duration-200 ease-out transform-gpu will-change-transform",
        active
          ? "border-indigo-600 shadow-md ring-2 ring-indigo-100"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:scale-[1.04] hover:-translate-y-0.5 hover:z-20",
      )}
    >
      {active ? (
        <div className="absolute top-2 right-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          Selected
        </div>
      ) : null}

      <div className="p-1 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 uppercase leading-3">
              {regionCode(plan.region)}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-slate-500 uppercase truncate leading-3">
              {productCode(plan.product)}
            </div>

            <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
              {truncateWords(plan.name, 3)}
            </div>
          </div>

          <div className="text-sm font-semibold text-slate-900 shrink-0">
            {money(displayPrice ?? plan.priceMonthly, currency)}
          </div>
        </div>
      </div>

      <div className="px-1 pb-3 flex-1 min-h-0">
        <div className="text-[11px] font-semibold text-slate-600 mb-2">
          Plan Details
        </div>

        <div className="space-y-1 text-[11px] text-slate-600">
          {previewFeatures.length ? (
            previewFeatures.map((f, i) => (
              <div key={i} className="flex gap-2 leading-4" title={String(f)}>
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{truncateWords(f, 3)}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500">No details</div>
          )}
        </div>

        {hasMore ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onShowMore?.(plan);
            }}
            className="mt-2 text-[11px] font-semibold text-indigo-700 hover:text-indigo-600"
          >
            Addmore
          </button>
        ) : null}
      </div>

      <div className="px-1 pt-0">
        <button
          type="button"
          onClick={onSelect}
          className={cx(
            "w-full rounded-lg py-2 text-sm font-semibold text-white transition",
            active
              ? "bg-indigo-600"
              : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-110",
          )}
        >
          {active ? "Selected" : "Select plan"}
        </button>
      </div>
    </div>
  );
}

/* ---------- summary ---------- */
function SummaryBlock({ groups, discountRate, onAddAll, onRemoveItem }) {
  const hasItems = groups?.some((g) => (g.items || []).length) || false;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">Summary</div>
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

              const subtotal = items.reduce(
                (s, it) => s + Number(it.price || 0),
                0,
              );
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
                    {items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div
                            className="text-[11px] text-slate-800 truncate"
                            title={String(it.label || "")}
                          >
                            {truncateWords(it.label, 6)}
                          </div>
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => onRemoveItem?.(it)}
                              className="text-[10px] font-semibold text-rose-700 hover:text-rose-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-900">
                          {money(it.price, g.currency)}
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

/* ---------- main ---------- */
export default function SubscriptionGeoCoverage() {
  const cart = useCart();
  const billing = useBillingRegion();
  const DISCOUNT_RATE = 0.1;

  const [geoRegions, setGeoRegions] = useState([]);
  const [loadingGeo, setLoadingGeo] = useState(true);

  const [selectedGeo, setSelectedGeo] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const [productsByCountry, setProductsByCountry] = useState({});
  const [plansByBucket, setPlansByBucket] = useState({});

  useEffect(() => {
    setPlansByBucket({});
  }, [billing.currency]);

  const [selectedProductsByCountry, setSelectedProductsByCountry] = useState({});
  const [selectedPlanByBucket, setSelectedPlanByBucket] = useState({});

  const [selectedFeaturesByBucketPlan, setSelectedFeaturesByBucketPlan] =
    useState({});
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [featuresPlan, setFeaturesPlan] = useState(null);
  const [featuresCurrency, setFeaturesCurrency] = useState("USD");
  const [featuresKey, setFeaturesKey] = useState(null);

  function openFeatures(bucket, plan, currency) {
    const key = `${bucket}:${plan.key}`;

    setSelectedFeaturesByBucketPlan((prev) => {
      const current = prev[key];
      if (current)
        return { ...prev, [key]: normalizeSelectedFeatures(plan, current) };
      return { ...prev, [key]: getRequiredFeatures(plan) };
    });

    setFeaturesKey(key);
    setFeaturesPlan(plan);
    setFeaturesCurrency(currency || "USD");
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
    if (required.includes(feature)) return;

    setSelectedFeaturesByBucketPlan((prev) => {
      const current = Array.isArray(prev[featuresKey])
        ? prev[featuresKey]
        : required;

      const has = current.includes(feature);
      const next = has ? current.filter((x) => x !== feature) : [...current, feature];

      return { ...prev, [featuresKey]: normalizeSelectedFeatures(featuresPlan, next) };
    });
  }

  /* 1) load geo regions */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoadingGeo(true);
      try {
        let list = [];
        try {
          const res = await api.geoRegions({ signal: ac.signal });
          list = Array.isArray(res?.data) ? res.data : [];
        } catch (e) {
          const rr = await api.regions({ signal: ac.signal });
          const regions = Array.isArray(rr?.data) ? rr.data : [];
          const geoLabel = {
            asia: "Asia",
            north_america: "North America",
            europe: "Europe",
            oceania: "Oceania",
            south_america: "South America",
            africa: "Africa",
          };

          const grouped = new Map();
          for (const r of regions) {
            const gk = String(r?.geo || "").toLowerCase();
            if (!gk) continue;
            if (!grouped.has(gk)) {
              grouped.set(gk, {
                key: gk,
                label: geoLabel[gk] || gk.replace(/_/g, " "),
                markets: [],
              });
            }
            grouped.get(gk).markets.push({
              key: r.key,
              label: r.label || String(r.key || "").toUpperCase(),
              name: r.name,
              currency: r.currency,
              geo: gk,
            });
          }
          list = Array.from(grouped.values());
        }

        setGeoRegions(list);
      } catch {
        setGeoRegions([]);
      }
      setLoadingGeo(false);
    })();
    return () => ac.abort();
  }, []);

  const marketsByGeo = useMemo(() => {
    const map = {};
    for (const g of geoRegions) {
      map[g.key] = Array.isArray(g.markets) ? g.markets : [];
    }
    return map;
  }, [geoRegions]);

  const countryByKey = useMemo(() => {
    const map = new Map();
    for (const g of geoRegions) {
      for (const m of g.markets || []) {
        if (m?.key) map.set(m.key, m);
      }
    }
    return map;
  }, [geoRegions]);

  function clearCountrySelection(countryKey) {
    setSelectedProductsByCountry((prev) => {
      const copy = { ...prev };
      delete copy[countryKey];
      return copy;
    });

    setSelectedPlanByBucket((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(`${countryKey}:`)) delete copy[k];
      });
      return copy;
    });

    setSelectedFeaturesByBucketPlan((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(`${countryKey}:`)) delete copy[k];
      });
      return copy;
    });
  }

  function toggleGeo(geoKey, nextChecked) {
    setSelectedGeo((prev) => {
      const has = prev.includes(geoKey);
      const next = nextChecked ? (has ? prev : [...prev, geoKey]) : prev.filter((x) => x !== geoKey);

      if (!nextChecked) {
        const removed = (marketsByGeo[geoKey] || []).map((m) => m?.key).filter(Boolean);

        const keep = new Set();
        for (const gk of next) {
          for (const m of marketsByGeo[gk] || []) {
            if (m?.key) keep.add(m.key);
          }
        }

        setSelectedCountries((prevCountries) => {
          const toRemove = prevCountries.filter((k) => removed.includes(k) && !keep.has(k));
          toRemove.forEach((k) => clearCountrySelection(k));
          return prevCountries.filter((k) => !toRemove.includes(k));
        });
      }

      if (!nextChecked && next.length === 0) {
        setSelectedCountries((prevCountries) => {
          prevCountries.forEach((k) => clearCountrySelection(k));
          return [];
        });
      }

      return next;
    });
  }

  function toggleCountry(countryKey, nextChecked) {
    setSelectedCountries((prev) => {
      const has = prev.includes(countryKey);
      if (nextChecked && !has) return [...prev, countryKey];
      if (!nextChecked && has) {
        clearCountrySelection(countryKey);
        return prev.filter((x) => x !== countryKey);
      }
      return prev;
    });
  }

  /* 2) load products for selected countries */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const next = {};
      for (const ck of selectedCountries) {
        try {
          const res = await api.productsByRegion(ck, { signal: ac.signal });
          next[ck] = Array.isArray(res?.data) ? res.data : [];
        } catch {
          next[ck] = [];
        }
      }
      setProductsByCountry(next);
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries.join("|")]);

  function toggleProduct(countryKey, productKey) {
    setSelectedProductsByCountry((prev) => {
      const current = prev[countryKey] || [];
      const has = current.includes(productKey);
      const nextList = has ? current.filter((x) => x !== productKey) : [...current, productKey];

      if (has) {
        const bucket = `${countryKey}:${productKey}`;

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

      return { ...prev, [countryKey]: nextList };
    });
  }

  function ensureProductSelected(countryKey, productKey) {
    setSelectedProductsByCountry((prev) => {
      const current = prev[countryKey] || [];
      if (current.includes(productKey)) return prev;
      return { ...prev, [countryKey]: [...current, productKey] };
    });
  }

  /* 3) load plans for selected (country + product) buckets */
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const next = {};
      for (const ck of selectedCountries) {
        const chosen = selectedProductsByCountry[ck] || [];
        for (const pk of chosen) {
          const bucket = `${ck}:${pk}`;
          try {
            const res = await api.plans(ck, pk, billing.currency, { signal: ac.signal });
            const raw = Array.isArray(res?.data) ? res.data : [];
            // Ensure fields exist (product/region) even if backend forgets
            next[bucket] = raw.map((p) => ({
              ...p,
              product: p.product ?? pk,
              region: p.region ?? ck,
              currency: billing.currency,
            }));
          } catch {
            next[bucket] = [];
          }
        }
      }
      setPlansByBucket(next);
    })();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountries.join("|"), JSON.stringify(selectedProductsByCountry), billing.currency]);

  function countryLabel(countryKey) {
    return countryByKey.get(countryKey)?.label || countryKey;
  }
  function countryCurrency(countryKey) {
    return countryByKey.get(countryKey)?.currency || "USD";
  }
  function productLabel(countryKey, productKey) {
    const list = productsByCountry[countryKey] || [];
    const found = list.find((p) => p.key === productKey);
    return found?.label || titleCase(productKey);
  }

  function orderedPlans(plans) {
    const preferred = ["Starter", "Pro", "Business", "Elite"];
    const copy = (plans || []).slice();
    copy.sort((a, b) => {
      const ia = preferred.indexOf(a.name);
      const ib = preferred.indexOf(b.name);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return String(a.name).localeCompare(String(b.name));
    });
    return copy;
  }

  const hasAnyChosenProduct = useMemo(() => {
    for (const ck of selectedCountries) {
      if ((selectedProductsByCountry[ck] || []).length > 0) return true;
    }
    return false;
  }, [selectedCountries, selectedProductsByCountry]);

  const selectedItemsByCurrency = useMemo(() => {
    const map = new Map();
    for (const ck of selectedCountries) {
      const currency = countryCurrency(ck);
      const products = selectedProductsByCountry[ck] || [];
      for (const pk of products) {
        const bucket = `${ck}:${pk}`;
        const selectedKey = selectedPlanByBucket[bucket];
        if (!selectedKey) continue;

        const plans = plansByBucket[bucket] || [];
        const plan = plans.find((p) => p.key === selectedKey);
        if (!plan) continue;

        const featureKey = `${bucket}:${plan.key}`;
        const selectedFeatures = selectedFeaturesByBucketPlan[featureKey];
        const computedPrice = computeFeaturePrice(plan, selectedFeatures);

        const items = map.get(currency) || [];
        items.push({
          id: `${bucket}:${selectedKey}`,
          currency,
          label: `${countryLabel(ck)} • ${productLabel(ck, pk)} • ${plan.name}`,
          price: Number(computedPrice || 0),
          meta: { bucket, countryKey: ck, productKey: pk },
          plan,
        });
        map.set(currency, items);
      }
    }
    return Array.from(map.entries()).map(([currency, items]) => ({
      currency,
      items,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCountries,
    selectedProductsByCountry,
    selectedPlanByBucket,
    plansByBucket,
    countryByKey,
    productsByCountry,
    selectedFeaturesByBucketPlan,
  ]);

  function selectPlan(countryKey, productKey, plan) {
    const bucket = `${countryKey}:${productKey}`;
    ensureProductSelected(countryKey, productKey);

    setSelectedPlanByBucket((prev) => ({ ...prev, [bucket]: plan.key }));

    const k = `${bucket}:${plan.key}`;
    setSelectedFeaturesByBucketPlan((prevF) => {
      const current = prevF[k];
      if (current) return { ...prevF, [k]: normalizeSelectedFeatures(plan, current) };
      return { ...prevF, [k]: getRequiredFeatures(plan) };
    });
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

  function addAllToCart() {
    for (const g of selectedItemsByCurrency) {
      for (const it of g.items || []) {
        const { countryKey, productKey } = it.meta || {};
        const plan = it.plan;
        if (!countryKey || !productKey || !plan) continue;

        const bucket = `${countryKey}:${productKey}`;
        const featureKey = `${bucket}:${plan.key}`;
        const selectedRaw = Array.isArray(selectedFeaturesByBucketPlan[featureKey])
          ? selectedFeaturesByBucketPlan[featureKey]
          : getRequiredFeatures(plan);

        const selectedNormalized = normalizeSelectedFeatures(plan, selectedRaw);
        const computedPrice = computeFeaturePrice(plan, selectedNormalized);

        cart.add({
          id: plan.id,
          name: `${countryLabel(countryKey)} • ${productLabel(countryKey, productKey)} • ${plan.name}`,
          region: countryKey,
          product: productKey,
          priceMonthly: computedPrice,
          priceMonthlyUSD: plan.priceMonthlyUSD,
          currency: billing.currency,
          meta: {
            planKey: plan.key,
            selectedFeatures: selectedNormalized,
            planRegion: plan.region,
            planProduct: plan.product,
          },
        });
      }
    }
  }

  return (
    <div className="overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white min-h-screen">
      <div className="mx-auto max-w-7xl h-screen flex flex-col">
        <SubscriptionChoose />

        <div className="mt-5 grid gap-5 lg:grid-cols-12 flex-1 min-h-0">
          {/* LEFT */}
          <aside className="lg:col-span-2 space-y-4 min-h-0">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">Coverage</div>
                <div className="text-[11px] text-slate-500">
                  {loadingGeo ? "Loading…" : `${selectedCountries.length} selected`}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {loadingGeo ? (
                  <div className="text-xs text-slate-500 px-2 py-2">Loading…</div>
                ) : geoRegions.length ? (
                  geoRegions.map((g) => {
                    const open = selectedGeo.includes(g.key);
                    const markets = marketsByGeo[g.key] || [];

                    return (
                      <div key={g.key} className="space-y-0.5">
                        <TreeRow
                          checked={open}
                          onChange={(v) => toggleGeo(g.key, v)}
                          label={g.label || g.key}
                          isGroup
                        />

                        {open ? (
                          <div className="space-y-0.5">
                            {markets.length ? (
                              markets.map((c) => (
                                <TreeRow
                                  key={`${g.key}:${c.key}`}
                                  indent={1}
                                  checked={selectedCountries.includes(c.key)}
                                  onChange={(v) => toggleCountry(c.key, v)}
                                  label={c.label || c.key}
                                />
                              ))
                            ) : (
                              <div className="text-[11px] text-slate-500 pl-6 py-1">
                                No countries
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-500 px-2 py-2">
                    No regions available.
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* CENTER */}
          <main className="lg:col-span-8 min-h-0">
            <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-3 shadow-sm h-full overflow-y-auto">
              {selectedCountries.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  Select at least one country.
                </div>
              ) : (
                <div className="mx-auto w-full max-w-5xl">
                  {/* Selected countries + products */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                    {selectedCountries.map((ck) => {
                      const products = productsByCountry[ck] || [];
                      const chosenProducts = selectedProductsByCountry[ck] || [];

                      return (
                        <div
                          key={ck}
                          className="rounded-xl border border-slate-200 p-3 bg-white transition hover:bg-slate-50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <div
                                className="text-sm font-semibold text-slate-900 truncate"
                                title={String(countryLabel(ck))}
                              >
                                {truncateWords(countryLabel(ck), 3)}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            {products.length === 0 ? (
                              <div className="col-span-2 text-xs text-slate-500">
                                Loading products…
                              </div>
                            ) : (
                              products.map((p) => (
                                <SmallToggle
                                  key={`${ck}:${p.key}`}
                                  checked={chosenProducts.includes(p.key)}
                                  onChange={() => toggleProduct(ck, p.key)}
                                  label={p.label || p.key}
                                />
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Plans */}
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-900">
                        Plans
                      </div>
                    </div>

                    {hasAnyChosenProduct ? (
                      <div className="mt-3">
                        <PlansHeaderRow />
                      </div>
                    ) : null}

                    {!hasAnyChosenProduct ? (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                        Select products to show plan matrix.
                      </div>
                    ) : (
                      <div className="mt-4 space-y-6">
                        {selectedCountries.map((ck) => {
                          const currency = countryCurrency(ck);
                          const chosenProducts = selectedProductsByCountry[ck] || [];
                          if (chosenProducts.length === 0) return null;

                          return (
                            <div key={ck} className="rounded-xl p-3">
                              <div className="space-y-6">
                                {chosenProducts.map((pk) => {
                                  const bucket = `${ck}:${pk}`;
                                  const plans = orderedPlans(plansByBucket[bucket] || []);
                                  const selectedKey = selectedPlanByBucket[bucket];

                                  return (
                                    <div key={bucket}>
                                      {plans.length === 0 ? (
                                        <div className="text-xs text-slate-500">
                                          Loading plans…
                                        </div>
                                      ) : (
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                          {plans.map((plan) => {
                                            const featureKey = `${bucket}:${plan.key}`;
                                            const selectedFeatures =
                                              selectedFeaturesByBucketPlan[featureKey];
                                            const displayPrice = computeFeaturePrice(
                                              plan,
                                              selectedFeatures,
                                            );

                                            return (
                                              <CompactPlanCard
                                                key={`${bucket}:${plan.id}`}
                                                active={selectedKey === plan.key}
                                                plan={plan}
                                                currency={currency}
                                                displayPrice={displayPrice}
                                                onSelect={() => selectPlan(ck, pk, plan)}
                                                onShowMore={() =>
                                                  openFeatures(bucket, plan, currency)
                                                }
                                              />
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* RIGHT */}
          <aside className="lg:col-span-2 min-h-0">
            <div className="sticky top-5 space-y-4">
              <SummaryBlock
                groups={selectedItemsByCurrency}
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
