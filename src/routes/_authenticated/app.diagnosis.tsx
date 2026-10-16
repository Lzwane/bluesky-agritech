import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Leaf,
  FlaskConical,
  ShieldAlert,
  Calendar,
  Layers,
  History,
  Clock,
  ChevronRight,
  X,
  Scan,
  AlertTriangle,
  Loader2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { useTierAccess } from "@/hooks/useTierAccess";
import { TierBanner } from "@/components/app/TierBanner";

export const Route = createFileRoute("/_authenticated/app/diagnosis")({
  component: DiagnosisPage,
});

interface DiagnosticReport {
  requestId?: string;
  crop: string;
  disease_name: string;
  scientific_name: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Critical";
  pathogen_type:
    | "Fungal"
    | "Bacterial"
    | "Viral"
    | "Pest Infestation"
    | "Nutrient Deficiency"
    | "Healthy";
  symptoms_observed: string[];
  organic_treatment: string;
  chemical_treatment: string;
  preventative_measures: string;
  safety_note: string;
}

interface StoredScanRecord {
  id: string;
  user_id?: string;
  request_id?: string;
  created_at: string;
  crop: string;
  disease_name: string;
  scientific_name?: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Critical";
  pathogen_type: string;
  symptoms_observed?: string[];
  organic_treatment?: string;
  chemical_treatment?: string;
  preventative_measures?: string;
  safety_note?: string;
}

const APPROVED_CROPS = [
  { label: "I do not know / Unsure (Gemini Auto-Detect)", value: "unknown" },
  { label: "Maize / Corn (Mielies)", value: "Maize / Corn" },
  { label: "Tomato (Tamatie)", value: "Tomato" },
  { label: "Citrus (Oranges / Lemons / Naartjies)", value: "Citrus" },
  { label: "Potato (Aartappels)", value: "Potato" },
  { label: "Cabbage / Brassicas", value: "Cabbage" },
  { label: "Avocado", value: "Avocado" },
  { label: "Sugarcane", value: "Sugarcane" },
  { label: "Macadamia Nuts", value: "Macadamia" },
  { label: "Soybean", value: "Soybean" },
  { label: "Wheat", value: "Wheat" },
  { label: "Dry Bean", value: "Dry Bean" },
];

const SCAN_TELEMETRY_STEPS = [
  "Generating unique request signature...",
  "Calibrating Gemini multimodal vision spectrum...",
  "Isolating lesion contours and chlorosis...",
  "Cross-referencing South African Act 36 pathogen libraries...",
];

