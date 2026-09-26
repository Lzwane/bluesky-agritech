import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
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
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy (POPIA)</h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            BlueSky AgriTech Pty LTD complies fully with the South African Protection of Personal Information Act (Act 4 of 2013 - POPIA).
          </p>
          <p>
            We collect your full name, farm identity, province, contact information, and crop imagery solely to deliver tailored foliar diagnostics and agronomic insights. Your telemetry data is never sold to third parties.
          </p>
        </div>
      </main>
    </div>
  );
}

export default PrivacyPage;