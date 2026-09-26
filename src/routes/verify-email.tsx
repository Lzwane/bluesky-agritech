import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, MailCheck, RefreshCw, ArrowRight, ShieldCheck, Edit2 } from "lucide-react";
import logoImg from "@/assets/BlueSky_AgrITech_Logo.png";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/verify-email")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Verify Your Email — AI Crop Detective by BlueSky AgriTech" },
      { name: "description", content: "Enter the verification code sent to your email to activate your account." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    // Fetch current unverified user email if available
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.email) {
        setEmail(data.user.email);
        setNewEmail(data.user.email);
      }
    });
  }, []);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleVerifyCode(event: React.FormEvent) {
    event.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter the verification code or token.");
      return;
    }

    setBusy(true);
    try {
      // Verify OTP token sent to email
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "signup",
      });

      if (error) throw error;

      setVerifiedSuccess(true);
      toast.success("Email verified successfully! Welcome to your dashboard.");
      
      setTimeout(() => {
        navigate({ to: "/app", replace: true });
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired verification code. Please check and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendCode() {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown}s before requesting another verification email.`);
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });

      if (error) throw error;

      toast.success("Verification code resent successfully!");
      setResendCooldown(60); // 60-second rate limit
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification code.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdateEmail(event: React.FormEvent) {
    event.preventDefault();
    if (!newEmail.trim() || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;

      setEmail(newEmail.trim());
      setIsEditingEmail(false);
      toast.success("Email address updated! A new verification code has been sent.");
      setResendCooldown(60);
    } catch (err: any) {
      toast.error(err.message || "Failed to update email address.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-12 bg-[#0d1217] font-sans">
      {/* Left Info Column */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden p-8 xl:p-10 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-[#0b1015] border-r border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
              Account Security
            </span>
            <p className="text-[11px] text-slate-400">Email Verification Guard</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-sm py-8 space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Verify your email to unlock full access.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            To maintain platform integrity and secure your agricultural records, every new account must complete email verification before accessing uninhibited dashboard modules.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} BlueSky AgriTech</span>
          <span className="text-slate-500">POPIA Compliant</span>
        </div>
      </div>

      {/* Right Blackboard Form Container */}
      <div className="relative lg:col-span-7 flex flex-col justify-center items-center px-6 py-10 sm:px-12 md:px-16 lg:px-12 xl:px-20 bg-[#11161d] overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative group mb-3">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />
              <div className="relative flex h-18 w-18 items-center justify-center rounded-2xl bg-slate-900/90 border border-slate-700/80 p-2 shadow-2xl">
                <img src={logoImg} alt="BlueSky AgriTech" className="h-14 w-14 object-contain filter drop-shadow" />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Email Verification Required</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Enter the verification code sent to your registered email address
            </p>
          </div>

          <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {verifiedSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Email Verified Successfully</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your account is now fully active. Redirecting you to your personal dashboard...
                </p>
              </div>
            ) : isEditingEmail ? (
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Correct Your Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition cursor-pointer"
                  >
                    {busy ? "Updating..." : "Save & Resend Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-5">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-start gap-3">
                  <MailCheck className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">Verification email sent</p>
                    <p className="text-[11px] text-slate-300">
                      We sent a code to <span className="text-emerald-400 font-mono font-bold">{email || "your email"}</span>.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditingEmail(true)}
                      className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 pt-1 cursor-pointer font-semibold"
                    >
                      <Edit2 className="h-3 w-3" /> Entered wrong email? Correct it here
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                    Enter 6-Digit Verification Code or OTP Token
                  </label>
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. 482910"
                    required
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-center tracking-widest font-mono text-lg text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="cursor-pointer group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-60"
                >
                  {busy ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Verify &amp; Enter Dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || busy}
                    className="text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Code"}
                  </button>

                  <Link to="/auth" className="text-slate-400 hover:text-white transition">
                    Sign Out / Switch Account
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;