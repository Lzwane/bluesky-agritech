import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bug,
  Camera,
  Check,
  CloudSun,
  Languages,
  Leaf,
  MessageSquare,
  ScanLine,
  ShoppingBasket,
  Sparkles,
  TrendingDown,
  WifiOff,
  ShieldAlert,
  FileText,
  X,
} from "lucide-react";

import heroImage from "@/assets/hero-farm.jpg";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Crop Detective — Instant Crop Diagnosis | BlueSky AgriTech" },
      {
        name: "description",
        content:
          "Snap a photo, get an instant AI diagnosis of crop pests, diseases and nutrient deficiencies — with organic and chemical treatment plans in all 11 South African languages.",
      },
      { property: "og:title", content: "AI Crop Detective — Instant Crop Diagnosis" },
      {
        property: "og:description",
        content:
          "AI-powered crop diagnostics, a disease library, verified input marketplace and farm advisor built for South African farmers.",
      },
    ],
  }),
  component: Index,
});

const challenges = [
  {
    icon: TrendingDown,
    title: "Yield lost to late detection",
    body: "Up to 40% of harvests are lost every season because pests and disease are spotted only once damage has spread.",
  },
  {
    icon: Bug,
    title: "Guesswork on treatment",
    body: "Wrong sprays waste money, harm soil health and leave the real problem untreated.",
  },
  {
    icon: Languages,
    title: "Advice locked in English",
    body: "Extension material rarely reaches farmers in the language they actually farm in.",
  },
  {
    icon: WifiOff,
    title: "No agronomist nearby",
    body: "Rural growers can wait weeks for a field visit that may never come.",
  },
];

const steps = [
  {
    icon: Camera,
    title: "Snap the plant",
    body: "Use your phone camera or upload an existing photo of the affected leaf, stem or fruit.",
  },
  {
    icon: ScanLine,
    title: "AI scans it",
    body: "Our model compares your image against thousands of South African crop cases in seconds.",
  },
  {
    icon: Leaf,
    title: "Act with confidence",
    body: "Get the likely cause, severity and both organic and chemical treatment options.",
  },
];

const features = [
  {
    icon: ScanLine,
    title: "AI Diagnosis",
    body: "Photo-based detection of pests, diseases and nutrient deficiencies with confidence scoring.",
  },
  {
    icon: Leaf,
    title: "Plant & Disease Library",
    body: "A searchable encyclopedia of symptoms and remedies for the crops grown across all nine provinces.",
  },
  {
    icon: MessageSquare,
    title: "Farmers Forum",
    body: "Ask questions, share what worked and vote up the advice that saved a season.",
  },
  {
    icon: ShoppingBasket,
    title: "Input Marketplace",
    body: "Compare verified seed, fertiliser and crop protection suppliers by province and price.",
  },
  {
    icon: CloudSun,
    title: "AI Farm Advisor",
    body: "Chat about planting windows, soil prep and pest pressure with an advisor that knows local conditions.",
  },
  {
    icon: Languages,
    title: "11 Official Languages",
    body: "Switch the whole app between isiZulu, isiXhosa, Afrikaans, Sepedi, Setswana and more.",
  },
];

const plans = [
  {
    name: "Free Tier",
    price: "R0",
    cadence: "forever free",
    description: "Essential tools to explore the platform and connect with the community.",
    features: [
      "Access to Field Dashboard",
      "Custom Farmer User Profile",
      "Marketplace Access (Browse only)",
      "General AI Assistant Access",
      "All 11 South African languages",
    ],
    cta: "Start Free",
    featured: false,
  },
  {
    name: "Start Plan",
    price: "R100",
    cadence: "per month",
    description: "Unlock all system modules with a limited monthly allocation of crop scans.",
    features: [
      "Everything in Free Tier",
      "Every Page & Module Unlocked",
      "Limited AI Crop Scans (10 / month)",
      "40 AI Agronomist Chats / month",
      "Full Pathology Disease Library",
      "Full Farmers Forum participation",
      "Includes 30-Day Free Trial",
    ],
    cta: "Choose Start Plan",
    featured: false,
  },
  {
    name: "Growth Plan",
    price: "R200",
    cadence: "per month",
    description: "Complete, unrestricted access to all features with unlimited AI diagnostics.",
    features: [
      "Everything in Start Plan",
      "Unlimited AI Crop Scans",
      "Unlimited AI Agronomist Chats",
      "List up to 4 Products on Marketplace",
      "Priority Agronomic Treatment Plans",
      "Priority WhatsApp & Mobile Support",
      "Includes 30-Day Free Trial",
    ],
    cta: "Get Full Access",
    featured: true,
  },
];

