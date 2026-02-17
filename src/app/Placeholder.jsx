import React from "react";
import { useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";

export default function Placeholder() {
  const loc = useLocation();
  return (
    <div className="page-surface p-8">
      <PageHeader eyebrow="Page" title={loc.pathname} subtitle="Placeholder page (wire to your real content)." />
      <div className="text-sm text-slate-600">Content goes here.</div>
    </div>
  );
}
