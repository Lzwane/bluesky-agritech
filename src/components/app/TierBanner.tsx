import React from "react";
import { Link } from "@tanstack/react-router";
import { Zap, AlertTriangle } from "lucide-react";
import { useTierAccess } from "@/hooks/useTierAccess";

export function TierBanner({ dailyAdvisorRemaining = 3 }: { dailyAdvisorRemaining?: number }) {
  const { currentTier, isOwner, trialExpired, elapsedDays } = useTierAccess();

  if (isOwner || currentTier === "commercial_unlimited") return null;

  return (
    <div className={`mb-6 rounded-2xl border px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
      trialExpired 
        ? "border-amber-500/50 bg-amber-500/10 text-amber-200" 
        : "border-slate-800 bg-[#111722] text-slate-300"
    }`}>
      <div className="flex items-center gap-2.5">
        {trialExpired ? (
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
        ) : (
          <Zap className="h-4 w-4 text-emerald-400 shrink-0" />
        )}
        <div>
          <span className="font-bold uppercase tracking-wider text-[11px] text-white">
            {trialExpired ? "Free Community Tier (Trial Concluded - Day 30+)" : `Free Trial Active (Day ${elapsedDays}/30)`}
          </span>
          <span className="ml-2 text-slate-400">
            • Daily Advisor Prompts Left: <strong className="text-white font-mono">{dailyAdvisorRemaining}/3</strong>
          </span>
        </div>
      </div>
      <Link
        to="/app/settings"
        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-[11px] shadow-sm hover:from-emerald-500 hover:to-teal-500 transition"
      >
        Upgrade to Unlock All
      </Link>
    </div>
  );
}