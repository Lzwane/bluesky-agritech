import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Moon,
  User,
  Save,
  Phone,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Building2,
  Tractor,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

interface SubscriptionTier {
  id: "free_trial" | "smallholder_pro" | "commercial_estate";
  name: string;
  priceZAR: number;
  cadence: string;
  badge?: string;
  description: string;
  features: string[];
}

const TIERS: SubscriptionTier[] = [
  {
    id: "free_trial",
    name: "Starter Trial",
    priceZAR: 0,
    cadence: "30 Days Free",
    description: "Standard access to evaluate foliar diagnostics and community exchange.",
    features: [
      "10 AI foliar scans / month",
      "Full Pathology & Pest Codex",
      "Community Forum discussions",
      "Standard organic & chemical recipes",
    ],
  },
  {
    id: "smallholder_pro",
    name: "Smallholder Pro",
    priceZAR: 199,
    cadence: "/ month",
    badge: "Most Popular",
    description: "Ideal for growing commercial parcels requiring unlimited rapid diagnosis.",
    features: [
      "Unlimited AI foliar diagnosis",
      "Priority Agronomist Chatbot",
      "Offline field treatment caching",
      "Custom spray timing & PHI alerts",
      "Export phytosanitary compliance logs",
    ],
  },
  {
    id: "commercial_estate",
    name: "Commercial Estate",
    priceZAR: 599,
    cadence: "/ month",
    badge: "Enterprise",
    description: "Engineered for agronomists, multi-pivot circles, and cooperative estates.",
    features: [
      "Everything in Smallholder Pro",
      "Multi-field telemetry & bulk logs",
      "Direct agronomist priority line",
      "Team collaboration (up to 5 scouts)",
      "Satellite canopy stress overlays",
    ],
  },
];

const SA_PROVINCES = [
  "Gauteng",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Western Cape",
  "Northern Cape",
];

