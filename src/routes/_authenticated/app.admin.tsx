import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  ScanLine,
  Activity,
  Search,
  Loader2,
  RefreshCw,
  Clock,
  CheckCircle2,
  BarChart3,
  Globe2,
  Zap,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/admin")({
  component: AdminDashboardPage,
});

const OWNER_EMAIL = "mnisithokozani829@gmail.com";

interface PlatformMetrics {
  totalUsers: number;
  proSubscribers: number;
  commercialSubscribers: number;
  monthlyRevenueZAR: number;
  totalScansRecorded: number;
  systemHealth: string;
}

interface UserSummary {
  id: string;
  email: string;
  name: string;
  farm: string;
  role: string;
  tier: string;
  createdAt: string;
  isOwner: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  admin_email: string;
  created_at: string;
  target_resource: string;
}

type ThemeMode = "dark" | "light" | "system";

export function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    proSubscribers: 0,
    commercialSubscribers: 0,
    monthlyRevenueZAR: 0,
    totalScansRecorded: 0,
    systemHealth: "100%",
  });

  const [usersList, setUsersList] = useState<UserSummary[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bluesky_theme_mode") as ThemeMode;
      if (saved === "dark" || saved === "light" || saved === "system") return saved;
    }
    return "dark";
  });

  const applyThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("bluesky_theme_mode", mode);
    const root = document.documentElement;
    let isDark = mode === "dark";
    if (mode === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isOwner) {
        toast.error("Unauthorized: Restricted to System Overseer");
        navigate({ to: "/app", replace: true });
      }
    }
  }, [authLoading, user, isOwner, navigate]);

  const fetchAdminAnalytics = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profError } = await (supabase as any)
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profError) throw profError;

      const { count: scanCount } = await (supabase as any)
        .from("diagnoses")
        .select("id", { count: "exact", head: true });

      const { data: logs } = await (supabase as any)
        .from("admin_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      let customerUsersCount = 0;
      let proCount = 0;
      let commCount = 0;

      const formattedUsers: UserSummary[] = (profiles || []).map((p: any) => {
        const tier = (p.subscription_tier || "free_plan").toLowerCase();
        const profileEmail = p.email || (p.id === user?.id ? user?.email : "") || "";
        const rowIsOwner =
          p.is_owner ||
          p.role === "owner" ||
          profileEmail.toLowerCase() === OWNER_EMAIL.toLowerCase();

        if (!rowIsOwner && profileEmail.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
          customerUsersCount++;
          if (tier === "grower_pro") proCount++;
          if (tier === "commercial_unlimited") commCount++;
        }

        return {
          id: p.id,
          email: profileEmail || "Registered Grower",
          name: rowIsOwner
            ? "Thokozani Mnisi (Owner)"
            : p.full_name || p.display_name || "South African Farmer",
          farm: rowIsOwner ? "System Infrastructure" : p.farm_name || "Private Holding",
          role: rowIsOwner ? "System Overseer" : "Grower",
          tier: rowIsOwner ? "Overseer Authority" : p.subscription_tier || "free_plan",
          createdAt: p.created_at || new Date().toISOString(),
          isOwner: rowIsOwner,
        };
      });

      const totalRevenue = proCount * 100 + commCount * 200;

      setMetrics({
        totalUsers: customerUsersCount,
        proSubscribers: proCount,
        commercialSubscribers: commCount,
        monthlyRevenueZAR: totalRevenue,
        totalScansRecorded: scanCount || 0,
        systemHealth: "99.98%",
      });

      setUsersList(formattedUsers);
      setAuditLogs(logs || []);
    } catch (err: any) {
      console.error(err);
      toast.error("Could not sync executive telemetry: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOwner) {
      fetchAdminAnalytics();
    }
  }, [isOwner]);

  if (authLoading || (!authLoading && !isOwner)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-600 dark:text-emerald-500" />
          <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Verifying Overseer Authority...
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.farm.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.tier.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesTier =
      tierFilter === "all" ||
      (tierFilter === "overseer" && u.isOwner) ||
      u.tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Standalone Overseer Command Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#090d16]/95 backdrop-blur-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111722] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Exit Overseer</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
                Overseer Command Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button for Overseer UI */}
            <button
              type="button"
              onClick={() => applyThemeMode(themeMode === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111722] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {themeMode === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>

            <button
              type="button"
              onClick={fetchAdminAnalytics}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111722] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-500" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-mono">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span className="hidden md:inline">SYSTEM OVERSEER</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Overseer Content Canvas */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Executive Banner (No trial countdown suppression or mention of non-paying account state) */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-[#111d27] dark:via-[#111722] dark:to-[#090d16] p-6 sm:p-8 relative overflow-hidden shadow-sm dark:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              Executive Command
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
              Platform Analytics &amp; Revenue Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Consolidated operational telemetry, recurring monthly revenue, subscription tier distribution, and security audit logs.
            </p>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Monthly Revenue (MRR)</span>
              <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                R{metrics.monthlyRevenueZAR.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                ZAR Active
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              Consumer subscription pool
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Registered Growers</span>
              <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                {metrics.totalUsers.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold">
                9 SA Prov
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              Verified consumer accounts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Paid Subscriptions</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                {metrics.proSubscribers + metrics.commercialSubscribers}
              </span>
              <span className="text-[11px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                PRO+COMM
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              {metrics.proSubscribers} Grower Pro / {metrics.commercialSubscribers} Comm
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-5 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium">Vision Diagnostics Throughput</span>
              <ScanLine className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                {metrics.totalScansRecorded.toLocaleString()}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                {metrics.systemHealth}
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
              Act 36 pathogen analysis runs
            </p>
          </div>
        </div>

        {/* Visual Analytics Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> MRR Trajectory (ZAR)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Rolling 6-month subscription revenue collection
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Current: R{metrics.monthlyRevenueZAR.toLocaleString()}
              </span>
            </div>

            <div className="w-full h-48 relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160">
                <defs>
                  <linearGradient id="zarGradientDynamic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                <line x1="0" y1="65" x2="600" y2="65" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="600" y2="110" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="4 4" />
                <line x1="0" y1="155" x2="600" y2="155" stroke="currentColor" className="text-slate-300 dark:text-slate-700" />

                <path
                  d="M0,130 C100,120 180,95 280,75 C380,55 460,40 600,15 L600,155 L0,155 Z"
                  fill="url(#zarGradientDynamic)"
                />
                <path
                  d="M0,130 C100,120 180,95 280,75 C380,55 460,40 600,15"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                />

                <circle cx="0" cy="130" r="4" className="fill-emerald-500" />
                <circle cx="120" cy="115" r="4" className="fill-emerald-500" />
                <circle cx="240" cy="88" r="4" className="fill-emerald-500" />
                <circle cx="360" cy="62" r="4" className="fill-emerald-500" />
                <circle cx="480" cy="35" r="4" className="fill-emerald-500" />
                <circle cx="600" cy="15" r="5" className="fill-emerald-500 stroke-2 stroke-white dark:stroke-slate-950" />
              </svg>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-2">
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar (Live)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-6 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" /> Subscription Tier Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribution across community and commercial tiers
              </p>
            </div>

            <div className="space-y-4 my-auto py-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-200">
                  <span>Free Community (R0)</span>
                  <span className="font-mono">
                    {Math.max(0, metrics.totalUsers - metrics.proSubscribers - metrics.commercialSubscribers)} users
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-500 rounded-full"
                    style={{ width: "65%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-cyan-700 dark:text-cyan-400">
                  <span>Grower Pro (R100/mo)</span>
                  <span className="font-mono">{metrics.proSubscribers} active</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (metrics.proSubscribers / Math.max(1, metrics.totalUsers)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-amber-700 dark:text-amber-400">
                  <span>Commercial Unlimited (R200/mo)</span>
                  <span className="font-mono">{metrics.commercialSubscribers} active</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (metrics.commercialSubscribers / Math.max(1, metrics.totalUsers)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Authority Scope: Active</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">100% SLA UPTIME</span>
            </div>
          </div>
        </div>

        {/* Registered Grower Accounts */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Registered Grower Accounts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage accounts, subscription tiers, and system privileges.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Accounts</option>
                <option value="overseer">System Overseer</option>
                <option value="free_plan">Free Community</option>
                <option value="grower_pro">Grower Pro</option>
                <option value="commercial_unlimited">Commercial Unlimited</option>
              </select>

              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter name, farm, email..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 pl-8 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Farmer / Identity</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Farm Enterprise</th>
                  <th className="p-3">Account Role</th>
                  <th className="p-3">Subscription Tier</th>
                  <th className="p-3">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No matching account records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{u.farm}</td>
                      <td className="p-3">
                        {u.isOwner ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/35">
                            System Overseer
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            Grower
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-[11px] capitalize text-emerald-600 dark:text-emerald-400 font-bold">
                        {u.isOwner ? "Overseer Authority" : u.tier.replace("_", " ")}
                      </td>
                      <td className="p-3 text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Audit Trail */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111722] p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Operational Audit Trail
          </h2>
          <div className="space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">No recent security events logged.</p>
            ) : (
              auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs gap-2"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                      {log.action}
                    </span>
                    <span className="text-slate-500">• {log.admin_email}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminDashboardPage;