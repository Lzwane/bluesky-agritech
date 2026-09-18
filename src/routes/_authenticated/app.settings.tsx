import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Sun,
  Moon,
  Laptop,
  User,
  Save,
  Phone,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  MapPin,
  Clock,
  Tractor,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/languages";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export const Route = createFileRoute("/_authenticated/app/settings")({
  component: SettingsPage,
});

type ThemeSetting = "dark" | "light" | "system";

export const SA_LANGUAGES: { code: LanguageCode; name: string; nativeName: string }[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "af", name: "Afrikaans", nativeName: "Afrikaans" },
  { code: "nr", name: "isiNdebele", nativeName: "isiNdebele" },
  { code: "xh", name: "isiXhosa", nativeName: "isiXhosa" },
  { code: "zu", name: "isiZulu", nativeName: "isiZulu" },
  { code: "nso", name: "Sepedi", nativeName: "Sepedi" },
  { code: "st", name: "Sesotho", nativeName: "Sesotho" },
  { code: "tn", name: "Setswana", nativeName: "Setswana" },
  { code: "ss", name: "siSwati", nativeName: "siSwati" },
  { code: "ve", name: "Tshivenda", nativeName: "Tshivenḓa" },
  { code: "ts", name: "Xitsonga", nativeName: "Xitsonga" },
];

interface TierFeature {
  title: string;
  included: boolean;
}

interface SubscriptionTier {
  id: "free_plan" | "grower_pro" | "commercial_unlimited";
  name: string;
  priceZAR: number;
  cadence: string;
  badge?: string;
  description: string;
  features: TierFeature[];
}