function Index() {
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"agreement" | "privacy" | "cookies">("agreement");

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  const openLegalModal = (tab: "agreement" | "privacy" | "cookies") => {
    setModalTab(tab);
    setAgreementModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#how" className="text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
            <a
              href="#features"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </a>
            <Link
              to="/library"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Library
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="South African farmer inspecting maize plants at sunrise"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/92 to-background/40" />
          <div className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-6 lg:py-28">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                AI Crop Detective by BlueSky AgriTech
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Know what's wrong with your crop in seconds.
              </h1>
              <p className="mt-5 max-w-xl text-base/7 text-muted-foreground sm:text-lg/8">
                Photograph an affected plant and get an instant AI diagnosis with organic and
                chemical treatment plans — built for South African farmers, in all 11 official
                languages.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/auth">Diagnose a crop free</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/library">Browse the library</Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  ["11", "Languages"],
                  ["9", "Provinces covered"],
                  ["<10s", "Average scan"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-extrabold text-foreground">
                      {value}
                    </dt>
                    <dd className="text-xs font-medium text-muted-foreground">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Challenges */}
        <section className="border-y border-border bg-secondary/40 py-20">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Crop losses aren't a knowledge problem. They're an access problem.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Farmers know their land. What they lack is a fast, affordable second opinion at the
                moment a plant starts to turn.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {challenges.map((item) => (
                <Card key={item.title} className="border-border/70 bg-card shadow-card">
                  <CardContent className="pt-6">
                    <item.icon className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 font-display text-base font-bold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="py-20">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Three steps from worry to action
              </h2>
              <p className="mt-4 text-muted-foreground">
                No training, no jargon, no data-heavy downloads.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border/70 bg-card p-6 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="font-display text-sm font-bold text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-y border-border bg-secondary/40 py-20">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Everything a season needs, in one app
              </h2>
              <p className="mt-4 text-muted-foreground">
                Diagnostics is the entry point. The rest keeps your farm moving.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border/70 bg-card shadow-card">
                  <CardContent className="pt-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Simple pricing, priced for local farming
              </h2>
              <p className="mt-4 text-muted-foreground">
                Start completely free or unlock full agronomic powers. Paid plans include a 30-day free trial.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={
                    plan.featured
                      ? "relative border-primary/60 bg-card shadow-card ring-1 ring-primary/30 flex flex-col justify-between"
                      : "border-border/70 bg-card shadow-card flex flex-col justify-between"
                  }
                >
                  <CardContent className="flex h-full flex-col pt-6">
                    {plan.featured ? (
                      <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground">
                        Most popular • Full Access
                      </span>
                    ) : null}
                    <div>
                      <h3 className="font-display text-lg font-bold">{plan.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                      <p className="mt-6 flex items-baseline gap-2">
                        <span className="font-display text-4xl font-extrabold tracking-tight">
                          {plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">{plan.cadence}</span>
                      </p>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {plan.features.map((item) => (
                        <li key={item} className="flex gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="mt-8 w-full"
                      variant={plan.featured ? "default" : "outline"}
                    >
                      <Link to="/auth">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* High-Contrast Bottom CTA Banner with Cool Grey Canvas & Black Text */}
        <section className="border-t border-slate-200 bg-slate-100/90 py-20 text-slate-950 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-10 h-72 w-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-6 px-4 lg:flex-row lg:items-center lg:justify-between lg:px-6 relative z-10">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                Your next scan could save your season.
              </h2>
              <p className="mt-3 text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                Create a free account and diagnose your first crop photo in under a minute.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/20 active:scale-95 px-8 py-6 rounded-2xl cursor-pointer"
            >
              <Link to="/auth">Get started free</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer with clean, standard legal links */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Logo />
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <Link to="/library" className="hover:text-foreground transition">
              Library
            </Link>
            <a href="#pricing" className="hover:text-foreground transition">
              Pricing
            </a>
            <button
              type="button"
              onClick={() => openLegalModal("agreement")}
              className="hover:text-foreground transition cursor-pointer text-left font-medium"
            >
              User Agreement
            </button>
            <button
              type="button"
              onClick={() => openLegalModal("privacy")}
              className="hover:text-foreground transition cursor-pointer text-left font-medium"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => openLegalModal("cookies")}
              className="hover:text-foreground transition cursor-pointer text-left font-medium"
            >
              Cookie Policy
            </button>
            <Link to="/auth" className="hover:text-foreground transition">
              Sign in
            </Link>
          </nav>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} BlueSky AgriTech Pty LTD. All rights reserved.
          </p>
        </div>
      </footer>

      {/* User Agreement, Privacy Policy, & Cookie Policy Modal */}
      {agreementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl text-foreground space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">Legal &amp; User Agreement</h2>
              </div>
              <button
                type="button"
                onClick={() => setAgreementModalOpen(false)}
                className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex gap-2 border-b border-border pb-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab("agreement")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  modalTab === "agreement"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                User Agreement (Terms)
              </button>
              <button
                type="button"
                onClick={() => setModalTab("privacy")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  modalTab === "privacy"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Privacy Policy (POPIA)
              </button>
              <button
                type="button"
                onClick={() => setModalTab("cookies")}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  modalTab === "cookies"
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Cookie Policy
              </button>
            </div>

            {/* Modal Content */}
            <div className="text-xs sm:text-sm text-muted-foreground space-y-4 leading-relaxed">
              {modalTab === "agreement" && (
                <>
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300 flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider">
                        Important Agronomic &amp; Legal Limitation
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed">
                        AI Crop Detective outputs, foliar diagnoses, and AI Agronomist recommendations are provided exclusively as decision-support information. They do not constitute formal, licensed agronomic warranties or replace certified agronomist evaluations. BlueSky AgriTech Pty LTD accepts no financial liability for crop yield shortfalls, phytotoxicity, or misapplication of agrochemicals. All agricultural remedies must strictly comply with the South African Fertilizers, Farm Feeds, Agricultural Remedies and Stock Remedies Act (Act 36 of 1947).
                      </p>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground text-sm">1. Platform Services &amp; Eligibility</h3>
                  <p>
                    By accessing or using the BlueSky AgriTech platform, you represent that you are engaged in agricultural production, research, or commercial enterprise within the Republic of South Africa or Southern Africa and agree to adhere to all terms contained herein (Version v1.2-2026).
                  </p>

                  <h3 className="font-bold text-foreground text-sm">2. Account Responsibility</h3>
                  <p>
                    Users are responsible for maintaining the confidentiality of their account credentials and are fully liable for all activities, marketplace listings, and forum communications conducted under their profile.
                  </p>

                  <h3 className="font-bold text-foreground text-sm">3. Agrochemical &amp; Spray Application Compliance</h3>
                  <p>
                    Any treatment, dosage, or chemical protocol recommended by the AI engine must be independently verified against official product labels registered under Act 36 of 1947 prior to handling, tank-mixing, or spraying. Certified Personal Protective Equipment (PPE) and mandatory pre-harvest withholding periods (PHI) must be strictly enforced by the user.
                  </p>
                </>
              )}

              {modalTab === "privacy" && (
                <>
                  <h3 className="font-bold text-foreground text-sm">Protection of Personal Information Act (POPIA) Notice</h3>
                  <p>
                    BlueSky AgriTech Pty LTD respects your privacy and is fully committed to compliance with the South African Protection of Personal Information Act (Act 4 of 2013).
                  </p>
                  <p>
                    We collect your full name, farm identity, province, contact information, and crop imagery solely to deliver tailored foliar diagnostics, generate agronomic alerts, and facilitate agricultural commerce. Your telemetry data is never sold to third-party data brokers.
                  </p>
                </>
              )}

              {modalTab === "cookies" && (
                <>
                  <h3 className="font-bold text-foreground text-sm">Cookie &amp; Local Storage Policy</h3>
                  <p>
                    BlueSky AgriTech utilizes essential browser cookies and local storage tokens (`bluesky_theme_mode`, session authentication tokens, and cached diagnostic registries) to preserve your user preferences and offline-tolerant diagnostic histories.
                  </p>
                  <p>
                    You can manage or disable non-essential cookies via your browser settings; however, disabling local tokens may affect persistent theme preferences and offline history access.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-border flex justify-end">
              <Button
                type="button"
                onClick={() => setAgreementModalOpen(false)}
                className="cursor-pointer"
              >
                Close Legal Notice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;