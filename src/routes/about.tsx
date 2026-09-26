import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck, Users, MapPin, Mail, Phone, ExternalLink, Menu, X } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const TEAM_MEMBERS = [
  {
    name: "Thokozani Mnisi",
    role: "Founder & Chief Technology Officer",
    bio: "Lead developer and agricultural systems architect specializing in edge AI diagnostics and rural connectivity.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Dr. Lerato Molefe",
    role: "Head of Plant Pathology",
    bio: "Senior agronomist overseeing multi-spectral crop inspection accuracy and Act 36 regulatory compliance.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Sipho Dlamini",
    role: "Lead Field Agronomist",
    bio: "Coordinates regional trial tests across maize, soybean, and citrus farms in Gauteng and Mpumalanga.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Kabelo Mokoena",
    role: "AI & Machine Learning Engineer",
    bio: "Fine-tunes transformer computer vision models for low-bandwidth mobile devices in rural farming communities.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "Nandi Khumalo",
    role: "Community & Extension Manager",
    bio: "Manages farmer onboarding, localized translation dialects (all 11 official languages), and cooperative networks.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
  },
];

function AboutPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header matching Contact page structure */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition">
              Home
            </Link>
            <Link to="/about" className="text-emerald-600 font-semibold">
              About Us
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition">
              Contact Us
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Button asChild size="sm">
              <Link to="/auth">Sign in / Get started</Link>
            </Button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-secondary">
                Home
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-secondary text-emerald-600 font-semibold">
                About Us
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-secondary">
                Contact Us
              </Link>
            </nav>
            <div className="pt-3 border-t border-border">
              <Button asChild size="sm" className="w-full justify-center">
                <Link to="/auth">Sign in / Get started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-5xl px-4 py-16 space-y-16">
        {/* Intro */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
            <Building2 className="h-3.5 w-3.5" /> Official Company Profile
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">About BlueSky AgriTech</h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            BlueSky AgriTech (Pty) Ltd is an agricultural technology enterprise headquartered across Johannesburg and Pretoria, Gauteng, dedicated to empowering farmers through cutting-edge artificial intelligence and verified agronomic protocols.
          </p>
        </div>

        {/* Mission & Vision & Problem Solved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-3">
            <h2 className="font-display text-xl font-bold text-emerald-600">Mission &amp; Vision</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To eliminate preventable seasonal crop losses across Southern Africa by providing every grower with instant, accurate AI-driven foliar diagnostics and certified treatment plans in all 11 official languages.
            </p>
          </div>
          <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-3">
            <h2 className="font-display text-xl font-bold text-emerald-600">The Problem We Solve</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Smallholder and commercial farmers lose up to 40% of their yields annually due to delayed pest identification, inappropriate agrochemical selection, and a lack of nearby agronomist extension support.
            </p>
          </div>
        </div>

        {/* Services & Features */}
        <div className="p-8 rounded-3xl border border-border bg-secondary/30 space-y-6">
          <h2 className="font-display text-2xl font-bold">Services &amp; Features Provided</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <h3 className="font-bold text-emerald-600">AI Crop Diagnostics</h3>
              <p className="text-xs text-muted-foreground">Instant photo-based pest and disease identification with confidence scores.</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <h3 className="font-bold text-emerald-600">Multilingual AI Advisor</h3>
              <p className="text-xs text-muted-foreground">Conversational agronomic guidance in isiZulu, isiXhosa, Afrikaans, Sepedi, and more.</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border space-y-2">
              <h3 className="font-bold text-emerald-600">Verified Marketplace</h3>
              <p className="text-xs text-muted-foreground">Connecting local growers with trusted seed, fertilizer, and chemical suppliers.</p>
            </div>
          </div>
        </div>

        {/* AI Supervision & Agronomist Expert Info */}
        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-4">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" /> AI Review &amp; Expert Supervision
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our neural diagnostic models are rigorously audited and calibrated by certified South African plant pathologists and agronomists. Every recommended treatment plan strictly aligns with the guidelines set forth under the <strong className="text-foreground">Fertilizers, Farm Feeds, Agricultural Remedies and Stock Remedies Act (Act 36 of 1947)</strong>.
          </p>
        </div>

        {/* Meet the Team */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-extrabold flex items-center justify-center gap-2">
              <Users className="h-7 w-7 text-emerald-600" /> Meet Our Team
            </h2>
            <p className="text-sm text-muted-foreground">The dedicated professionals behind BlueSky AgriTech.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
                <img src={member.image} alt={member.name} className="h-48 w-full object-cover" />
                <div className="p-6 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-display text-lg font-bold">{member.name}</h3>
                    <p className="text-xs font-semibold text-emerald-600">{member.role}</p>
                    <p className="text-xs text-muted-foreground mt-2">{member.bio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location & Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
            <MapPin className="h-6 w-6 text-emerald-600" />
            <h3 className="font-bold text-sm">Operating Location</h3>
            <p className="text-xs text-muted-foreground">Johannesburg &amp; Pretoria, Gauteng, Republic of South Africa</p>
          </div>
          <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
            <Phone className="h-6 w-6 text-emerald-600" />
            <h3 className="font-bold text-sm">Phone / WhatsApp</h3>
            <p className="text-xs text-muted-foreground">+27 76 104 7696</p>
          </div>
          <div className="p-6 rounded-3xl border border-border bg-card space-y-2">
            <Mail className="h-6 w-6 text-emerald-600" />
            <h3 className="font-bold text-sm">Support Email</h3>
            <p className="text-xs text-muted-foreground">mnisithokozani829@gmail.com</p>
          </div>
        </div>

        {/* Regions Served & Agricultural Links */}
        <div className="p-8 rounded-3xl border border-border bg-secondary/30 space-y-4">
          <h2 className="font-display text-xl font-bold">Regions Served &amp; Resources</h2>
          <p className="text-xs text-muted-foreground">
            Currently serving agricultural enterprises across the Republic of South Africa (Primary rollout in Gauteng, Limpopo, Mpumalanga, and North West).
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold">
            <a href="https://www.daff.gov.za" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline">
              Department of Agriculture (DALRRD) <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://www.arc.agric.za" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline">
              Agricultural Research Council (ARC) <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-card py-12 mt-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground items-center text-center">
          <Logo />
          <p className="text-xs">
            &copy; {new Date().getFullYear()} BlueSky AgriTech Pty LTD. All rights reserved. Support: mnisithokozani829@gmail.com | +27 76 104 7696
          </p>
        </div>
      </footer>
    </div>
  );
}

export default AboutPage;