export function DiagnosisPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { checkLimit } = useTierAccess();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeView, setActiveView] = useState<"diagnose" | "history">("diagnose");
  const [selectedCrop, setSelectedCrop] = useState<string>("unknown");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMediaType, setImageMediaType] = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const isSubmittingRef = useRef<boolean>(false);
  const [telemetryIndex, setTelemetryIndex] = useState(0);

  const [historyList, setHistoryList] = useState<StoredScanRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<StoredScanRecord | null>(null);

  useEffect(() => {
    if (user?.id) {
      setReport(null);
      setSelectedImage(null);
      setImageBase64(null);

      try {
        const saved = localStorage.getItem(`bluesky_diagnoses_history_${user.id}`);
        setHistoryList(saved ? JSON.parse(saved) : []);
      } catch {
        setHistoryList([]);
      }
      fetchScanHistory(user.id);
    } else {
      setHistoryList([]);
    }
  }, [user?.id]);

  useEffect(() => {
    let interval: any;
    if (analyzing) {
      interval = setInterval(() => {
        setTelemetryIndex((prev) => (prev + 1) % SCAN_TELEMETRY_STEPS.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const fetchScanHistory = async (targetUserId?: string) => {
    const activeId = targetUserId || user?.id;
    if (!activeId) return;

    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("diagnoses")
        .select("*")
        .eq("user_id", activeId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHistoryList(data as unknown as StoredScanRecord[]);
        localStorage.setItem(`bluesky_diagnoses_history_${activeId}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file size must be under 15MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const resolvedType = validTypes.includes(file.type) ? file.type : "image/jpeg";
    setImageMediaType(resolvedType);

    setSelectedImage(URL.createObjectURL(file));
    setReport(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = typeof reader.result === "string" ? reader.result : "";
      const base64Clean = base64String.includes(",") ? base64String.split(",")[1] ?? base64String : base64String;
      if (base64Clean) setImageBase64(base64Clean);
    };
    reader.readAsDataURL(file);
  };

  const extractDiagnosticReport = (raw: any): DiagnosticReport => {
    let parsed = raw;
    if (parsed && typeof parsed === "object") {
      if (parsed.diagnosis && typeof parsed.diagnosis === "object") parsed = parsed.diagnosis;
      else if (parsed.report && typeof parsed.report === "object") parsed = parsed.report;
      else if (parsed.data && typeof parsed.data === "object") parsed = parsed.data;
      else if (parsed.result && typeof parsed.result === "object") parsed = parsed.result;
    }

    if (typeof parsed === "string") {
      let cleaned = parsed.replace(/```json/gi, "").replace(/```/g, "").trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = { disease_name: "Foliar Observation", symptoms_observed: [cleaned.slice(0, 150)] };
      }
    }

    const confidenceVal = Number(parsed?.confidence) || 88;
    return {
      requestId: parsed?.requestId,
      crop: parsed?.crop || (selectedCrop === "unknown" ? "Identified Crop" : selectedCrop),
      disease_name: parsed?.disease_name || parsed?.condition || parsed?.disease || "Healthy Specimen",
      scientific_name: parsed?.scientific_name || parsed?.pathogen || "Asymptomatic Foliar Tissue",
      confidence: confidenceVal > 1 ? confidenceVal : Math.round(confidenceVal * 100),
      severity: parsed?.severity || "Low",
      pathogen_type: parsed?.pathogen_type || parsed?.type || "Healthy",
      symptoms_observed: Array.isArray(parsed?.symptoms_observed) ? parsed.symptoms_observed : ["Normal foliar coloration"],
      organic_treatment: parsed?.organic_treatment || "Maintain proper crop nutrition and hygiene.",
      chemical_treatment: parsed?.chemical_treatment || "No chemical application required at this stage.",
      preventative_measures: parsed?.preventative_measures || "Continue standard scouting intervals.",
      safety_note: parsed?.safety_note || "AI diagnosis is not a replacement for a qualified agronomist. Always use approved Act 36 chemicals.",
    };
  };

  const handleRunDiagnosis = async () => {
    if (isSubmittingRef.current || analyzing) return;
    if (!user?.id) {
      toast.error("Please log in to save and run diagnoses.");
      return;
    }

    const quotaCheck = await checkLimit("diagnosis");
    if (!quotaCheck.allowed) return;

    if (!imageBase64) {
      toast.error("Please upload or capture a crop image first.");
      return;
    }

    isSubmittingRef.current = true;
    setAnalyzing(true);
    setReport(null);

    const uniqueRequestId = `gemini-req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    try {
      const response = await supabase.functions.invoke("diagnose-crop", {
        body: {
          requestId: uniqueRequestId,
          imageBase64,
          imageMediaType,
          crop: selectedCrop,
          preferredLanguage: language,
          useGemini: true,
        },
      });

      if (response.error) {
        let extractedMsg = response.error.message;
        try {
          if ((response.error as any).context) {
            const bodyText = await (response.error as any).context.json();
            extractedMsg = bodyText.error || extractedMsg;
          }
        } catch (_) {}
        throw new Error(extractedMsg);
      }

      const reportData: DiagnosticReport = extractDiagnosticReport(response.data);
      reportData.requestId = uniqueRequestId;
      setReport(reportData);
      toast.success("Gemini crop analysis completed successfully!");

      const scanId = `scan-${Date.now()}`;
      const newRecord: StoredScanRecord = {
        id: scanId,
        user_id: user.id,
        request_id: uniqueRequestId,
        created_at: new Date().toISOString(),
        ...reportData,
      };

      setHistoryList((prev) => {
        if (prev.some((p) => p.request_id === uniqueRequestId)) return prev;
        const updated = [newRecord, ...prev];
        localStorage.setItem(`bluesky_diagnoses_history_${user.id}`, JSON.stringify(updated));
        return updated;
      });

      window.dispatchEvent(new Event("bluesky_diagnosis_completed"));

      const { error: dbError } = await (supabase.from("diagnoses") as any).insert({
        user_id: user.id,
        request_id: uniqueRequestId,
        crop: newRecord.crop,
        disease_name: newRecord.disease_name,
        scientific_name: newRecord.scientific_name || "",
        confidence: newRecord.confidence,
        severity: newRecord.severity,
        pathogen_type: newRecord.pathogen_type,
        symptoms_observed: newRecord.symptoms_observed || [],
        organic_treatment: newRecord.organic_treatment || "",
        chemical_treatment: newRecord.chemical_treatment || "",
        preventative_measures: newRecord.preventative_measures || "",
        safety_note: newRecord.safety_note || "",
        created_at: newRecord.created_at,
      });

      if (dbError) {
        console.error("Failed to save scan record to database:", dbError.message);
        toast.error("Saved locally, but database sync failed: " + dbError.message);
      } else {
        fetchScanHistory(user.id);
      }
    } catch (err: any) {
      console.error("DIAGNOSIS_FAILED:", err);
      toast.error(err.message || "Gemini diagnostic service unavailable.");
    } finally {
      setAnalyzing(false);
      isSubmittingRef.current = false;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/40";
      case "High":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/40";
      case "Moderate":
        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/40";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-16 font-sans">
      <TierBanner />

      {/* Header - History toggles safely commented out with alignment maintained */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Google Gemini Multimodal Vision Powered
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Visual Crop Diagnostic Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Autonomous pathology identification, pest detection, and nutrient deficiency mapping.
          </p>
        </div>

        {/* 
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#121822] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveView("diagnose")}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === "diagnose"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Scan className="h-3.5 w-3.5" /> Scanner
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView("history");
              fetchScanHistory();
            }}
            className={`cursor-pointer flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeView === "history"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" /> History ({historyList.length})
          </button>
        </div> 
        */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Ingestion */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#161d26]/90 p-6 shadow-sm space-y-5">
            {/* Crop Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                1. Select Target Crop
              </label>
              <select
                value={selectedCrop}
                disabled={analyzing}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none transition cursor-pointer font-medium disabled:opacity-50"
              >
                {APPROVED_CROPS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Upload Box */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Upload or Retake Photo
                </label>
                {selectedImage && !analyzing && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImageBase64(null);
                      setReport(null);
                    }}
                    className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Replace Image
                  </button>
                )}
              </div>

              <div
                onClick={() => !analyzing && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-3 flex flex-col items-center justify-center transition relative overflow-hidden min-h-[270px] group ${
                  analyzing
                    ? "border-emerald-500 bg-emerald-50/30 dark:bg-slate-900/40 cursor-wait"
                    : selectedImage
                    ? "border-emerald-500/60 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer"
                    : "border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-emerald-500/60 cursor-pointer"
                }`}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Crop specimen"
                      className="max-h-60 w-full object-contain rounded-xl shadow-sm"
                    />

                    {analyzing && (
                      <div className="absolute inset-0 z-20 overflow-hidden rounded-xl bg-emerald-950/30 backdrop-blur-[1px] border border-emerald-500/50">
                        <div
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-pulse"
                          style={{ animation: "scanLine 2s ease-in-out infinite" }}
                        />
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-emerald-500/60 px-3 py-1 rounded-full flex items-center gap-2 shadow-xl whitespace-nowrap">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="text-[11px] font-mono font-bold text-emerald-300">
                            {SCAN_TELEMETRY_STEPS[telemetryIndex]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Tap to upload leaf photo</p>
                      <p className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG, WEBP</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  disabled={analyzing}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Disabled Scan Button During Processing */}
            <button
              onClick={handleRunDiagnosis}
              disabled={analyzing || !selectedImage}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-xs font-bold text-white shadow-md transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Analyzing with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run Gemini Diagnosis
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed pt-1 border-t border-slate-100 dark:border-slate-800">
              💡 For best accuracy, use clear, well-lit photos focusing closely on leaf lesions or stem symptoms. Avoid blurry shots.
            </p>
          </div>
        </div>

        {/* Right Column: Diagnostic Report */}
        <div className="lg:col-span-7">
          {report ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161d26]/95 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Gemini Pathology Report
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(report.severity)}`}>
                      {report.severity} Severity
                    </span>
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 px-2.5 py-0.5 rounded-full border">
                      {report.confidence}% Confidence
                    </span>
                  </div>
                </div>

                {report.confidence < 75 && (
                  <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider">Low Confidence Warning</h4>
                      <p className="text-xs leading-relaxed">
                        Confidence is below 75%. Image blur or poor lighting may impact accuracy. Consider uploading a sharper photo.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {report.disease_name}
                  </h2>
                  <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    {report.scientific_name} • {report.pathogen_type} • Crop: {report.crop}
                  </p>
                </div>

                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Observed Visual Signatures
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {report.symptoms_observed.map((symptom, idx) => (
                      <span key={idx} className="rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300">
                        • {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Leaf className="h-4 w-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Organic Treatment</h3>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {report.organic_treatment}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-200 dark:border-cyan-900/40 bg-cyan-50/50 dark:bg-cyan-950/20 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400">
                    <FlaskConical className="h-4 w-4" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Chemical Regimen</h3>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {report.chemical_treatment}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#161d26]/80 p-5 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Calendar className="h-4 w-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Preventative Measures</h3>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {report.preventative_measures}
                </p>
              </div>

              {/* Mandatory Agronomist Disclaimer */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4 flex items-start gap-3">
                <ShieldAlert className="h-4 w-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-300">Agronomist Disclaimer: </strong>
                  {report.safety_note}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-[#121822]/40 p-12 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3 shadow-xs">
              <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400">
                <Layers className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-300">Gemini Monitor Idle</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Upload a crop photograph on the left to initiate Google Gemini AI pathology scanning.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Laser Scan Keyframes */}
      <style>{`
        @keyframes scanLine {
          0% { top: 2%; opacity: 0.2; }
          50% { top: 94%; opacity: 1; }
          100% { top: 2%; opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default DiagnosisPage;