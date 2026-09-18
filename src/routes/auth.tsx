import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Leaf,
  ShieldCheck,
  Sprout,
  ArrowRight,
  Sparkles,
  FileText,
  ShieldAlert,
  X,
  Lock,
  LayoutDashboard,
  AppWindow,
} from "lucide-react";

import logoImg from "@/assets/BlueSky_AgrITech_Logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In — AI Crop Detective by BlueSky AgriTech" },
      {
        name: "description",
        content:
          "Sign in to your AI Crop Detective account to diagnose crop pests, diseases, and nutrient deficiencies.",
      },
      { property: "og:title", content: "Sign In — AI Crop Detective" },
      {
        property: "og:description",
        content: "Access AI crop diagnostics, the disease library, marketplace, and farm advisor.",
      },
    ],
  }),
  component: AuthPage,
});

const CURRENT_AGREEMENT_VERSION = "v1.2-2026";
const OWNER_EMAIL = "mnisithokozani829@gmail.com";

const credentials = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
  displayName: z.string().trim().max(60).optional(),
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [showPortalChoice, setShowPortalChoice] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    if (!loading && session) {
      if (session.user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
        setShowPortalChoice(true);
      } else {
        navigate({ to: "/app", replace: true });
      }
    }
  }, [loading, session, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (mode === "signup" && !agreedToTerms) {
      setErrors({
        agreement:
          "You must read and accept the User Agreement and Legal Disclaimers before creating an account.",
      });
      toast.error("Please accept the User Agreement to proceed.");
      return;
    }

    const parsed = credentials.safeParse({ email, password, displayName });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setBusy(true);

    try {
      if (mode === "signup") {
        const cleanName = parsed.data.displayName || parsed.data.email.split("@")[0];
        const acceptanceTimestamp = new Date().toISOString();

        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            data: {
              display_name: cleanName,
              full_name: cleanName,
              agreement_version: CURRENT_AGREEMENT_VERSION,
              agreement_accepted_at: acceptanceTimestamp,
              agreement_accepted: true,
            },
          },
        });

        if (error) {
          const lowerMsg = error.message.toLowerCase();
          if (
            lowerMsg.includes("already registered") ||
            lowerMsg.includes("user already exists")
          ) {
            toast.error("This email is already registered. Please sign in instead.");
            setMode("signin");
            return;
          }
          throw error;
        }

        if (data.user && data.user.identities && data.user.identities.length === 0) {
          toast.error("This email is already registered. Please sign in instead.");
          setMode("signin");
          return;
        }

        if (data.user?.id) {
          await (supabase as any).from("profiles").upsert(
            {
              id: data.user.id,
              full_name: cleanName,
              updated_at: acceptanceTimestamp,
            },
            { onConflict: "id" }
          );
        }

        toast.success("Account created successfully! Welcome to BlueSky.");

        if (data.session) {
          if (parsed.data.email.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
            setShowPortalChoice(true);
          } else {
            navigate({ to: "/app", replace: true });
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;

        if (data.user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()) {
          setShowPortalChoice(true);
        } else {
          navigate({ to: "/app", replace: true });
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message || "Google authentication failed. Please verify Supabase provider settings.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-12 bg-[#0d1217] font-sans">
      {/* Left Info Column */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden p-8 xl:p-10 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-[#0b1015] border-r border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
              AgriTech Intelligence
            </span>
            <p className="text-[11px] text-slate-400">Precision Crop Health Ecosystem</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-sm py-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md">
            <Sprout className="h-3.5 w-3.5" /> Next-Gen AI Diagnostics
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white leading-tight">
            Diagnose crop issues with field-level precision.
          </h1>
          <p className="mt-3.5 text-sm text-slate-300 leading-relaxed">
            Real-time pathogen and deficiency diagnosis calibrated for South African soils across all 11 official languages.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 backdrop-blur-sm flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 mt-0.5">
                <Leaf className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs">Instant Visual Diagnostic</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated visual disease &amp; pest scan.</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 p-3.5 backdrop-blur-sm flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-xs">Targeted Remedies</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Organic recipes &amp; approved Act 36 treatments.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} BlueSky AgriTech</span>
          <span className="text-slate-500">Autonomous Agricultural Systems</span>
        </div>
      </div>

      {/* Right Blackboard Form Container */}
      <div className="relative lg:col-span-7 flex flex-col justify-center items-center px-6 py-10 sm:px-12 md:px-16 lg:px-12 xl:px-20 bg-[#11161d] overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg">
          {/* Centered Logo & Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative group mb-3">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative flex h-18 w-18 items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-700/80 p-2 shadow-2xl">
                <img
                  src={logoImg}
                  alt="BlueSky AgriTech"
                  className="h-14 w-14 object-contain filter drop-shadow"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mode === "signin" ? "Sign In to BlueSky" : "Create your Account"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {mode === "signin"
                ? "Enter your details to access the AI diagnostics portal"
                : "Join the BlueSky precision agriculture network"}
            </p>
          </div>

          {/* Blackboard Form Box */}
          <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <div className="relative">
                    <input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder=" "
                      maxLength={60}
                      autoComplete="name"
                      className="peer block w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 pt-6 pb-2 text-sm text-white placeholder-transparent transition-all focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <label
                      htmlFor="displayName"
                      className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-emerald-400"
                    >
                      What is your full name?
                    </label>
                  </div>
                  {errors["displayName"] && (
                    <p className="mt-1.5 text-xs font-medium text-rose-400">{errors["displayName"]}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    autoComplete="email"
                    required
                    className="peer block w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 pt-6 pb-2 text-sm text-white placeholder-transparent transition-all focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-emerald-400"
                  >
                    What is your email address?
                  </label>
                </div>
                {errors["email"] && (
                  <p className="mt-1.5 text-xs font-medium text-rose-400">{errors["email"]}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    required
                    className="peer block w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 pt-6 pb-2 text-sm text-white placeholder-transparent transition-all focus:border-emerald-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute left-4 top-2 text-[11px] font-medium text-slate-400 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-emerald-400"
                  >
                    {mode === "signup" ? "Create a secure password (8+ chars)" : "Enter your secret password"}
                  </label>
                </div>
                {errors["password"] && (
                  <p className="mt-1.5 text-xs font-medium text-rose-400">{errors["password"]}</p>
                )}
              </div>

              {/* User Agreement Acceptance Checkbox (Signup Only) */}
              {mode === "signup" && (
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (e.target.checked && errors["agreement"]) {
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy["agreement"];
                            return copy;
                          });
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 transition cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-slate-300 leading-snug">
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModalOpen(true);
                        }}
                        className="font-semibold text-emerald-400 hover:text-emerald-300 hover:underline cursor-pointer"
                      >
                        User Agreement ({CURRENT_AGREEMENT_VERSION})
                      </button>
                      , acknowledging that AI recommendations are decision-support aids and not a replacement for certified agronomic or Act 36 safety advice. View{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModalOpen(true);
                        }}
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        Privacy Policy
                      </button>{" "}
                      &amp;{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModalOpen(true);
                        }}
                        className="text-emerald-400 hover:underline cursor-pointer"
                      >
                        Cookie Policy
                      </button>
                      .
                    </span>
                  </label>
                  {errors["agreement"] && (
                    <p className="mt-1.5 text-xs font-medium text-rose-400">
                      {errors["agreement"]}
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={busy}
                className="cursor-pointer group relative mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-[0.99] disabled:opacity-60"
              >
                {busy ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>{mode === "signin" ? "Sign In" : "Accept & Create Account"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-800" />
              <span className="text-[11px] font-medium tracking-wider uppercase text-slate-500">
                Quick Access
              </span>
              <span className="h-px flex-1 bg-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={busy}
              className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/50 py-3 px-4 text-xs font-medium text-slate-200 transition hover:bg-slate-800/80 hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-700 disabled:opacity-60"
            >
              <GoogleIcon />
              Continue with Google Account
            </button>

            {/* Bottom Account Switcher */}
            <div className="mt-6 border-t border-slate-800/80 pt-4 text-center">
              {mode === "signin" ? (
                <p className="text-xs text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrors({});
                    }}
                    className="cursor-pointer font-semibold text-emerald-400 hover:text-emerald-300 hover:underline ml-1"
                  >
                    Create account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrors({});
                    }}
                    className="cursor-pointer font-semibold text-emerald-400 hover:text-emerald-300 hover:underline ml-1"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link to="/" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
              &larr; Return to main website
            </Link>
          </p>
        </div>
      </div>

      {/* Nice Portal Choice Modal for Owner */}
      {showPortalChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-[#161d26] p-7 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Owner Access Verified</h3>
              <p className="text-xs text-slate-400">
                Authenticated as <span className="text-emerald-400 font-mono">{session?.user.email}</span>. Select destination workspace:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <button
                type="button"
                onClick={() => navigate({ to: "/app/admin", replace: true })}
                className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/50 to-slate-900 hover:border-emerald-400 transition group text-left cursor-pointer"
              >
                <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                    Executive Admin Dashboard
                  </h4>
                  <p className="text-xs text-slate-400">
                    View app revenue, active users, subscription analytics, and audit logs.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/app", replace: true })}
                className="flex items-center gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-900/60 hover:border-slate-600 transition group text-left cursor-pointer"
              >
                <div className="h-11 w-11 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 border border-slate-700">
                  <AppWindow className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                    Standard Farmer Application
                  </h4>
                  <p className="text-xs text-slate-400">
                    Use foliar scanner &amp; AI agronomist with uncapped owner privileges.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal & User Agreement Modal for Auth */}
      {legalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-700 bg-[#161d26] p-6 sm:p-8 shadow-2xl text-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  User Agreement ({CURRENT_AGREEMENT_VERSION}) &amp; Legal Disclaimers
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLegalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-200 uppercase font-bold text-[11px]">
                  Limitation of Agronomic Liability
                </strong>
                The AI Crop Detective platform and Agronomist AI outputs provide automated, predictive insights intended strictly for decision-support purposes. They do not constitute certified professional agronomic warranties or replace on-site physical evaluations by licensed agricultural professionals.
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAgreedToTerms(true);
                  setLegalModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.2h6.6c-.1 1.1-.9 2.8-2.5 3.9l3.8 3c2.3-2.1 3.6-5.2 3.6-8.9z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-3c-1 .7-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5l-4 3.1C3.2 21.3 7.3 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3L1.2 6.6C.4 8.2 0 10 0 12s.4 3.8 1.2 5.4l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.7c2.3 0 3.8.9 4.7 1.8l3.4-3.3C18 1.2 15.2 0 12 0 7.3 0 3.2 2.7 1.2 6.6l4 3.1C6.1 6.8 8.8 4.7 12 4.7z"
      />
    </svg>
  );
}

export default AuthPage;