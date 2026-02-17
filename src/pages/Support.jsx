import React, { useMemo, useState } from "react";

const FAQS = [
  {
    q: "How do I reset my password?",
    a: "Go to the login screen and click “Forgot password”. You’ll receive a reset link by email.",
    tags: ["account", "login", "password"],
  },
  {
    q: "I didn’t receive the verification email. What should I do?",
    a: "Check spam/promotions. Then request a new verification email from your account settings. If it still doesn’t arrive, contact support with your email address.",
    tags: ["account", "email"],
  },
  {
    q: "How do I update my billing details?",
    a: "Open Settings → Billing. You can update your payment method and download invoices there.",
    tags: ["billing", "invoices"],
  },
  {
    q: "How do I report a bug?",
    a: "Submit a support ticket with steps to reproduce, expected vs actual behavior, and screenshots if possible.",
    tags: ["bug", "issue"],
  },
  {
    q: "What’s your support response time?",
    a: "Standard: within 24 hours on business days. Urgent: within 4 hours for Priority = High tickets.",
    tags: ["support", "sla"],
  },
];

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm font-medium text-slate-900">{label}</label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
      {children}
    </span>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default function SupportPage() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "Technical",
    priority: "Normal",
    subject: "",
    message: "",
  });

  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ type: "idle", msg: "" });

  const filteredFaqs = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return FAQS;

    return FAQS.filter((f) => {
      const hay = `${f.q} ${f.a} ${f.tags.join(" ")}`.toLowerCase();
      return hay.includes(s);
    });
  }, [search]);

  const errors = useMemo(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Required.";
    if (!form.email.trim()) e.email = "Required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email.";
    if (!form.subject.trim()) e.subject = "Required.";
    if (!form.message.trim() || form.message.trim().length < 20) e.message = "Write at least 20 characters.";
    return e;
  }, [form]);

  const hasErrors = Object.keys(errors).length > 0;

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function markTouched(key) {
    setTouched((p) => ({ ...p, [key]: true }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus({ type: "idle", msg: "" });

    const allTouched = {
      name: true,
      email: true,
      subject: true,
      message: true,
      category: true,
      priority: true,
    };
    setTouched(allTouched);

    if (hasErrors) {
      setStatus({ type: "error", msg: "Fix the highlighted fields and try again." });
      return;
    }

    try {
      // Replace with your real API call:
      // await fetch("/api/support/tickets", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) })
      //   .then(r => { if(!r.ok) throw new Error("Request failed"); });

      await new Promise((r) => setTimeout(r, 350));

      setStatus({ type: "success", msg: "Ticket submitted. We’ll reply by email." });
      setForm({
        name: "",
        email: "",
        category: "Technical",
        priority: "Normal",
        subject: "",
        message: "",
      });
      setTouched({});
    } catch {
      setStatus({ type: "error", msg: "Could not submit. Try again or email support directly." });
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">

          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Support Center
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Search answers, submit a ticket, or contact us directly.
          </p>

          <div className="mt-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search help articles and FAQs…"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-28 text-sm text-slate-900 shadow-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300"
              />
              <button
                type="button"
                onClick={() => setSearch("")}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-semibold",
                  search.trim()
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-200 text-slate-600 cursor-not-allowed"
                )}
                disabled={!search.trim()}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <Card title="Contact" subtitle="Fastest ways to reach us">
              <div className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">Email</div>
                    <div className="text-slate-600">support@yourapp.com</div>
                  </div>
                  <a
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    href="mailto:support@yourapp.com"
                  >
                    Email
                  </a>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">Chat</div>
                    <div className="text-slate-600">In-app chat (9:00–18:00)</div>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    onClick={() => setStatus({ type: "idle", msg: "" })}
                  >
                    Open
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">Docs</div>
                    <div className="text-slate-600">Guides and API reference</div>
                  </div>
                  <a
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                    href="/docs"
                  >
                    View
                  </a>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Recommended ticket details
                  </div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-slate-600">
                    <li>Steps to reproduce</li>
                    <li>Expected vs actual result</li>
                    <li>Device/browser + app version</li>
                    <li>Screenshots/logs (if available)</li>
                  </ul>
                </div>
              </div>
            </Card>

            <Card title="Top topics" subtitle="Common categories">
              <div className="flex flex-wrap gap-2">
                {["Account", "Billing", "Technical", "Security", "Integrations", "Feature request"].map(
                  (t) => (
                    <button
                      key={t}
                      type="button"
                      className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-50"
                      onClick={() => setForm((p) => ({ ...p, category: t }))}
                    >
                      {t}
                    </button>
                  )
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card title="Submit a ticket" subtitle="We answer by email">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name" error={touched.name ? errors.name : ""}>
                    <input
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => markTouched("name")}
                      className={cn(
                        "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none",
                        touched.name && errors.name ? "border-red-300" : "border-slate-200"
                      )}
                      placeholder="Your name"
                    />
                  </Field>

                  <Field label="Email" error={touched.email ? errors.email : ""}>
                    <input
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                      className={cn(
                        "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none",
                        touched.email && errors.email ? "border-red-300" : "border-slate-200"
                      )}
                      placeholder="you@company.com"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Category">
                    <select
                      value={form.category}
                      onChange={(e) => setField("category", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    >
                      <option>Technical</option>
                      <option>Account</option>
                      <option>Billing</option>
                      <option>Security</option>
                      <option>Integrations</option>
                      <option>Feature request</option>
                      <option>Other</option>
                    </select>
                  </Field>

                  <Field label="Priority" hint="High only for outages">
                    <select
                      value={form.priority}
                      onChange={(e) => setField("priority", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </Field>
                </div>

                <Field label="Subject" error={touched.subject ? errors.subject : ""}>
                  <input
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    onBlur={() => markTouched("subject")}
                    className={cn(
                      "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none",
                      touched.subject && errors.subject ? "border-red-300" : "border-slate-200"
                    )}
                    placeholder="Short summary of the issue"
                  />
                </Field>

                <Field
                  label="Message"
                  hint="Minimum 20 characters"
                  error={touched.message ? errors.message : ""}
                >
                  <textarea
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    onBlur={() => markTouched("message")}
                    className={cn(
                      "min-h-[140px] w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm outline-none",
                      touched.message && errors.message ? "border-red-300" : "border-slate-200"
                    )}
                    placeholder="Describe the issue with steps to reproduce..."
                  />
                </Field>

                {status.type !== "idle" ? (
                  <div
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm",
                      status.type === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-red-200 bg-red-50 text-red-900"
                    )}
                  >
                    {status.msg}
                  </div>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                    onClick={() => {
                      setForm({
                        name: "",
                        email: "",
                        category: "Technical",
                        priority: "Normal",
                        subject: "",
                        message: "",
                      });
                      setTouched({});
                      setStatus({ type: "idle", msg: "" });
                    }}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-semibold text-white",
                      hasErrors ? "bg-slate-400" : "bg-slate-900 hover:bg-slate-800"
                    )}
                  >
                    Submit ticket
                  </button>
                </div>
              </form>
            </Card>

            <Card title="FAQs" subtitle={`${filteredFaqs.length} results`}>
              <div className="space-y-2">
                {filteredFaqs.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    No matches. Submit a ticket with your details.
                  </div>
                ) : (
                  filteredFaqs.map((f, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div key={f.q} className="rounded-2xl border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                        >
                          <div className="text-sm font-semibold text-slate-900">{f.q}</div>
                          <div className="text-slate-500">{isOpen ? "−" : "+"}</div>
                        </button>
                        {isOpen ? (
                          <div className="border-t border-slate-100 px-4 py-3">
                            <p className="text-sm text-slate-700">{f.a}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {f.tags.map((t) => (
                                <span
                                  key={t}
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              © {new Date().getFullYear()} YourApp. All rights reserved.
            </div>
            <div className="flex gap-4 text-xs font-semibold text-slate-700">
              <a className="hover:text-slate-900" href="/terms">
                Terms
              </a>
              <a className="hover:text-slate-900" href="/privacy">
                Privacy
              </a>
              <a className="hover:text-slate-900" href="/status">
                Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
