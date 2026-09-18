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
  const currentTier = isOwner ? "commercial_unlimited" : (rawMeta?.subscription_tier || "free_plan");

  const startedAtStr = rawMeta?.trial_started_at || user?.created_at || new Date().toISOString();
  const elapsedDays = Math.floor(Math.max(0, Date.now() - new Date(startedAtStr).getTime()) / (1000 * 60 * 60 * 24));
  const trialExpired = !isOwner && currentTier === "free_plan" && elapsedDays >= 30;

  const checkLimit = async (feature: "diagnosis" | "ai_research" | "marketplace_listing" | "forum_post" | "advisor_daily") => {
    if (isOwner) return { allowed: true, unlimited: true };

    const { data, error } = await (supabase as any).rpc("consume_tier_quota", {
      p_user_id: user?.id,
      p_feature: feature,
    });

    if (error) {
      console.error("Quota check error:", error);
      return { allowed: true, unlimited: false };
    }

    const result = data || { allowed: false, unlimited: false };
    if (!result.allowed) {
      if (feature === "diagnosis") toast.error(t("scan_limit_reached"));
      else if (feature === "ai_research") toast.error(t("research_limit_reached"));
      else if (feature === "marketplace_listing") toast.error(t("listing_limit_reached"));
      else if (feature === "forum_post") toast.error(t("forum_post_limit_reached"));
      else if (feature === "advisor_daily") toast.error(t("advisor_limit_reached"));
    }

    return result;
  };

  return {
    currentTier,
    isOwner,
    trialExpired,
    elapsedDays,
    canAccessDiagnosis: !trialExpired && (isOwner || currentTier === "grower_pro" || currentTier === "commercial_unlimited"),
    canUseAiResearch: !trialExpired && (isOwner || currentTier === "grower_pro" || currentTier === "commercial_unlimited"),
    canListMarketplace: !trialExpired && (isOwner || currentTier === "grower_pro" || currentTier === "commercial_unlimited"),
    canPostForum: !trialExpired && (isOwner || currentTier === "grower_pro" || currentTier === "commercial_unlimited"),
    canCommentOrLikeForum: true,
    checkLimit,
  };
}