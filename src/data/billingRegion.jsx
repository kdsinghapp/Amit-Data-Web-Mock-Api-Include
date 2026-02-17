import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { api } from "../api/platformApi.js";
import { REGIONS } from "./subscriptionData.js";

const STORAGE_KEY = "billing_region";

const BillingRegionContext = createContext(null);

function safeReadStorage() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWriteStorage(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore
  }
}

export function BillingRegionProvider({ children }) {
  const [regions, setRegions] = useState(REGIONS);
  const [loading, setLoading] = useState(true);

  const [billingRegionKey, setBillingRegionKey] = useState(() => safeReadStorage() || "us");

  // Load pricing regions from API (fallback to static REGIONS)
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    api
      .pricingRegions({ signal: ac.signal })
      .then((res) => {
        const items = res?.data;
        if (Array.isArray(items) && items.length) setRegions(items);
      })
      .catch(() => {
        // ignore, keep fallback
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, []);

  // Persist
  useEffect(() => {
    if (!billingRegionKey) return;
    safeWriteStorage(billingRegionKey);
  }, [billingRegionKey]);

  // If current key not found in latest list, reset to US
  useEffect(() => {
    if (!regions?.length) return;
    if (!regions.some((r) => r.key === billingRegionKey)) {
      setBillingRegionKey("us");
    }
  }, [regions, billingRegionKey]);

  const billingRegion = useMemo(
    () => regions.find((r) => r.key === billingRegionKey) || regions.find((r) => r.key === "us") || null,
    [regions, billingRegionKey]
  );

  const value = useMemo(
    () => ({
      loading,
      regions,
      billingRegion,
      billingRegionKey: billingRegion?.key || "us",
      currency: billingRegion?.currency || "USD",
      setBillingRegionKey,
    }),
    [loading, regions, billingRegion]
  );

  return <BillingRegionContext.Provider value={value}>{children}</BillingRegionContext.Provider>;
}

export function useBillingRegion() {
  const ctx = useContext(BillingRegionContext);
  if (!ctx) throw new Error("useBillingRegion must be used within BillingRegionProvider");
  return ctx;
}
