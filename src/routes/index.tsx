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
  MapPin,
  Phone,
  Mail,
  Menu,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-6">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#how" className="text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </a>
            <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
              About Us
            </Link>
            <Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
              Contact Us
            </Link>
          </nav>

          {/* Desktop Right Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <a
                href="#how"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary transition"
              >
                How it works
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary transition"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary transition"
              >
                Pricing
              </a>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary transition text-emerald-600 font-semibold"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary transition"
              >
                Contact Us
              </Link>
            </nav>
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-center">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="w-full justify-center">
                <Link to="/auth">Get started</Link>
              </Button>
            </div>
          </div>
        )}
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
                  <Link to="/about">Learn more about us</Link>
                </Button>
              </div>
              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
                {[
                  ["11", "Languages"],
                  ["9", "Provinces covered"],
                  ["<10s", "Average scan"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="font-display text-2xl font-extrabold text-foreground">{value}</dt>
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
                <div key={step.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-card">
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
                    <Button asChild className="mt-8 w-full" variant={plan.featured ? "default" : "outline"}>
                      <Link to="/auth">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Us Section */}
        <section id="contact" className="border-t border-border bg-secondary/20 py-20">
          <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Get in touch with BlueSky AgriTech
              </h2>
              <p className="mt-4 text-muted-foreground">
                Have questions about our AI diagnostics, commercial contracts, or platform support? Reach out to us directly.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-start gap-4">
                <MapPin className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sm">Operating Venue</h3>
                  <p className="text-xs text-muted-foreground mt-1">Johannesburg &amp; Pretoria, Gauteng, South Africa</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-start gap-4">
                <Phone className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sm">Telephone / WhatsApp</h3>
                  <p className="text-xs text-muted-foreground mt-1">+27 76 104 7696</p>
                </div>
              </div>
              <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-start gap-4">
                <Mail className="h-6 w-6 text-emerald-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sm">Support Email</h3>
                  <p className="text-xs text-muted-foreground mt-1 truncate">mnisithokozani829@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Logo />
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <Link to="/about" className="hover:text-foreground transition font-medium">
              About Us
            </Link>
            <a href="#contact" className="hover:text-foreground transition font-medium">
              Contact Us
            </a>
            <Link to="/terms" className="hover:text-foreground transition font-medium">
              User Agreement
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition font-medium">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="hover:text-foreground transition font-medium">
              Cookie Policy
            </Link>
            <Link to="/auth" className="hover:text-foreground transition">
              Sign in
            </Link>
          </nav>
          <div className="text-xs space-y-1">
            <p>&copy; {new Date().getFullYear()} BlueSky AgriTech Pty LTD. All rights reserved.</p>
            <p className="text-muted-foreground">Support: mnisithokozani829@gmail.com | +27 76 104 7696</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Index;