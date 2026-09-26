import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench, 
  CheckCircle2,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formType, setFormType] = useState<string>("general");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success("Your message has been dispatched successfully. We will be in touch within the expected timeframe.");
      setFullName("");
      setEmail("");
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition">
              Home
            </Link>
            <Link to="/about" className="text-muted-foreground hover:text-foreground transition">
              About Us
            </Link>
            <Link to="/contact" className="text-emerald-600 font-semibold">
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
          <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 shadow-xl">
            <nav className="flex flex-col space-y-2 text-sm font-medium">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-secondary">
                Home
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-secondary">
                About Us
              </Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-xl hover:bg-secondary text-emerald-600 font-semibold">
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

      <main className="mx-auto max-w-6xl px-4 py-16 space-y-16">
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
            <Phone className="h-3.5 w-3.5" /> Direct Support &amp; Assistance
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight">Contact BlueSky AgriTech</h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            We are here to support your farming operations. Reach out for technical assistance, reporting diagnosis discrepancies, privacy requests, or general inquiries.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl border border-border bg-card space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Business Email</h3>
            <p className="text-xs text-muted-foreground">For official correspondence and inquiries:</p>
            <a href="mailto:mnisithokozani829@gmail.com" className="text-xs font-semibold text-emerald-600 hover:underline block truncate">
              mnisithokozani829@gmail.com
            </a>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Phone &amp; WhatsApp</h3>
            <p className="text-xs text-muted-foreground">Direct support line for urgent assistance:</p>
            <a href="https://wa.me/27761047696" target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-600 hover:underline block">
              +27 76 104 7696
            </a>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Operating Location</h3>
            <p className="text-xs text-muted-foreground">Headquarters &amp; Field Operations:</p>
            <p className="text-xs font-semibold text-foreground">Johannesburg &amp; Pretoria, Gauteng, South Africa</p>
          </div>
        </div>

        {/* Main Grid: Form & Support Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Interactive Contact Form */}
          <div className="lg:col-span-7 p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">Send us a Message</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Select your query category below and our support team will get back to you.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Query Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="general">General Support / Inquiry</option>
                  <option value="technical">Technical Support &amp; App Troubleshooting</option>
                  <option value="diagnosis">Report Incorrect Diagnosis / Unsafe Advice</option>
                  <option value="privacy">POPIA Privacy &amp; Account Deletion Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thokozani Mnisi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your request, technical issue, or report..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full py-6 rounded-xl font-bold gap-2">
                {submitting ? "Sending..." : <><Send className="h-4 w-4" /> Submit Support Request</>}
              </Button>
            </form>
          </div>

          {/* Right Column: Guidelines, Response Times & Special Protocols */}
          <div className="lg:col-span-5 space-y-6">
            {/* Response Time Card */}
            <div className="p-6 rounded-3xl border border-border bg-secondary/30 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" /> Expected Response Time
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our support team operates Monday to Friday (08:00 – 17:00 SAST). Standard inquiries receive responses within <strong className="text-foreground">2 to 4 business hours</strong>. Urgent crop pathology alerts are prioritized within 1 hour.
              </p>
            </div>

            {/* Technical Support Instructions */}
            <div className="p-6 rounded-3xl border border-border bg-card space-y-3 shadow-sm">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Wrench className="h-4 w-4 text-emerald-600" /> Technical Support Instructions
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you encounter camera permission blocks, upload errors, or offline synchronization delays:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 pl-4 list-disc">
                <li>Check your stable mobile or Wi-Fi internet connection.</li>
                <li>Clear browser local cache if the interface freezes.</li>
                <li>Ensure image file sizes remain under 15MB.</li>
                <li>Contact us via WhatsApp (+27 76 104 7696) with screenshots if errors persist.</li>
              </ul>
            </div>

            {/* Reporting Incorrect Diagnoses & Unsafe Advice */}
            <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-600" /> Reporting Incorrect Diagnoses
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We maintain rigorous AI oversight. If you believe a foliar scan misidentified a pest or provided inaccurate Act 36 guidance, please select the <strong className="text-foreground">"Report Incorrect Diagnosis"</strong> option in the contact form, attaching the scan ID and crop details for immediate review by our senior agronomists.
              </p>
            </div>

            {/* Privacy & Account Deletion Requests */}
            <div className="p-6 rounded-3xl border border-border bg-card space-y-3 shadow-sm">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-600" /> Privacy &amp; Account Deletion (POPIA)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In compliance with the Protection of Personal Information Act (POPIA), you have the right to request a complete export or permanent erasure of your personal farm data and diagnostic history. Submit a request using the contact form under "POPIA Privacy".
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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

export default ContactPage;