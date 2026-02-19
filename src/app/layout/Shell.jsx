import React from "react";

import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { API_BASE_URL } from "../../config/env.js";

export default function Shell({ children }) {
  const apiOk = Boolean(API_BASE_URL);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {!apiOk && (
        <div className="mx-auto max-w-6xl px-4 pt-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
            <b>API not configured.</b> Set <code>api.baseUrl</code> inside <code>src/config/start_page.yaml</code> (example: <code>http://localhost:3001</code>) and restart <code>npm run dev</code>.</div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
