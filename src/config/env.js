import rawYaml from "./start_page.yaml?raw";
function parseSimpleYaml(input) {
  const out = {};
  let currentParent = null;

  const lines = String(input || "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  for (const lineRaw of lines) {
    const line = lineRaw.replace(/\t/g, "  ");
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const indent = line.match(/^\s*/)?.[0]?.length || 0;

    const m = trimmed.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
    if (!m) continue;

    const key = m[1];
    let value = m[2] ?? "";

    // section header like "api:"
    if (value === "") {
      if (indent === 0) {
        if (!out[key] || typeof out[key] !== "object") out[key] = {};
        currentParent = key;
      }
      continue;
    }

    // strip quotes
    value = value.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (indent === 0) {
      out[key] = value;
      currentParent = null;
    } else if (indent >= 2 && currentParent) {
      out[currentParent][key] = value;
    }
  }

  return out;
}

function pickApiBaseUrl(cfg) {
  // Primary expected path:
  const v1 = cfg?.api?.baseUrl;
  // Common alternatives:
  const v2 = cfg?.start?.apiBaseUrl;
  const v3 = cfg?.apiBaseUrl;
  return (v1 || v2 || v3 || "").trim();
}

const parsed = parseSimpleYaml(rawYaml);
export const API_BASE_URL = pickApiBaseUrl(parsed);

export function isApiConfigured() {
  return Boolean(API_BASE_URL);
}
