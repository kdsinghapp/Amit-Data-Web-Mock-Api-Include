import React, { useEffect, useState } from "react";
import DynamicKitPage from "./DynamicKit";
import { API_BASE_URL } from "../../../config/env.js";

export default function Indices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);

    fetch(API_BASE_URL, { signal: ac.signal })
      .then((res) => res.json())
      .then((json) => {
        const businessData = json?.tabs?.Business?.Data;
        if (!businessData || !businessData.apiEndpoint) {
          throw new Error('Business Data API endpoint not found');
        }
        
        return fetch(businessData.apiEndpoint, { signal: ac.signal });
      })
      .then((res) => res.json())
      .then((json) => {
        const marketDataEndpoint = json?.Data?.["Market Data"]?.apiEndpoint;
        if (!marketDataEndpoint) {
          throw new Error('Market Data API endpoint not found');
        }
        
        return fetch(marketDataEndpoint, { signal: ac.signal });
      })
      .then((res) => res.json())
      .then((json) => {
        const indicesEndpoint = json?.data?.Indices?.apiEndpoint;
        if (!indicesEndpoint) {
          throw new Error('Indices API endpoint not found');
        }
        
        return fetch(indicesEndpoint, { signal: ac.signal });
      })
      .then((res) => res.json())
      .then((json) => {
        setData(json?.IndicesPage || json);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(String(e?.message || e));
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error)
    return <div className="p-6 text-red-600">Failed to load: {error}</div>;

  return (
    <DynamicKitPage
      pageTitle={data?.pageTitle}
      pageContent={data?.PageContent || {}}
      pageConfig={data?.Indices || data} 
    />
  );
}
