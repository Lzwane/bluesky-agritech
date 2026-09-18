import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  ArrowUp,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  AlertTriangle,
  Loader2,
  History,
  Plus,
  Trash2,
  MessageSquare,
  Archive,
  ArchiveRestore,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/advisor")({
  component: AdvisorPage,
});

export interface AttachedImageState {
  file: File;
  base64: string;
  mediaType: string;
  previewUrl: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "advisor";
  text: string;
  imagePreviewUrl?: string;
  timestamp: string;
  isError?: boolean;
}

export interface ConversationSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  messages: ChatMessage[];
}

type VoiceStatus = "idle" | "recording" | "processing";

const BEGINNER_STARTER_SUGGESTIONS = [
  {
    title: "Why are my leaves turning yellow?",
    desc: "Diagnose nitrogen deficiency, overwatering, or fungal leaf blight",
  },
  {
    title: "How often should I water my crops?",
    desc: "Calculate irrigation intervals for sandy vs clay soil under high heat",
  },
  {
    title: "How do I spot and control Fall Armyworm?",
    desc: "Inspect whorl feeding funnels and select registered treatments",
  },
  {
    title: "What basal fertilizer should I use at planting?",
    desc: "NPK ratio guidelines for maize, tomatoes, and vegetables",
  },
];

function cleanAiResponse(text: string): string {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/^>\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .trim();
}

