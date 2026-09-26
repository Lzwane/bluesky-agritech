import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, Lock, ArrowRight } from "lucide-react";
import logoImg from "@/assets/BlueSky_AgrITech_Logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset Password — AI Crop Detective by BlueSky AgriTech" },
      { name: "description", content: "Enter your new secure password to reset your account credentials." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match. Please verify both entries.");
      return;
    }

    // Optional check if we want to prevent matching a cached previous state if tracked, 
    // Supabase updateUser handles backend rejection if it matches the active session password.
    setBusy(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes("same as the old password") || error.message.toLowerCase().includes("should be different")) {
          throw new Error("Your new password must be different from your previous password.");
        }
        throw error;
      }

      setSuccess(true);
      toast.success("Password successfully updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password. Link may have expired.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-12 bg-[#0d1217] font-sans">
      {/* Left Info Column (Matches Auth Page) */}
      <div className="relative hidden lg:flex lg:col-span-5 flex-col justify-between overflow-hidden p-8 xl:p-10 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-[#0b1015] border-r border-slate-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold">
              Secure Credential Reset
            </span>
            <p className="text-[11px] text-slate-400">BlueSky AgriTech Security</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-sm py-8 space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Set your new secure password.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ensure your new password is unique, robust, and distinct from your previous credentials to protect your farm management dashboard.
          </p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[11px] text-slate-400">
          <span>&copy; {new Date().getFullYear()} BlueSky AgriTech</span>
          <span className="text-slate-500">POPIA Compliant Security</span>
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
            <h2 className="text-2xl font-bold tracking-tight text-white">Create New Password</h2>
            <p className="mt-0.5 text-xs text-slate-400">Must be different from your previous password</p>
          </div>

          <div className="rounded-3xl border border-slate-700/60 bg-[#161d26]/90 p-6 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {success ? (
              <div className="text-center space-y-4 py-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Password Reset Successful</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your credentials have been securely updated. You can now sign in with your new password.
                </p>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/auth", replace: true })}
                  className="mt-4 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition cursor-pointer shadow-lg"
                >
                  Proceed to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 pr-12 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Must be at least 8 characters and different from your previous password.
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="cursor-pointer group relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition-all hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] disabled:opacity-60"
                >
                  {busy ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            <Link to="/auth" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">
              &larr; Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;