import { useAuth } from "./useAuth";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const OWNER_EMAIL = "mnisithokozani829@gmail.com";

export function useTierAccess() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  const rawMeta = (user as any)?.user_metadata;
  
  // Treat everyone as commercial unlimited or active during trial
  const currentTier = isOwner ? "commercial_unlimited" : (rawMeta?.subscription_tier || "commercial_unlimited");

  const startedAtStr = rawMeta?.trial_started_at || user?.created_at || new Date().toISOString();
  const elapsedDays = Math.floor(Math.max(0, Date.now() - new Date(startedAtStr).getTime()) / (1000 * 60 * 60 * 24));
  
  // Force trialExpired to false so your 30-day window remains fully active and unblocked
  const trialExpired = false;

  const checkLimit = async (_feature: "diagnosis" | "ai_research" | "marketplace_listing" | "forum_post" | "advisor_daily") => {
    // Always allow and treat as unlimited during trial/development
    return { allowed: true, unlimited: true };
  };

  return {
    currentTier,
    isOwner,
    trialExpired,
    elapsedDays,
    canAccessDiagnosis: true,
    canUseAiResearch: true,
    canListMarketplace: true,
    canPostForum: true,
    canCommentOrLikeForum: true,
    checkLimit,
  };
}