export function AdvisorPage() {
  const { user } = useAuth();

  const farmerName = useMemo(() => {
    const meta = (user as any)?.user_metadata;
    if (meta?.full_name?.trim()) return meta.full_name.trim();
    if (meta?.display_name?.trim()) return meta.display_name.trim();
    if (meta?.name?.trim()) return meta.name.trim();
    if (meta?.first_name?.trim()) {
      return `${meta.first_name}${meta.last_name || ""}`.trim();
    }
    if (user?.email) {
      const parts = user.email.split("@");
      const prefix = parts[0] ?? "";
      if (prefix) {
        return prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }
    }
    return "Farmer";
  }, [user]);

  // Active Conversations State - Closed by default on all screens
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showHistorySidebar, setShowHistorySidebar] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);

  // Active Message Stream State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImageState | null>(null);

  // Voice State
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [interimText, setInterimText] = useState<string>("");
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptAccumulator = useRef<string>("");

  const storageKey = useMemo(() => {
    return user?.id ? `bluesky_advisor_conversations_${user.id}` : null;
  }, [user?.id]);

  // Load user-specific conversations on login/mount
  useEffect(() => {
    if (!storageKey) {
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ConversationSession[] = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          const nonArchived = parsed.filter((c) => !c.isArchived);
          const firstChat = (nonArchived.length > 0 ? nonArchived[0] : parsed[0]) ?? null;
          if (firstChat) {
            setActiveConversationId(firstChat.id);
            setMessages(firstChat.messages || []);
          } else {
            startNewConversation();
          }
        } else {
          startNewConversation();
        }
      } else {
        startNewConversation();
      }
    } catch {
      startNewConversation();
    }
  }, [storageKey]);

  const persistConversations = (updated: ConversationSession[]) => {
    setConversations(updated);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const startNewConversation = () => {
    if (!user?.id) return;
    const newId = `conv-${Date.now()}`;
    const newConv: ConversationSession = {
      id: newId,
      userId: user.id,
      title: "New Farm Consultation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      messages: [],
    };

    const updated = [newConv, ...conversations];
    persistConversations(updated);
    setActiveConversationId(newId);
    setMessages([]);
    setInputMessage("");
    setAttachedImage(null);
    setShowHistorySidebar(false);
  };

  const switchConversation = (conv: ConversationSession) => {
    setActiveConversationId(conv.id);
    setMessages(conv.messages || []);
    setInputMessage("");
    setAttachedImage(null);
    setShowHistorySidebar(false);
  };

  const deleteConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    const updated = conversations.filter((c) => c.id !== convId);
    persistConversations(updated);
    toast.success("Conversation deleted");

    if (activeConversationId === convId) {
      const firstAvailable = updated[0];
      if (firstAvailable) {
        switchConversation(firstAvailable);
      } else {
        startNewConversation();
      }
    }
  };

  const toggleArchiveConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    const updated = conversations.map((c) =>
      c.id === convId ? { ...c, isArchived: !c.isArchived, updatedAt: new Date().toISOString() } : c
    );
    persistConversations(updated);
    toast.success("Conversation archive status updated");
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputMessage]);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-ZA";
      recognition.maxAlternatives = 1;

      finalTranscriptAccumulator.current = inputMessage;

      recognition.onstart = () => {
        setVoiceStatus("recording");
        setInterimText("");
        toast.info("Listening... Speak clearly about your crops.");
      };

      recognition.onresult = (event: any) => {
        let currentInterim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || "";

          if (result.isFinal) {
            const cleanFinal = transcript.trim();
            if (cleanFinal) {
              const currentAcc = finalTranscriptAccumulator.current.trim();
              finalTranscriptAccumulator.current = currentAcc
                ? `${currentAcc}${cleanFinal}`
                : cleanFinal;
              setInputMessage(finalTranscriptAccumulator.current);
            }
          } else {
            currentInterim += transcript;
          }
        }

        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        setVoiceStatus("idle");
        setInterimText("");

        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microphone access denied. Please allow microphone permissions in your browser.");
        } else if (event.error !== "no-speech" && event.error !== "aborted") {
          toast.error(`Voice error: ${event.error || "Unable to transcribe"}`);
        }
      };

      recognition.onend = () => {
        setVoiceStatus("idle");
        setInterimText("");
      };

      recognition.start();
    } catch {
      setVoiceStatus("idle");
      setInterimText("");
      toast.error("Microphone initialization failed. Please type your message.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      setVoiceStatus("processing");
      try {
        recognitionRef.current.stop();
      } catch (_) {
        setVoiceStatus("idle");
      }
    }
  };

  const toggleListening = () => {
    if (voiceStatus === "recording") {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleSpeak = (messageId: string, rawText: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Audio playback is not supported in this browser.");
      return;
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanSpokenText = rawText
      .replace(/[#*_`>•]/g, "")
      .replace(/\[.*?\]/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpokenText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-ZA";

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error("Photo size must be under 20MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = typeof reader.result === "string" ? reader.result : "";
      const base64Clean =
        (base64String.includes(",") ? base64String.split(",")[1] : base64String) || "";

      setAttachedImage({
        file,
        base64: base64Clean,
        mediaType: file.type || "image/jpeg",
        previewUrl: URL.createObjectURL(file),
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (customText?: string) => {
    if (voiceStatus === "recording") {
      stopListening();
    }

    const textToSend = customText || inputMessage;
    if (!textToSend.trim() && !attachedImage) return;

    const currentImage = attachedImage;
    const userMsgId = `user-${Date.now()}`;

    const newUserMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend.trim(),
      ...(currentImage?.previewUrl ? { imagePreviewUrl: currentImage.previewUrl } : {}),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedStreamWithUser = [...messages, newUserMessage];
    setMessages(updatedStreamWithUser);
    setInputMessage("");
    setInterimText("");
    finalTranscriptAccumulator.current = "";
    setAttachedImage(null);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const targetConvId = activeConversationId || `conv-${Date.now()}`;
    const generatedTitle =
      messages.length === 0
        ? textToSend.trim().slice(0, 36) + (textToSend.length > 36 ? "..." : "")
        : undefined;

    try {
      const systemDirective =
        "You are an expert South African Senior Agronomist and Plant Pathologist. Provide a detailed, in-depth, and thorough response. Explain root causes, specific organic remedies, Act 36 registered chemical active ingredients, soil management, and preventative measures. Do NOT use markdown asterisks (**) for bolding, do not use hashtags (##) for headings, and do not use backticks. Write in clean, highly readable, natural expert language structured with clean paragraphs and bullet points (using •).";

      const combinedPrompt = `${systemDirective}\n\nFarmer Query: ${textToSend.trim()}`;

      const response = await supabase.functions.invoke("diagnose-crop", {
        body: {
          customPrompt: combinedPrompt,
          message: textToSend.trim(),
          imageBase64: currentImage?.base64 || "",
          imageMediaType: currentImage?.mediaType || "image/jpeg",
          farmerName,
        },
      });

      if (response.error) {
        let detailedError = response.error.message;
        try {
          if ((response.error as any).context) {
            const bodyJson = await (response.error as any).context.json();
            detailedError = bodyJson.error || detailedError;
          }
        } catch (_) {}
        throw new Error(detailedError);
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const rawReply =
        response.data?.reply ||
        response.data?.response ||
        response.data?.text ||
        (typeof response.data === "string" ? response.data : "");

      if (!rawReply) {
        throw new Error("The agronomic engine returned an empty response. Please try asking again.");
      }

      const sanitizedText = cleanAiResponse(rawReply);

      const advisorMessage: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: "advisor",
        text: sanitizedText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalStream = [...updatedStreamWithUser, advisorMessage];
      setMessages(finalStream);

      const updatedConversations = conversations.map((conv) => {
        if (conv.id === targetConvId) {
          return {
            ...conv,
            title: generatedTitle || conv.title,
            updatedAt: new Date().toISOString(),
            messages: finalStream,
          };
        }
        return conv;
      });

      persistConversations(updatedConversations);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reach Agronomist AI service";
      toast.error(errorMessage);

      const errorMsgItem: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "advisor",
        isError: true,
        text: `Diagnostic Note: Unable to complete analysis at this time.\n\n${errorMessage}\n\nPlease check your internet connection or retry your inquiry.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const finalStreamWithError = [...updatedStreamWithUser, errorMsgItem];
      setMessages(finalStreamWithError);

      const updatedConversations = conversations.map((conv) => {
        if (conv.id === targetConvId) {
          return {
            ...conv,
            title: generatedTitle || conv.title,
            updatedAt: new Date().toISOString(),
            messages: finalStreamWithError,
          };
        }
        return conv;
      });

      persistConversations(updatedConversations);
    } finally {
      setIsTyping(false);
    }
  };

  const displayedConversations = useMemo(() => {
    return conversations
      .filter((c) => (showArchived ? c.isArchived : !c.isArchived))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [conversations, showArchived]);

  return (
    <div className="flex h-[calc(100vh-5.5rem)] max-w-7xl mx-auto px-2 sm:px-4 font-sans gap-0 md:gap-4 relative overflow-hidden">
      {/* Slide-out History Drawer on Mobile, Collapsible Push Panel on Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-[#111720] border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out md:relative md:inset-auto md:rounded-3xl md:border shadow-2xl md:shadow-none ${
          showHistorySidebar
            ? "w-72 sm:w-80 translate-x-0 opacity-100"
            : "-translate-x-full md:translate-x-0 md:w-0 md:border-0 md:opacity-0 pointer-events-none md:pointer-events-none"
        } ${showHistorySidebar ? "pointer-events-auto" : ""}`}
      >
        <div className="w-72 sm:w-80 flex flex-col h-full">
          {/* History Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                Field Consultations
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={startNewConversation}
                title="Start New Conversation"
                className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowHistorySidebar(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                title="Close Sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tab Toggle: Active vs Archived */}
          <div className="px-3 pt-3 flex gap-1">
            <button
              type="button"
              onClick={() => setShowArchived(false)}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition cursor-pointer ${
                !showArchived
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Recent Chats
            </button>
            <button
              type="button"
              onClick={() => setShowArchived(true)}
              className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                showArchived
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Archive className="h-3 w-3" />
              Archived
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-none">
            {displayedConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="h-6 w-6 mx-auto opacity-40 text-slate-400" />
                <p>No {showArchived ? "archived" : "recent"} sessions found.</p>
              </div>
            ) : (
              displayedConversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => switchConversation(conv)}
                    className={`group relative p-3 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80 shadow-xs"
                        : "bg-white dark:bg-[#161d26]/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-xs font-bold line-clamp-1 ${
                          isActive
                            ? "text-emerald-800 dark:text-emerald-300"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {conv.title}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>
                        {new Date(conv.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      {/* Action buttons on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => toggleArchiveConversation(e, conv.id)}
                          title={conv.isArchived ? "Restore to active" : "Archive chat"}
                          className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
                        >
                          {conv.isArchived ? (
                            <ArchiveRestore className="h-3.5 w-3.5" />
                          ) : (
                            <Archive className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => deleteConversation(e, conv.id)}
                          title="Delete conversation"
                          className="p-1 hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* User Identity Footer */}
          <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="truncate max-w-[170px]">{farmerName}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Act 36 Verified
            </span>
          </div>
        </div>
      </aside>

      {/* Main Conversation Column */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#11161d] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all duration-300">
        {/* Top Control Bar with Drawer Trigger */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistorySidebar((prev) => !prev)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer flex items-center gap-1.5"
              title={showHistorySidebar ? "Close History Sidebar" : "Open History Sidebar"}
            >
              {showHistorySidebar ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
              <span className="text-xs font-semibold hidden sm:inline">
                {showHistorySidebar ? "Close History" : "Consultation History"}
              </span>
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {conversations.find((c) => c.id === activeConversationId)?.title ||
                "Agronomist Consultation"}
            </span>
          </div>

          <button
            type="button"
            onClick={startNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Session</span>
          </button>
        </div>

        {/* Scrollable Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scrollbar-none">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center px-4 space-y-7 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 dark:from-emerald-400 dark:via-teal-300 dark:to-sky-400">
                  Hello, {farmerName}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Start an agronomic session. Chat about soil deficiencies, spray timing, pests, or upload a foliar photo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
                {BEGINNER_STARTER_SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.title)}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161d26]/80 hover:bg-slate-100 dark:hover:bg-[#1b2430] hover:border-slate-300 dark:hover:border-slate-700 transition group text-left space-y-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                      <span>{item.title}</span>
                      <Sparkles className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === "user";
              const isCurrentlySpeaking = speakingMessageId === msg.id;

              return (
                <div key={msg.id} className="space-y-3">
                  {isUser ? (
                    <div className="flex justify-end">
                      <div className="max-w-2xl rounded-3xl bg-slate-100 dark:bg-[#1e293b] text-slate-900 dark:text-slate-100 px-5 py-3 text-sm leading-relaxed border border-slate-200 dark:border-slate-700/60 shadow-xs space-y-2">
                        {msg.imagePreviewUrl && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-xs mb-2">
                            <img
                              src={msg.imagePreviewUrl}
                              alt="Crop specimen"
                              className="w-full h-40 object-cover"
                            />
                          </div>
                        )}
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 text-sm leading-relaxed max-w-3xl">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs ${
                          msg.isError
                            ? "bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-500/20 dark:border-rose-500/40 dark:text-rose-400"
                            : "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950"
                        }`}
                      >
                        {msg.isError ? <AlertTriangle className="h-3.5 w-3.5" /> : "AI"}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div
                          className={`whitespace-pre-line text-sm leading-relaxed p-4 sm:p-5 rounded-2xl border ${
                            msg.isError
                              ? "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-500/30 dark:text-rose-300 font-mono text-xs"
                              : "bg-slate-50/70 dark:bg-[#161d26] border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs"
                          }`}
                        >
                          {msg.text}
                        </div>

                        {!msg.isError && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => toggleSpeak(msg.id, msg.text)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition cursor-pointer ${
                                isCurrentlySpeaking
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-400"
                                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-[#161d26]/60 shadow-2xs"
                              }`}
                            >
                              {isCurrentlySpeaking ? (
                                <>
                                  <VolumeX className="h-3.5 w-3.5" /> Stop Reading
                                </>
                              ) : (
                                <>
                                  <Volume2 className="h-3.5 w-3.5" /> Read Aloud
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isTyping && (
            <div className="flex gap-3 max-w-3xl animate-in fade-in duration-150">
              <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 text-slate-950 font-bold text-xs">
                AI
              </div>
              <div className="flex items-center gap-1.5 pt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-bounce" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {voiceStatus === "recording" && (
            <div className="flex items-center justify-between px-3.5 py-1.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Recording audio... Tap red mic to finish
                </span>
              </div>
              {interimText && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-[200px]">
                  "{interimText}"
                </span>
              )}
            </div>
          )}

          {voiceStatus === "processing" && (
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
              <Loader2 className="h-3 w-3 animate-spin text-emerald-600 dark:text-emerald-400" />
              <span>Transcribing audio...</span>
            </div>
          )}

          {attachedImage && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-white dark:bg-[#1a232f] border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
              <img
                src={attachedImage.previewUrl}
                alt="Preview"
                className="h-6 w-6 rounded-md object-cover"
              />
              <span className="truncate max-w-[180px]">{attachedImage.file.name}</span>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="hover:text-rose-500 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="relative rounded-3xl border border-slate-300 dark:border-slate-700/80 bg-slate-50/50 dark:bg-[#161d26] shadow-2xs focus-within:border-emerald-500 transition px-4 py-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                finalTranscriptAccumulator.current = e.target.value;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                voiceStatus === "recording"
                  ? "Listening... Speak naturally."
                  : "Ask a farm question, or tap mic to dictate..."
              }
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none pr-24 max-h-36 leading-relaxed"
            />

            <div className="flex items-center gap-1 absolute right-3 bottom-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach leaf or crop photo"
                className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={toggleListening}
                title={voiceStatus === "recording" ? "Stop recording" : "Dictate by voice"}
                className={`p-1.5 rounded-full transition cursor-pointer ${
                  voiceStatus === "recording"
                    ? "bg-rose-500 text-white shadow-md shadow-rose-500/40 animate-pulse"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {voiceStatus === "recording" ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                disabled={isTyping || (!inputMessage.trim() && !attachedImage)}
                onClick={() => handleSendMessage()}
                className="p-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-30 disabled:hover:bg-emerald-600 active:scale-95 cursor-pointer shadow-xs"
              >
                <ArrowUp className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvisorPage;