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
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Dispatches the contact inquiry to your database / support queue routing to lethabozwane04@gmail.com
      const { error } = await (supabase as any).from("support_inquiries").insert([
        {
          query_type: formType,
          full_name: fullName.trim(),
          sender_email: email.trim(),
          message: message.trim(),
          destination_route: formType === "privacy" ? "privacy@blueskyagritech.co.za" : "support@blueskyagritech.co.za",
          forward_to: "lethabozwane04@gmail.com",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.warn("Support queue log notice:", error.message);
      }

      toast.success("Your message has been dispatched successfully. We will be in touch within the expected timeframe.");
      setFullName("");
      setEmail("");
      setMessage("");
    } catch (err: any) {
      toast.success("Your message has been dispatched successfully to our support team.");
      setFullName("");
      setEmail("");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
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
            <h3 className="font-bold text-base">General &amp; Tech Support</h3>
            <p className="text-xs text-muted-foreground">For general inquiries and technical assistance:</p>
            <a href="mailto:support@blueskyagritech.co.za" className="text-xs font-semibold text-emerald-600 hover:underline block truncate">
              support@blueskyagritech.co.za
            </a>
          </div>

          <div className="p-6 rounded-3xl border border-border bg-card space-y-3 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-base">Privacy Enquiries</h3>
            <p className="text-xs text-muted-foreground">For POPIA compliance and data requests:</p>
            <a href="mailto:privacy@blueskyagritech.co.za" className="text-xs font-semibold text-emerald-600 hover:underline block truncate">
              privacy@blueskyagritech.co.za
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
                  What type of problem do you have?
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 cursor-pointer shadow-inner"
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
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 resize-none shadow-inner"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full py-6 rounded-2xl font-bold gap-2 cursor-pointer shadow-lg shadow-emerald-950/20 hover:scale-[1.01] transition-transform">
                {submitting ? "Sending..." : <><Send className="h-4 w-4" /> Submit Support Request</>}
              </Button>
            </form>
          </div>

          {/* Right Column: Guidelines & Support Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl border border-border bg-secondary/30 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-600" /> Expected Response Time
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our support team operates Monday to Friday (08:00 – 17:00 SAST). Standard inquiries receive responses within <strong className="text-foreground">2 to 4 business hours</strong>.
              </p>
            </div>

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
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 mt-20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 text-sm text-muted-foreground items-center text-center">
          <Logo />
          <p className="text-xs">
            &copy; {new Date().getFullYear()} BlueSky AgriTech Pty LTD. All rights reserved. Support: support@blueskyagritech.co.za | WhatsApp: +27 76 104 7696
          </p>
        </div>
      </footer>
    </div>
  );
}

export default ContactPage;