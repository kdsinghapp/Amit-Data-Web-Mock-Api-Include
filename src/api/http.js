import { API_BASE_URL } from "../config/env.js";

function joinUrl(base, path) {
  const b = (base || "").replace(/\/$/, "");
  const p = (path || "").startsWith("/") ? path : `/${path}`;
  return b ? `${b}${p}` : p; 
}

async function readJson(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function withParams(url, params) {
  const p = params && typeof params === "object" ? params : null;
  if (!p) return url;

  const sp = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });

  const qs = sp.toString();
  if (!qs) return url;
  return url.includes("?") ? `${url}&${qs}` : `${url}?${qs}`;
}

export async function get(path, { signal, params, headers } = {}) {
  const url = withParams(joinUrl(API_BASE_URL, path), params);

  const res = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json", ...(headers || {}) },
    signal,
  });

  const data = await readJson(res);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.error || data.message)) ||
      res.statusText ||
      "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    err.url = url;
    throw err;
  }

  return data;
}
