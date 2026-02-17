

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();
export function isApiConfigured() {
  return Boolean(API_BASE_URL);
}
