import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-6">
          <Logo />
          <Button asChild size="sm">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-16 space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">User Agreement &amp; Terms of Service</h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider">Important Agronomic Limitation</h4>
            <p className="mt-1 text-xs leading-relaxed">
              AI Crop Detective outputs are provided exclusively as decision-support information and do not constitute formal agronomic warranties. BlueSky AgriTech Pty LTD accepts no financial liability for crop yield shortfalls. All treatments must comply with Act 36 of 1947.
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-bold text-foreground text-base">1. Acceptance of Terms</h2>
          <p>By accessing or using the BlueSky AgriTech platform, you agree to adhere to these terms.</p>

          <h2 className="font-bold text-foreground text-base">2. User Accounts &amp; Conduct</h2>
          <p>Users are responsible for maintaining account confidentiality and ensuring lawful marketplace and forum activity.</p>
        </div>
      </main>
    </div>
  );
}

export default TermsPage;