const TIERS: SubscriptionTier[] = [
  {
    id: "free_plan",
    name: "Free Community",
    priceZAR: 0,
    cadence: "Free Forever",
    description: "Standard access to evaluate foliar diagnostics and community exchange.",
    features: [
      { title: "0 AI foliar scans / month", included: false },
      { title: "No new library research queries", included: false },
      { title: "Unlimited Marketplace access", included: true },
      { title: "Unlimited Community Forum posts", included: true },
      { title: "Full Dashboard telemetry view", included: true },
    ],
  },
  {
    id: "grower_pro",
    name: "Grower Pro",
    priceZAR: 100,
    cadence: "/ month",
    badge: "Most Popular",
    description: "Ideal for active smallholders requiring regular monthly pest and symptom diagnostics.",
    features: [
      { title: "25 AI foliar scans / month", included: true },
      { title: "25 custom library research queries", included: true },
      { title: "Unlimited Marketplace buy & sell", included: true },
      { title: "Unlimited Community Forum posts", included: true },
      { title: "Unlimited Agronomist AI chat", included: true },
      { title: "Full interactive Dashboard", included: true },
    ],
  },
  {
    id: "commercial_unlimited",
    name: "Commercial Unlimited",
    priceZAR: 200,
    cadence: "/ month",
    badge: "Full Power",
    description: "Uncapped access built for intensive farming operations, cooperatives, and estates.",
    features: [
      { title: "Unlimited AI foliar scans", included: true },
      { title: "Unlimited library research queries", included: true },
      { title: "Unlimited Marketplace buy & sell", included: true },
      { title: "Unlimited Community Forum posts", included: true },
      { title: "Unlimited Agronomist AI chat", included: true },
      { title: "Full real-time Dashboard telemetry", included: true },
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
  const { language, setLanguage, t } = useLanguage();
  const rawMeta = (user as any)?.user_metadata;

  const initialName =
    rawMeta?.full_name || rawMeta?.display_name || user?.email?.split("@")[0] || "";
  const initialFarmName = rawMeta?.farm_name || rawMeta?.business_name || "";
  const initialPhone = rawMeta?.phone_number || rawMeta?.phone || "";
  const initialProvince = rawMeta?.primary_province || "Gauteng";
  const initialPlan = rawMeta?.subscription_tier || "free_trial";

  const [themeMode, setThemeMode] = useState<ThemeSetting>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluesky_theme_mode") as ThemeSetting;
      if (saved === "dark" || saved === "light" || saved === "system") return saved;
      return document.documentElement.classList.contains("dark") ? "dark" : "dark";
    }
    return "dark";
  });

  const [displayName, setDisplayName] = useState(initialName);
  const [farmName, setFarmName] = useState(initialFarmName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
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
      if (rawMeta.preferred_language) {
        setLanguage(rawMeta.preferred_language as LanguageCode);
      }
      if (rawMeta.primary_province) setPrimaryProvince(rawMeta.primary_province);
      if (rawMeta.subscription_tier) setCurrentPlan(rawMeta.subscription_tier);
      if (rawMeta.theme_preference) {
        applyThemeSetting(rawMeta.theme_preference as ThemeSetting, false);
      }
    }
  }, [rawMeta]);

  const applyThemeSetting = (mode: ThemeSetting, saveToAuth: boolean = true) => {
    setThemeMode(mode);
    localStorage.setItem("bluesky_theme_mode", mode);

    const root = document.documentElement;
    let isDark = false;
    if (mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = mode === "dark";
    }

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (saveToAuth && user) {
      supabase.auth
        .updateUser({
          data: { theme_preference: mode },
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themeMode === "system") {
        applyThemeSetting("system", false);
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themeMode]);

  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v2/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const trialCalculation = useMemo(() => {
    const startedAtStr =
      rawMeta?.trial_started_at || user?.created_at || new Date().toISOString();
    const startTimestamp = new Date(startedAtStr).getTime();
    const now = Date.now();

    const elapsedMs = Math.max(0, now - startTimestamp);
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

    const currentDay = Math.min(30, Math.max(1, elapsedDays + 1));
    const daysLeft = Math.max(0, 30 - currentDay);
    const progressPercent = Math.min(100, Math.round((currentDay / 30) * 100));

    const expirationTimestamp = startTimestamp + 30 * 24 * 60 * 60 * 1000;
    const formattedExpiry = new Date(expirationTimestamp).toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const isTrialCompleted = currentDay >= 30;

    return {
      currentDay,
      daysLeft,
      progressPercent,
      isTrialCompleted,
      formattedExpiry,
    };
  }, [rawMeta?.trial_started_at, user?.created_at]);

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
        theme_preference: themeMode,
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
            preferred_language: language,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      }

      toast.success(t("save_button") + ": Profile & Farm saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpgradePlan = (tier: SubscriptionTier) => {
    if (tier.id === "free_plan") {
      toast.info(
        trialCalculation.isTrialCompleted
          ? "You are currently on the Post-Trial Free Tier."
          : `Your active trial has ${trialCalculation.daysLeft} days remaining.`
      );
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
        throw new Error("Paystack SDK is loading. Please check your connection.");
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
              display_name: "Farm / Enterprise",
              variable_name: "farm_name",
              value: farmName || "Not provided",
            },
            {
              display_name: "Language",
              variable_name: "language",
              value: language,
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
        <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" /> {t("account_center")}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {t("settings_title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          {t("settings_subtitle")}
        </p>
      </div>

      {/* 30-Day Free Trial Tracker */}
      <div className="rounded-3xl border border-emerald-500/40 bg-white dark:bg-gradient-to-br dark:from-[#131d27] dark:via-[#111922] dark:to-[#0d131a] p-6 sm:p-7 shadow-sm dark:shadow-2xl relative overflow-hidden transition-colors">
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                <Clock className="h-3.5 w-3.5" />
                {currentPlan === "free_trial" || currentPlan === "free_plan"
                  ? trialCalculation.isTrialCompleted
                    ? "30-Day Trial Concluded"
                    : `Day ${trialCalculation.currentDay} of 30`
                  : t("active_plan")}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {trialCalculation.isTrialCompleted
                  ? "Free Tier Active (0 scans / month)"
                  : `${trialCalculation.daysLeft} ${t("days_left")} • Ends ${trialCalculation.formattedExpiry}`}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
              {currentPlan === "grower_pro"
                ? "Active Plan: Grower Pro (R100/mo)"
                : currentPlan === "commercial_unlimited"
                ? "Active Plan: Commercial Unlimited (R200/mo)"
                : trialCalculation.isTrialCompleted
                ? "Post-Trial Free Tier"
                : `30-Day Full Access Trial: Day ${trialCalculation.currentDay}/30`}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              {trialCalculation.isTrialCompleted && currentPlan === "free_plan"
                ? "Your 30-day trial has concluded. You still enjoy unlimited forum discussions, marketplace access, and dashboard telemetry."
                : "Enjoy all foliar vision diagnostics, pathology research, marketplace trade, and community tools throughout your 30-day evaluation."}
            </p>
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {trialCalculation.currentDay} / 30 Days
            </span>
            <div className="w-40 sm:w-48 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden border border-slate-300 dark:border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${trialCalculation.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Plans: R0, R100, R200 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Subscription Plans
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Transparent pricing in South African Rand (ZAR). Pay securely via Paystack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => {
            const isCurrent =
              currentPlan === tier.id ||
              (tier.id === "free_plan" &&
                (currentPlan === "free_trial" || !currentPlan));
            const isProcessing = processingPayment === tier.id;

            return (
              <div
                key={tier.id}
                className={cn(
                  "rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all relative",
                  isCurrent
                    ? "border-emerald-500 bg-white dark:bg-[#16212d] shadow-md dark:shadow-emerald-950/40 ring-1 ring-emerald-500"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-[#131922] hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                )}
              >
                {tier.badge && (
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md">
                    {tier.badge}
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{tier.name}</h3>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="h-3 w-3" /> {t("active_plan")}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      R{tier.priceZAR}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {tier.cadence}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {tier.description}
                  </p>

                  <div className="my-4 border-t border-slate-100 dark:border-slate-800/80" />

                  <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                    {tier.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feat.included ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
                        )}
                        <span
                          className={cn(
                            "text-[11px] leading-snug",
                            !feat.included && "text-slate-400 dark:text-slate-500 line-through"
                          )}
                        >
                          {feat.title}
                        </span>
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
                        ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-default"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-md"
                    )}
                  >
                    {isProcessing ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Opening Paystack...</span>
                      </>
                    ) : isCurrent ? (
                      t("active_plan")
                    ) : (
                      <>
                        <Zap className="h-3.5 w-3.5" /> {t("upgrade_btn")} {tier.name}
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
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#161d26]/90 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6 transition-colors">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> {t("farm_profile")}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {t("farm_profile_desc")}
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                {t("full_name")}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sipho Khumalo"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition shadow-inner"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Tractor className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> {t("farm_name")}
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. BlueSky AgriTech Farms / Khumalo Family Estate"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {t("phone_number")}
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +27 82 123 4567"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none transition shadow-inner"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" /> {t("province")}
              </label>
              <select
                value={primaryProvince}
                onChange={(e) => setPrimaryProvince(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition cursor-pointer font-medium"
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
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Primary Login (Locked)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 px-3.5 py-2.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
                <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {t("language_select")}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition cursor-pointer font-medium"
              >
                {SA_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2.5 px-5 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 shadow-md"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{savingProfile ? t("saving") : t("save_button")}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interface Theme Switcher (Dark, Light, System Default) */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#161d26]/90 p-6 sm:p-8 shadow-sm dark:shadow-xl transition-colors">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          {themeMode === "dark" ? (
            <Moon className="h-4 w-4 text-emerald-500" />
          ) : themeMode === "light" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Laptop className="h-4 w-4 text-teal-500" />
          )}
          {t("theme_title")}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          {t("theme_subtitle")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Blackboard Dark */}
          <button
            type="button"
            onClick={() => applyThemeSetting("dark")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer text-center",
              themeMode === "dark"
                ? "border-emerald-500 bg-slate-900 text-white shadow-md ring-1 ring-emerald-500"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <Moon className="h-6 w-6 text-emerald-400 mb-2" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t("dark_mode")}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t("dark_desc")}
            </span>
          </button>

          {/* Daylight Light Mode */}
          <button
            type="button"
            onClick={() => applyThemeSetting("light")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer text-center",
              themeMode === "light"
                ? "border-amber-500 bg-amber-50/50 text-slate-900 shadow-md ring-1 ring-amber-500"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <Sun className="h-6 w-6 text-amber-500 mb-2" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t("light_mode")}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t("light_desc")}
            </span>
          </button>

          {/* System Default */}
          <button
            type="button"
            onClick={() => applyThemeSetting("system")}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-2xl border transition cursor-pointer text-center",
              themeMode === "system"
                ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 text-slate-900 dark:text-white shadow-md ring-1 ring-teal-500"
                : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            <Laptop className="h-6 w-6 text-teal-500 mb-2" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">{t("system_mode")}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {t("system_desc")}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;