export function SettingsPage() {
  const { user } = useAuth();
  const rawMeta = (user as any)?.user_metadata;

  const initialName =
    rawMeta?.full_name || rawMeta?.display_name || user?.email?.split("@")[0] || "";
  const initialFarmName = rawMeta?.farm_name || rawMeta?.business_name || "";
  const initialPhone = rawMeta?.phone_number || rawMeta?.phone || "";
  const initialLang = rawMeta?.preferred_language || "en";
  const initialProvince = rawMeta?.primary_province || "Gauteng";
  const initialPlan = rawMeta?.subscription_tier || "free_trial";

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [displayName, setDisplayName] = useState(initialName);
  const [farmName, setFarmName] = useState(initialFarmName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [language, setLanguage] = useState(initialLang);
  const [primaryProvince, setPrimaryProvince] = useState(initialProvince);
  const [currentPlan, setCurrentPlan] = useState<string>(initialPlan);
  const [savingProfile, setSavingProfile] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (rawMeta) {
      if (rawMeta.full_name || rawMeta.display_name) {
        setDisplayName(rawMeta.full_name || rawMeta.display_name);
      }
      if (rawMeta.farm_name || rawMeta.business_name) {
        setFarmName(rawMeta.farm_name || rawMeta.business_name);
      }
      if (rawMeta.phone_number || rawMeta.phone) {
        setPhoneNumber(rawMeta.phone_number || rawMeta.phone);
      }
      if (rawMeta.preferred_language) setLanguage(rawMeta.preferred_language);
      if (rawMeta.primary_province) setPrimaryProvince(rawMeta.primary_province);
      if (rawMeta.subscription_tier) setCurrentPlan(rawMeta.subscription_tier);
    }
  }, [rawMeta]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Trial progression: Day 1 on creation, Day 7 for existing users, up to Day 30
  const trialCalculation = useMemo(() => {
    const startedAtStr =
      rawMeta?.trial_started_at || user?.created_at || new Date().toISOString();
    const startTimestamp = new Date(startedAtStr).getTime();
    const now = Date.now();

    const elapsedMs = Math.max(0, now - startTimestamp);
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

    // Day 1 starts on day 0 of elapsed time; max is 30
    const currentDay = Math.min(30, Math.max(1, elapsedDays + 1));
    const daysLeft = Math.max(0, 30 - currentDay);
    const progressPercent = Math.min(100, Math.round((currentDay / 30) * 100));

    const expirationTimestamp = startTimestamp + 30 * 24 * 60 * 60 * 1000;
    const formattedExpiry = new Date(expirationTimestamp).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      currentDay,
      daysLeft,
      progressPercent,
      isExpired: currentDay >= 30,
      formattedExpiry,
    };
  }, [rawMeta?.trial_started_at, user?.created_at]);

  const toggleTheme = (mode: "dark" | "light") => {
    setTheme(mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("bluesky_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("bluesky_theme", "light");
    }
    toast.success(`Switched to ${mode === "dark" ? "Blackboard Dark" : "Daylight"} mode`);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const updatedMeta = {
        full_name: displayName.trim(),
        display_name: displayName.trim(),
        farm_name: farmName.trim(),
        business_name: farmName.trim(),
        phone_number: phoneNumber.trim(),
        preferred_language: language,
        primary_province: primaryProvince,
      };

      const { error: authError } = await supabase.auth.updateUser({
        data: updatedMeta,
      });

      if (authError) throw authError;

      if (user?.id) {
        await (supabase as any).from("profiles").upsert(
          {
            id: user.id,
            full_name: displayName.trim(),
            farm_name: farmName.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      toast.success("Profile and farm details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpgradePlan = (tier: SubscriptionTier) => {
    if (tier.id === "free_trial") {
      toast.info("You are currently enjoying the 30-day trial tier.");
      return;
    }

    const paystackKey =
      import.meta.env["VITE_PAYSTACK_PUBLIC_KEY"] || "pk_test_placeholder_key";

    if (!user?.email) {
      toast.error("User email not found. Please log in again.");
      return;
    }

    setProcessingPayment(tier.id);

    try {
      if (typeof window.PaystackPop === "undefined") {
        throw new Error("Paystack SDK is loading. Please check your internet connection.");
      }

      const paystack = new window.PaystackPop();

      paystack.newTransaction({
        key: paystackKey,
        email: user.email,
        amount: tier.priceZAR * 100,
        currency: "ZAR",
        metadata: {
          custom_fields: [
            {
              display_name: "Farmer Name",
              variable_name: "farmer_name",
              value: displayName || user.email,
            },
            {
              display_name: "Farm / Business Name",
              variable_name: "farm_name",
              value: farmName || "Not provided",
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: phoneNumber || "Not provided",
            },
            {
              display_name: "Selected Plan",
              variable_name: "plan_tier",
              value: tier.name,
            },
          ],
        },
        onSuccess: async (transaction: { reference: string }) => {
          toast.success(`Payment verified! Welcome to ${tier.name}`);
          setCurrentPlan(tier.id);

          await supabase.auth.updateUser({
            data: {
              subscription_tier: tier.id,
              subscribed_at: new Date().toISOString(),
              payment_reference: transaction.reference,
            },
          });

          setProcessingPayment(null);
        },
        onCancel: () => {
          setProcessingPayment(null);
          toast.info("Payment cancelled.");
        },
        onError: (err: any) => {
          setProcessingPayment(null);
          toast.error(err?.message || "Transaction failed. Please try again.");
        },
      });
    } catch (err: any) {
      setProcessingPayment(null);
      toast.error(err.message || "Could not launch Paystack checkout.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 font-sans">
      {/* Page Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> Account Center
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Settings &amp; Subscription
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          Manage your farm identity, contact credentials, visual appearance, and active subscription plan.
        </p>
      </div>

      {/* 30-Day Free Trial Tracker */}
      <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-[#131d27] via-[#111922] to-[#0d131a] p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Clock className="h-3.5 w-3.5" />
                {currentPlan === "free_trial"
                  ? `Day ${trialCalculation.currentDay} of 30`
                  : "Active Paid Plan"}
              </span>
              <span className="text-xs text-slate-400">
                {currentPlan === "free_trial"
                  ? `${trialCalculation.daysLeft} days remaining • Ends ${trialCalculation.formattedExpiry}`
                  : `Renews on ${trialCalculation.formattedExpiry}`}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white mt-2">
              {currentPlan === "free_trial"
                ? `Free Tier Active: Day ${trialCalculation.currentDay}/30`
                : `Active Tier: ${TIERS.find((t) => t.id === currentPlan)?.name || "Pro Member"}`}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              {currentPlan === "free_trial"
                ? "Full diagnostic suites and community exchange active. Upgrade anytime to unlock unlimited field vision analysis and automated telemetry."
                : "Your parcel is covered with high-throughput foliar vision scans and priority agronomist consultation."}
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <span className="text-sm font-mono font-bold text-emerald-400">
              {trialCalculation.currentDay} / 30 Days
            </span>
            <div className="w-40 sm:w-48 h-2.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${trialCalculation.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-400" /> Subscription Tiers
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Secure checkout in South African Rand (ZAR) via card, Instant EFT, or SnapScan using Paystack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => {
            const isCurrent = currentPlan === tier.id;
            const isProcessing = processingPayment === tier.id;

            return (
              <div
                key={tier.id}
                className={cn(
                  "rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all relative",
                  isCurrent
                    ? "border-emerald-500/80 bg-[#16212d] shadow-xl shadow-emerald-950/40"
                    : "border-slate-800 bg-[#131922] hover:border-slate-700"
                )}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md">
                    {tier.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{tier.name}</h3>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-white">
                      R{tier.priceZAR}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {tier.cadence}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="my-4 border-t border-slate-800/80" />

                  <ul className="space-y-2 text-xs text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <button
                    type="button"
                    disabled={isCurrent || Boolean(processingPayment)}
                    onClick={() => handleUpgradePlan(tier)}
                    className={cn(
                      "w-full py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50",
                      isCurrent
                        ? "bg-slate-800 text-slate-400 cursor-default"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/50"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Opening Paystack...</span>
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" /> Upgrade via Paystack
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Info Form */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-400" /> Farmer Account &amp; Farm Identity
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your registered farm enterprise name, grower alias, and regional settings.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grower Alias */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name / Grower Alias
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sipho Khumalo"
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Farm / Business Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Tractor className="h-3.5 w-3.5 text-emerald-400" /> Farm or Business Name
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. BlueSky AgriTech Farms / Khumalo Family Estate"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-400" /> Phone Number (SMS / Outbreak Alerts)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +27 82 123 4567"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Operating Province */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-400" /> Operating Province
              </label>
              <select
                value={primaryProvince}
                onChange={(e) => setPrimaryProvince(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition cursor-pointer font-medium"
              >
                {SA_PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Locked Email */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-500 font-normal">Primary Login (Locked)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed"
                />
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Primary Agronomic &amp; Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none transition cursor-pointer font-medium"
              >
                <option value="en">English (Official Ag Standard)</option>
                <option value="zu">isiZulu</option>
                <option value="xh">isiXhosa</option>
                <option value="af">Afrikaans</option>
                <option value="nso">Sepedi (Northern Sotho)</option>
                <option value="st">Sesotho</option>
                <option value="ts">Xitsonga</option>
                <option value="tn">Setswana</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-5 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 shadow-md shadow-emerald-950/40"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{savingProfile ? "Saving Profile..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interface Theme Toggle */}
      <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          {theme === "dark" ? (
            <Moon className="h-4 w-4 text-emerald-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
          Interface Theme
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Select between Blackboard Dark Mode (recommended for field screens) or Daylight Mode.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => toggleTheme("dark")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer",
              theme === "dark"
                ? "border-emerald-500 bg-slate-900/90 text-white shadow-lg shadow-emerald-950/40"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
            )}
          >
            <Moon className="h-6 w-6 text-emerald-400 mb-2" />
            <span className="text-xs font-bold">Blackboard Dark</span>
            <span className="text-[10px] text-slate-400 mt-0.5">High contrast, low battery drain</span>
          </button>

          <button
            type="button"
            onClick={() => toggleTheme("light")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer",
              theme === "light"
                ? "border-emerald-500 bg-slate-800/90 text-white shadow-lg"
                : "border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700"
            )}
          >
            <Sun className="h-6 w-6 text-amber-400 mb-2" />
            <span className="text-xs font-bold">Daylight Mode</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Direct outdoor sunlight mode</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;