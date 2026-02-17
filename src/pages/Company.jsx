import React, { useMemo, useState } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Container({ children }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function Card({ className = "", children }) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-sm text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

const DEFAULT_COMPANY = {
  name: "YourCompany",
  tagline: "Build reliable products faster.",
  blurb:
    "We help teams ship secure, scalable software through thoughtful design, strong engineering, and operational discipline.",
  primaryCTA: { label: "Get in touch", href: "#contact" },
  secondaryCTA: { label: "Careers", href: "#careers" },

  highlights: [
    { label: "Founded", value: "2021" },
    { label: "Customers", value: "120+" },
    { label: "Uptime", value: "99.95%" },
    { label: "Response", value: "< 24h" },
  ],

  values: [
    {
      title: "Clarity",
      body: "We reduce complexity, write things down, and keep decision-making explicit.",
    },
    {
      title: "Reliability",
      body: "We design for failure, measure outcomes, and treat operations as product quality.",
    },
    {
      title: "Speed with control",
      body: "We move fast with guardrails: testing, reviews, staged rollouts, and telemetry.",
    },
    {
      title: "Customer trust",
      body: "We protect user data, document behavior, and communicate issues early and clearly.",
    },
  ],

  capabilities: [
    {
      title: "Product Engineering",
      items: ["Web + Mobile", "API design", "Performance", "Accessibility", "Testing"],
    },
    {
      title: "Cloud & Data",
      items: ["Security", "Observability", "Cost control", "ETL", "Warehousing"],
    },
    {
      title: "Delivery",
      items: ["Roadmaps", "Sprints", "Release trains", "Incident process", "Documentation"],
    },
  ],

  team: [
    { name: "Alex Rivera", role: "CEO", bio: "Product strategy, partnerships, and delivery leadership." },
    { name: "Sam Chen", role: "CTO", bio: "Architecture, platform reliability, and engineering standards." },
    { name: "Mina Patel", role: "Head of Design", bio: "Design systems, UX quality, and research." },
    { name: "Jordan Blake", role: "Head of Ops", bio: "Security, compliance, and customer success operations." },
  ],

  timeline: [
    { year: "2021", title: "Company formed", body: "Started with a small team focused on execution quality." },
    { year: "2022", title: "First enterprise customers", body: "Standardized delivery and reliability practices." },
    { year: "2023", title: "Expanded platform", body: "Improved performance, observability, and security posture." },
    { year: "2024", title: "International growth", body: "Scaled support and onboarding across time zones." },
  ],

  jobs: [
    { title: "Senior Frontend Engineer", location: "Remote", type: "Full-time", href: "/careers/frontend" },
    { title: "Backend Engineer", location: "Remote", type: "Full-time", href: "/careers/backend" },
    { title: "Product Designer", location: "Hybrid", type: "Full-time", href: "/careers/design" },
  ],

  contact: {
    email: "hello@yourcompany.com",
    phone: "+1 (555) 010-1234",
    address: "City, Country",
  },
};

export default function CompanyPage({ company = DEFAULT_COMPANY }) {
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = useMemo(() => ["Overview", "Values", "Team", "Careers"], []);
  const stats = company.highlights ?? [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <Container>
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                <span className="text-sm font-bold">{(company.name || "C")[0]}</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">{company.name}</div>
                <div className="text-xs text-slate-500">{company.tagline}</div>
              </div>
            </div>

            <nav className="hidden items-center gap-2 md:flex">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(t)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold",
                    activeTab === t ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {t}
                </button>
              ))}
              <a
                href={company.primaryCTA?.href || "#contact"}
                className="ml-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {company.primaryCTA?.label || "Contact"}
              </a>
            </nav>
          </div>
        </Container>
      </div>

      {/* Hero */}
      <div className="border-b border-slate-200 bg-white">
        <Container>
          <div className="grid grid-cols-1 gap-8 py-12 lg:grid-cols-2 lg:py-16">
            <div className="flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2">
                <Pill>Company</Pill>
                <Pill>Product • Engineering • Ops</Pill>
                <Pill>Security-first</Pill>
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                {company.tagline}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">{company.blurb}</p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={company.primaryCTA?.href || "#contact"}
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {company.primaryCTA?.label || "Get in touch"}
                </a>
                <a
                  href={company.secondaryCTA?.href || "#careers"}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                >
                  {company.secondaryCTA?.label || "Careers"}
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <Card key={s.label} className="p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {s.label}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-slate-900">{s.value}</div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <Card className="w-full overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    What we do
                  </div>
                  <div className="mt-2 text-xl font-semibold">Delivery you can trust</div>
                  <p className="mt-2 text-sm text-slate-600">
                    We build and operate production systems with clear ownership, measurable reliability, and
                    disciplined change management.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
                  {company.capabilities.map((c) => (
                    <div key={c.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold">{c.title}</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {c.items.map((it) => (
                          <li key={it} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            <span>{it}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </div>

      {/* Tabs content */}
      <Container>
        <div className="py-10">
          {/* Mobile tab switch */}
          <div className="mb-6 md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
            >
              {tabs.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {activeTab === "Overview" ? (
            <div className="space-y-8">
              <div id="overview">
                <SectionHeader
                  eyebrow="Overview"
                  title="A focused team built around execution"
                  subtitle="We combine product thinking, strong engineering, and operational rigor to deliver outcomes without surprises."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                  <div className="text-sm font-semibold">How we work</div>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { title: "Define", body: "Goals, constraints, success metrics, and ownership." },
                      { title: "Design", body: "User flows, system boundaries, and failure modes." },
                      { title: "Build", body: "Small PRs, tests, and predictable releases." },
                      { title: "Operate", body: "Monitoring, incident playbooks, and continuous improvement." },
                    ].map((x) => (
                      <div key={x.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900">{x.title}</div>
                        <p className="mt-2 text-sm text-slate-600">{x.body}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="text-sm font-semibold">Timeline</div>
                  <div className="mt-4 space-y-4">
                    {company.timeline.map((t) => (
                      <div key={t.year} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-baseline justify-between gap-3">
                          <div className="text-sm font-semibold">{t.title}</div>
                          <div className="text-xs font-semibold text-slate-500">{t.year}</div>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{t.body}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">Security and compliance</div>
                    <p className="mt-2 text-sm text-slate-600">
                      We implement least privilege, strong auditability, and predictable change control.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["Access control", "Audit logs", "Backups", "Incident response", "Data minimization"].map(
                      (x) => (
                        <Pill key={x}>{x}</Pill>
                      )
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {activeTab === "Values" ? (
            <div className="space-y-8" id="values">
              <SectionHeader
                eyebrow="Values"
                title="Principles that drive decisions"
                subtitle="These guide how we prioritize, build, and operate."
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {company.values.map((v) => (
                  <Card key={v.title} className="p-6">
                    <div className="text-sm font-semibold">{v.title}</div>
                    <p className="mt-3 text-sm text-slate-600">{v.body}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <div className="text-sm font-semibold">Operating standards</div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    "Write down decisions and expectations.",
                    "No unobserved releases in production.",
                    "Every incident produces a concrete improvement.",
                    "Own the entire lifecycle: build, deploy, run.",
                  ].map((x) => (
                    <div key={x} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                      {x}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {activeTab === "Team" ? (
            <div className="space-y-8" id="team">
              <SectionHeader
                eyebrow="Team"
                title="Leadership"
                subtitle="Clear ownership across product, engineering, design, and operations."
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {company.team.map((m) => (
                  <Card key={m.name} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{m.name}</div>
                        <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {m.role}
                        </div>
                      </div>
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white">
                        <span className="text-sm font-bold">{m.name.split(" ")[0][0]}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{m.bio}</p>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <div className="text-sm font-semibold">Work locations</div>
                <p className="mt-2 text-sm text-slate-600">
                  Remote-first with overlap hours and documented processes.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Americas", "Europe", "APAC"].map((x) => (
                    <Pill key={x}>{x}</Pill>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}

          {activeTab === "Careers" ? (
            <div className="space-y-8" id="careers">
              <SectionHeader
                eyebrow="Careers"
                title="Open roles"
                subtitle="Join a team focused on quality, speed, and reliability."
              />

              <div className="grid grid-cols-1 gap-4">
                {company.jobs.map((j) => (
                  <Card key={j.title} className="p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">{j.title}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          {j.location} • {j.type}
                        </div>
                      </div>
                      <a
                        href={j.href}
                        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        View role
                      </a>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-6">
                <div className="text-sm font-semibold">Hiring process</div>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { t: "Screen", d: "Short call to confirm fit and constraints." },
                    { t: "Technical", d: "Practical exercise aligned with the role." },
                    { t: "Final", d: "Ownership, communication, and execution depth." },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="text-sm font-semibold">{x.t}</div>
                      <p className="mt-2 text-sm text-slate-600">{x.d}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </Container>

      {/* Contact */}
      <div className="border-t border-slate-200 bg-white" id="contact">
        <Container>
          <div className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionHeader
                eyebrow="Contact"
                title="Talk to us"
                subtitle="Use these channels for partnerships, support escalation, or commercial inquiries."
              />
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email</div>
                  <div className="mt-2 text-sm font-semibold">{company.contact.email}</div>
                  <a
                    href={`mailto:${company.contact.email}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Email us
                  </a>
                </Card>
                <Card className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</div>
                  <div className="mt-2 text-sm font-semibold">{company.contact.phone}</div>
                  <a
                    href={`tel:${company.contact.phone}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    Call
                  </a>
                </Card>
              </div>
            </div>

            <Card className="p-6">
              <div className="text-sm font-semibold">Company</div>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-slate-500">Address</div>
                  <div className="text-right font-semibold text-slate-900">{company.contact.address}</div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-slate-500">Press</div>
                  <div className="text-right font-semibold text-slate-900">press@yourcompany.com</div>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-slate-500">Security</div>
                  <div className="text-right font-semibold text-slate-900">security@yourcompany.com</div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Links</div>
                <div className="mt-3 flex flex-col gap-2 text-sm font-semibold">
                  <a className="text-slate-900 hover:text-slate-700" href="/privacy">
                    Privacy Policy
                  </a>
                  <a className="text-slate-900 hover:text-slate-700" href="/terms">
                    Terms of Service
                  </a>
                  <a className="text-slate-900 hover:text-slate-700" href="/status">
                    System Status
                  </a>
                </div>
              </div>
            </Card>
          </div>

          <div className="border-t border-slate-200 py-6 text-xs text-slate-500">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>
        </Container>
      </div>
    </div>
  );
}
