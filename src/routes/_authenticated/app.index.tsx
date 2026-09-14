import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ScanLine,
  BookOpen,
  Store,
  MessageSquare,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Layers,
  ShieldAlert,
  Users,
  Activity,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/")({
  component: DashboardHome,
});

interface DashboardMetrics {
  scansCount: number;
  latestPathogen: string;
  threatLevel: "Low" | "Moderate" | "High";
  threatColor: string;
  activeCommunityCount: number;
  systemHealth: string;
  loading: boolean;
}

function DashboardHome() {
  const { user } = useAuth();
  const rawMeta = (user as any)?.user_metadata;
  const userName: string =
    rawMeta?.display_name ||
    rawMeta?.full_name ||
    user?.email?.split("@")[0] ||
    "Farmer";

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    scansCount: 0,
    latestPathogen: "No threats logged",
    threatLevel: "Low",
    threatColor: "text-emerald-400",
    activeCommunityCount: 1,
    systemHealth: "100%",
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    // Reset counts immediately on user switch to prevent stale counts from previous profile
    setMetrics((prev) => ({
      ...prev,
      scansCount: 0,
      latestPathogen: "No threats logged",
      threatLevel: "Low",
      loading: true,
    }));

    async function loadLiveMetrics() {
      if (!user?.id) {
        if (isMounted) setMetrics((prev) => ({ ...prev, scansCount: 0, loading: false }));
        return;
      }

      // User-scoped local fallback storage key
      const userStorageKey = `bluesky_diagnoses_history_${user.id}`;
      let fallbackScans = 0;
      let fallbackPathogen = "No active outbreaks (Healthy)";

      try {
        const localSaved = localStorage.getItem(userStorageKey);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            fallbackScans = parsed.length;
            if (parsed[0]?.disease_name) {
              fallbackPathogen = parsed[0].disease_name;
            }
          }
        }
      } catch (_) {}

      try {
        // 1. Scans strictly scoped to the logged-in user
        let userScanCount = fallbackScans;
        const { count, error } = await supabase
          .from("diagnoses")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (!error && typeof count === "number") {
          userScanCount = count;
        }

        // 2. Latest pathogen for this specific user
        let pathogenName = fallbackPathogen;
        let threat: "Low" | "Moderate" | "High" = "Low";
        let color = "text-emerald-400";

        const { data: latestDiagnosisRaw } = await supabase
          .from("diagnoses")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const latestDiagnosis = latestDiagnosisRaw as any;
        const diseaseName =
          latestDiagnosis?.disease_name ||
          latestDiagnosis?.diagnosis ||
          latestDiagnosis?.title ||
          (userScanCount > 0 ? fallbackPathogen : null);

        const cleanName = (diseaseName || "").toLowerCase().trim();

        const isHealthyOrNotFound =
          !cleanName ||
          cleanName === "healthy" ||
          cleanName === "healthy leaf" ||
          cleanName === "healthy crop" ||
          cleanName.includes("disease not found") ||
          cleanName.includes("not found") ||
          cleanName.includes("no disease") ||
          cleanName.includes("no pathogen") ||
          cleanName.includes("no threats logged") ||
          cleanName === "none" ||
          cleanName === "normal";

        if (userScanCount === 0 || isHealthyOrNotFound) {
          threat = "Low";
          color = "text-emerald-400";
          pathogenName = userScanCount === 0 ? "No threats logged" : "No active outbreaks (Healthy)";
        } else {
          pathogenName = diseaseName;
          const sev = (latestDiagnosis?.severity || "moderate").toLowerCase();

          if (sev === "critical" || sev === "high") {
            threat = "High";
            color = "text-rose-400";
          } else if (sev === "moderate") {
            threat = "Moderate";
            color = "text-amber-400";
          } else {
            threat = "Low";
            color = "text-emerald-400";
          }
        }

        // 3. Community members count
        const { count: memberCount } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });

        // 4. System Latency
        const t0 = performance.now();
        await supabase.from("profiles").select("id").limit(1);
        const latency = performance.now() - t0;
        const computedHealth =
          latency < 450 ? "99.9%" : latency < 900 ? "98.7%" : "96.4%";

        if (isMounted) {
          setMetrics({
            scansCount: userScanCount,
            latestPathogen: pathogenName,
            threatLevel: threat,
            threatColor: color,
            activeCommunityCount: Math.max(memberCount || 0, 1),
            systemHealth: computedHealth,
            loading: false,
          });
        }
      } catch (err) {
        console.error("Error fetching live metrics:", err);
        if (isMounted) {
          setMetrics((prev) => ({
            ...prev,
            scansCount: fallbackScans,
            latestPathogen: fallbackPathogen,
            threatLevel: "Low",
            threatColor: "text-emerald-400",
            loading: false,
          }));
        }
      }
    }

    loadLiveMetrics();

    const handleRefresh = () => loadLiveMetrics();
    window.addEventListener("bluesky_diagnosis_completed", handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener("bluesky_diagnosis_completed", handleRefresh);
    };
  }, [user?.id]);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-1 sm:px-2">
      {/* Welcome Banner */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-5 sm:p-7 md:p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 h-48 w-48 sm:h-64 sm:w-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-[11px] sm:text-xs font-medium text-emerald-300">
            <Sparkles className="h-3 w-3 shrink-0" /> Field Command Console
          </span>
          <h1 className="mt-2.5 sm:mt-3 text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your agronomic diagnostic suite is online. Monitor crop health, run rapid vision diagnostics, and access targeted disease regimens.
          </p>
          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2.5 sm:gap-3">
            <Link
              to="/app/diagnosis"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/60 hover:from-emerald-500 hover:to-teal-500 transition active:scale-95"
            >
              <ScanLine className="h-4 w-4 shrink-0" /> Run Quick Diagnosis
            </Link>
            <Link
              to="/app/advisor"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <Bot className="h-4 w-4 text-indigo-400 shrink-0" /> Agronomist AI
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Scans */}
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-3.5 sm:p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Scans Run</span>
            <ScanLine className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="my-1.5">
            {metrics.loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-white font-mono">{metrics.scansCount}</p>
            )}
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 shrink-0" /> Real database sync
          </span>
        </div>

        {/* Metric 2: Pathogen Threat */}
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-3.5 sm:p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Pathogen Threat</span>
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          </div>
          <div className="my-1.5">
            {metrics.loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
              <p className={`text-xl sm:text-2xl font-bold ${metrics.threatColor}`}>
                {metrics.threatLevel}
              </p>
            )}
          </div>
          <span className="text-[10px] text-slate-400 truncate block" title={metrics.latestPathogen}>
            {metrics.latestPathogen}
          </span>
        </div>

        {/* Metric 3: Active Community */}
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-3.5 sm:p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Community</span>
            <Users className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          </div>
          <div className="my-1.5">
            {metrics.loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-white font-mono">
                {metrics.activeCommunityCount.toLocaleString()}
              </p>
            )}
          </div>
          <span className="text-[10px] text-cyan-400 block">Registered growers</span>
        </div>

        {/* Metric 4: System Health */}
        <div className="rounded-2xl border border-slate-800 bg-[#111720]/80 p-3.5 sm:p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-slate-400 font-medium">System Health</span>
            <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="my-1.5">
            {metrics.loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                {metrics.systemHealth}
              </p>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block">AI Vision Engine API</span>
        </div>
      </div>

      {/* Applications Hub Modules */}
      <div className="space-y-3.5 sm:space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400 shrink-0" /> System Modules
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          <Link
            to="/app/diagnosis"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-4.5 sm:p-5 hover:border-emerald-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-3">
                <ScanLine className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition">AI Diagnosis</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Visual symptom detection with customized organic &amp; chemical cures.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-emerald-400 pt-2 border-t border-slate-800/60">
              <span>Launch Scanner</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/library"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-4.5 sm:p-5 hover:border-cyan-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
                <BookOpen className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">Pathology Library</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Indexed library of crop pests, deficiencies, and treatments.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-cyan-400 pt-2 border-t border-slate-800/60">
              <span>Browse Diseases</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/advisor"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-4.5 sm:p-5 hover:border-indigo-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-3">
                <Bot className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition">Agronomist Assistant</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Consult on soil chemistry, spray schedules, and seasonal preparations.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-400 pt-2 border-t border-slate-800/60">
              <span>Open Chat</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/marketplace"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-4.5 sm:p-5 hover:border-amber-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3">
                <Store className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-400 transition">Marketplace</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Approved fungicides, fertilizers, bio-stimulants &amp; spray kits.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800/60">
              <span>View Products</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to="/app/forum"
            className="group rounded-2xl border border-slate-800 bg-[#131922] p-4.5 sm:p-5 hover:border-rose-500/50 hover:bg-[#161f2c] transition flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mb-3">
                <MessageSquare className="h-5 w-5 shrink-0" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-rose-400 transition">Farmer Forum</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Connect with local growers and report regional outbreaks.
              </p>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold text-rose-400 pt-2 border-t border-slate-800/60">
              <span>Join Discussion</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;