import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function cx(...arr) {
    return arr.filter(Boolean).join(" ");
}

const OPTIONS = [
    {
        key: "coverage",
        title: "Region based coverage",
        steps: "Step 1: Select Region → Step 2: Select Country → Step 3: Select Product → Step 4: Pick Plan",
        to: "/subscription/coverage",
    },
    {
        key: "country",
        title: "Country based coverage",
        steps: "Step 1: Select Country → Step 2: Select Product → Step 3: Pick Plan",
        to: "/subscription/regions",
    },
    {
        key: "product",
        title: "Market data products",
        steps: "Step 1: Select Product → Step 2: Select Country → Step 3: Pick Plan",
        to: "/subscription/products",
    },
];

function OptionCard({ active, title, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cx(
                "w-full rounded-2xl border px-6 py-5 text-left shadow-sm transition",
                active
                    ? "border-indigo-400 bg-white ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:bg-slate-50"
            )}
        >
            <div className="text-sm font-semibold text-slate-900">{title}</div>
        </button>
    );
}

export default function SubscriptionChoose() {
    const navigate = useNavigate();
    const [activeKey, setActiveKey] = useState("coverage");

    const active = useMemo(
        () => OPTIONS.find((o) => o.key === activeKey) || OPTIONS[0],
        [activeKey]
    );

    return (

        <div className="mx-auto w-full max-w-6xl rounded-3xl border bg-sky-50 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="text-2xl font-semibold text-slate-900">
                        Choose Your Subscription
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{active.steps}</div>
                </div>

                <div className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Simple 3 Step Process
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {OPTIONS.map((o) => (
                    <OptionCard
                        key={o.key}
                        title={o.title}
                        active={o.key === activeKey}
                        onClick={() => {
                            setActiveKey(o.key);
                            navigate(o.to);
                        }}
                    />
                ))}
            </div>
        </div>

    );
}
