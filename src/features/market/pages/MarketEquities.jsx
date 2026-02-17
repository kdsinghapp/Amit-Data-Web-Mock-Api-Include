import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/PageHeader.jsx";
import Badge from "../../../components/Badge.jsx";
import MarketLayout from "./MarketLayout.jsx";
import { api } from "../../../api/platformApi.js";

const CATEGORY_KEY = "equities";

function isHttpUrl(s) {
  return /^https?:\/\//i.test(String(s || ""));
}

function FeedCard({ feed, onOpen }) {
  return (
    <button
      type="button"
      onClick={() => onOpen?.(feed)}
      className="w-full text-left rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-slate-500">{feed.code}</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{feed.name}</div>
          {feed.description ? (
            <div className="mt-2 text-sm text-slate-600">{feed.description}</div>
          ) : null}
        </div>
        <div className="mt-1 text-sm text-orange-600 font-semibold">→</div>
      </div>
    </button>
  );
}

export default function MarketEquities() {
  const { regionKey } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState(null);
  const [category, setCategory] = useState(null);
  const [regions, setRegions] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sidebarItems = useMemo(() => {
    if (!categories) return undefined; // MarketLayout fallback will be used
    const list = Array.isArray(categories) ? categories : categories.categories;
    return (list || []).map((c) => ({
      label: c.label,
      to: c.route || `/data/market/${c.key}`,
    }));
  }, [categories]);

  const subItems = useMemo(() => {
    return (regions || []).map((r) => ({
      label: r.label,
      to: `/data/market/${CATEGORY_KEY}/${r.key}`,
    }));
  }, [regions]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const [catsRes, catRes, regionsRes] = await Promise.all([
          api.marketCategories({ signal: ac.signal }).catch(() => null),
          api.marketCategory(CATEGORY_KEY, { signal: ac.signal }),
          api.marketRegions(CATEGORY_KEY, { signal: ac.signal }),
        ]);

        const catsData = catsRes?.data || catsRes;
        setCategories(catsData);

        const catData = catRes?.data || catRes;
        setCategory(catData?.category || catData);

        const regionsData = regionsRes?.data || regionsRes;
        const regionList = regionsData?.regions || regionsData || [];
        setRegions(regionList);

        const effectiveRegionKey = regionKey || regionList?.[0]?.key;
        if (!effectiveRegionKey) {
          setRegion(null);
          setLoading(false);
          return;
        }

        // Keep URL in sync (optional route pattern: /data/market/equities/:regionKey)
        if (!regionKey && regionList?.[0]?.key === effectiveRegionKey) {
          navigate(`/data/market/${CATEGORY_KEY}/${effectiveRegionKey}`, { replace: true });
        }

        const regionRes = await api.marketRegion(CATEGORY_KEY, effectiveRegionKey, { signal: ac.signal });
        const regionData = regionRes?.data || regionRes;
        setRegion(regionData?.region || regionData);
        setLoading(false);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e);
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [regionKey, navigate]);

  function openFeed(feed) {
    const to = feed?.to || feed?.href;
    if (!to) return;
    if (isHttpUrl(to)) {
      window.open(to, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(to);
  }

  return (
    <div>
      <PageHeader eyebrow="Market Data" title={category?.title || "Equities & ETFs"} />
      {category?.description ? (
        <div className="mt-2 max-w-3xl text-sm text-slate-600">{category.description}</div>
      ) : null}

           <MarketLayout
        active={`/data/market/${CATEGORY_KEY}`}
        items={sidebarItems}
        subItems={subItems}
        subItemsMode="both"
      >
        <div className="space-y-6">
          {error ? (
            <div className="page-surface p-6">
              <div className="text-sm font-semibold text-slate-900">Failed to load</div>
              <div className="mt-2 text-sm text-slate-600">{String(error.message || error)}</div>
            </div>
          ) : loading ? (
            <div className="page-surface p-6">
              <div className="text-sm text-slate-600">Loading…</div>
            </div>
          ) : !region ? (
            <div className="page-surface p-6">
              <div className="text-sm text-slate-600">No region data.</div>
            </div>
          ) : (
            <div className="page-surface p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{region.flag || "🏳️"}</div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-900">{region.label}</div>
                  {region.summary ? (
                    <div className="mt-1 text-sm text-slate-600">{region.summary}</div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {(region.badges || []).map((b) => (
                    <Badge key={b} variant={b === "CTA" ? "orange" : undefined}>
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(region.feeds || []).map((feed, idx) => (
                  <FeedCard key={feed.id || `${feed.code}-${idx}`} feed={feed} onOpen={openFeed} />
                ))}
              </div>
            </div>
          )}
        </div>
      </MarketLayout>
    </div>
  );
}
