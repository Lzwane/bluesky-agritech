import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
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
        <h1 className="text-3xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="text-xs text-muted-foreground">Last updated: September 2026</p>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            BlueSky AgriTech utilizes essential browser cookies and local storage tokens (`bluesky_preferred_lang`, authentication sessions) to preserve your user preferences and offline diagnostic history.
          </p>
          <p>
            You can disable cookies via your browser settings, though certain persistent features may be limited.
          </p>
        </div>
      </main>
    </div>
  );
}

export default CookiesPage;