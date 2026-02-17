import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../../components/PageHeader.jsx";
import MarketLayout from "./MarketLayout.jsx";
import { api } from "../../../api/platformApi.js";

const labelMap = {
  "options": "Options",
  "indices": "Indices",
  "fixed-income": "Fixed income",
  "forex": "Forex",
  "crypto": "Cryptocurrencies",
  "spot": "Spot",
};

export default function MarketPlaceholder() {
  const { category } = useParams();
  const fallbackTitle = labelMap[category] || "Market Data";

  const [categories, setCategories] = useState(null);
  const [cat, setCat] = useState(null);
  const [regions, setRegions] = useState([]);

  const sidebarItems = useMemo(() => {
    if (!categories) return undefined;
    const list = Array.isArray(categories) ? categories : categories.categories;
    return (list || []).map((c) => ({
      label: c.label,
      to: c.route || `/data/market/${c.key}`,
    }));
  }, [categories]);

  const subItems = useMemo(() => {
    return (regions || []).map((r) => ({
      label: r.label,
      to: `/data/market/${category}/${r.key}`,
    }));
  }, [regions, category]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [catsRes, catRes, regionsRes] = await Promise.all([
          api.marketCategories({ signal: ac.signal }).catch(() => null),
          api.marketCategory(category, { signal: ac.signal }).catch(() => null),
          api.marketRegions(category, { signal: ac.signal }).catch(() => null),
        ]);
        const catsData = catsRes?.data || catsRes;
        setCategories(catsData);

        const catData = catRes?.data || catRes;
        setCat(catData?.category || catData);

        const regionsData = regionsRes?.data || regionsRes;
        setRegions(regionsData?.regions || regionsData || []);
      } catch {
        // silent fallback
      }
    })();
    return () => ac.abort();
  }, [category]);

  const title = cat?.title || fallbackTitle;
  return (
    <div>
      <PageHeader eyebrow="Market Data" title={title} />
      {cat?.description ? (
        <div className="mt-2 max-w-3xl text-sm text-slate-600">{cat.description}</div>
      ) : null}

      <MarketLayout active={`/data/market/${category}`} items={sidebarItems} subItems={subItems}>
        <div className="page-surface p-6">
          <div className="text-sm text-slate-600">
            Placeholder page for <span className="font-semibold">{title}</span>.
          </div>
        </div>
      </MarketLayout>
    </div>
  );
}
