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

function AdvisorPage() {
  const { user } = useAuth();

  const farmerName = useMemo(() => {
    const meta = (user as any)?.user_metadata;
    if (meta?.full_name?.trim()) return meta.full_name.trim();
    if (meta?.display_name?.trim()) return meta.display_name.trim();
    if (meta?.name?.trim()) return meta.name.trim();
    if (meta?.first_name?.trim()) {
      return `${meta.first_name} ${meta.last_name || ""}`.trim();
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

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [attachedImage, setAttachedImage] = useState<AttachedImageState | null>(null);

  // Voice State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
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

  const toggleListening = () => {
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-ZA";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Could not capture voice input. Check mic permissions.");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
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

    setMessages((prev) => [...prev, newUserMessage]);
    setInputMessage("");
    setAttachedImage(null);
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Direct call to Supabase Edge Function without mock fallbacks
      const response = await supabase.functions.invoke("diagnose-crop", {
        body: {
          customPrompt: textToSend.trim(),
          message: textToSend.trim(),
          imageBase64: currentImage?.base64 || "",
          imageMediaType: currentImage?.mediaType || "image/jpeg",
          farmerName,
        },
      });

      // Catch and surface function invocation errors (HTTP 4xx/5xx)
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

      // Check for an error payload inside a 200 response
      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      const rawReply =
        response.data?.reply ||
        response.data?.response ||
        response.data?.text ||
        (typeof response.data === "string" ? response.data : "");

      if (!rawReply) {
        throw new Error("Edge Function responded, but the reply field was empty.");
      }

      const advisorMessage: ChatMessage = {
        id: `advisor-${Date.now()}`,
        sender: "advisor",
        text: rawReply.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, advisorMessage]);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reach Edge Function";
      toast.error(errorMessage);

      // Display the raw error directly in the chat view so you know exactly what failed
      const errorMsgItem: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "advisor",
        isError: true,
        text: `⚠️ ERROR FROM AI ENGINE:\n\n${errorMessage}\n\nCheck Supabase Dashboard > Edge Functions > Secrets to verify your API keys.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, errorMsgItem]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto px-4 font-sans">
      {/* Scrollable Conversation Stream */}
      <div className="flex-1 overflow-y-auto pt-4 pb-6 space-y-6 scrollbar-none">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center px-4 space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                Hello, {farmerName}
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto">
                Ask questions about your crops, watering, bugs, soil, or upload a leaf photo.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl text-left">
              {BEGINNER_STARTER_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.title)}
                  className="p-4 rounded-2xl border border-slate-800 bg-[#161d26]/80 hover:bg-[#1b2430] hover:border-slate-700 transition group text-left space-y-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-medium text-slate-200 group-hover:text-emerald-400 transition">
                    <span>{item.title}</span>
                    <Sparkles className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400" />
                  </div>
                  <p className="text-[12px] text-slate-400 leading-snug">{item.desc}</p>
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
                    <div className="max-w-2xl rounded-3xl bg-[#1e293b] text-slate-100 px-5 py-3 text-sm leading-relaxed border border-slate-700/60 shadow-sm space-y-2">
                      {msg.imagePreviewUrl && (
                        <div className="rounded-xl overflow-hidden border border-slate-700 max-w-xs mb-2">
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
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-sm ${
                        msg.isError
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-400"
                          : "bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950"
                      }`}
                    >
                      {msg.isError ? <AlertTriangle className="h-3.5 w-3.5" /> : "AI"}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div
                        className={`whitespace-pre-line leading-relaxed p-4 rounded-2xl border ${
                          msg.isError
                            ? "bg-rose-950/20 border-rose-500/30 text-rose-300 font-mono text-xs"
                            : "bg-[#161d26] border-slate-800 text-slate-200"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {!msg.isError && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => toggleSpeak(msg.id, msg.text)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${
                              isCurrentlySpeaking
                                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                                : "border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 bg-[#161d26]/60"
                            }`}
                          >
                            {isCurrentlySpeaking ? (
                              <>
                                <VolumeX className="h-3.5 w-3.5" /> Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3.5 w-3.5" /> Listen
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
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="pt-2 pb-4">
        {attachedImage && (
          <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#1a232f] border border-slate-700 text-xs text-slate-200">
            <img
              src={attachedImage.previewUrl}
              alt="Preview"
              className="h-6 w-6 rounded-md object-cover"
            />
            <span className="truncate max-w-[200px]">{attachedImage.file.name}</span>
            <button
              onClick={() => setAttachedImage(null)}
              className="hover:text-rose-400 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div className="relative rounded-3xl border border-slate-700/80 bg-[#161d26] shadow-xl focus-within:border-slate-500 transition px-4 py-2.5">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask a question or tap the mic to speak..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none pr-24 max-h-40 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 absolute right-3 bottom-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach leaf or crop photo"
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
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
              title={isListening ? "Stop listening" : "Voice input"}
              className={`p-2 rounded-full transition cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <button
              type="button"
              disabled={isTyping || (!inputMessage.trim() && !attachedImage)}
              onClick={() => handleSendMessage()}
              className="p-2 rounded-full bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition disabled:opacity-30 disabled:hover:bg-emerald-500 active:scale-95 cursor-pointer"
            >
              <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-center text-slate-500 mt-2">
          Ask any question by voice or text. Upload photos for rapid foliar diagnostics.
        </p>
      </div>
    </div>
  );
}

export default AdvisorPage;