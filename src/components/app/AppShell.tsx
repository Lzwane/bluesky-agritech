import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  ScanLine,
  BookOpen,
  Store,
  MessageSquare,
  Bot,
  LogOut,
  ChevronDown,
  Settings,
  ShieldAlert,
} from "lucide-react";

import logoImg from "@/assets/BlueSky_AgrITech_Logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

const OWNER_EMAIL = "mnisithokozani829@gmail.com";

export function AppShell() {
  const { t } = useLanguage(); // Called inside component body safely
  const navItems = [
    { label: t("nav_dashboard"), href: "/app", icon: LayoutDashboard, exact: true },
    { label: t("nav_diagnosis"), href: "/app/diagnosis", icon: ScanLine },
    { label: t("nav_library"), href: "/app/library", icon: BookOpen },
    { label: t("nav_marketplace"), href: "/app/marketplace", icon: Store },
    { label: t("nav_forum"), href: "/app/forum", icon: MessageSquare },
    { label: t("nav_advisor"), href: "/app/advisor", icon: Bot },
  ];

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isAdminRoute = currentPath.startsWith("/app/admin");

  const { user } = useAuth();
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const rawMeta = (user as any)?.user_metadata;
  const displayName: string = isOwner
    ? "Thokozani Mnisi (Owner)"
    : rawMeta?.display_name || user?.email?.split("@")[0] || "Farmer";
  const email: string = user?.email || "grower@bluesky.co.za";
  const initials: string = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const saved = localStorage.getItem("bluesky_theme_mode") || "dark";
    const root = document.documentElement;

    if (saved === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) root.classList.add("dark");
      else root.classList.remove("dark");
    } else if (saved === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  if (isAdminRoute) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 dark:bg-[#0d1217] dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black transition-colors duration-200">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-64 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10 dark:from-emerald-600/10 dark:via-cyan-600/5" />

      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/90 border-b border-slate-200/90 dark:bg-[#11161d]/90 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link to="/app" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 p-1 flex items-center justify-center group-hover:border-emerald-500/50 shadow-sm transition">
              <img src={logoImg} alt="BlueSky AgriTech" className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                BlueSky <span className="text-emerald-600 dark:text-emerald-400">AgriTech</span>
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                Control Center
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/90 backdrop-blur-md shadow-inner transition-colors">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? currentPath === item.href
                : currentPath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/50"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 py-1.5 px-2.5 sm:px-3 text-left transition active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:block text-left pr-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                  {displayName}
                </p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-none mt-0.5">
                  {isOwner ? "System Owner" : "Verified Grower"}
                </p>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                  profileDropdownOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                }`}
              />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700/70 bg-white dark:bg-[#161d26] p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="border-b border-slate-100 dark:border-slate-800/90 px-3 py-2.5">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
                </div>

                <div className="pt-1.5 space-y-1">
                  {isOwner && (
                    <Link
                      to="/app/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                    >
                      <ShieldAlert className="h-4 w-4 text-emerald-500" />
                      <span>Admin Operations</span>
                    </Link>
                  )}

                  <Link
                    to="/app/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-emerald-600 dark:text-slate-200 dark:hover:bg-slate-800/80 transition"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Leave &amp; Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-28 md:pb-8">
        <Outlet />
      </main>

      <div className="md:hidden fixed bottom-5 inset-x-3 z-40">
        <nav className="mx-auto max-w-md bg-white/95 dark:bg-[#161d26]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/80 rounded-2xl px-2 py-2 shadow-xl transition-colors">
          <div className="grid grid-cols-6 gap-1 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? currentPath === item.href
                : currentPath.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition text-center ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/15"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                  <span className="text-[10px] mt-1 leading-none truncate max-w-[48px]">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default AppShell;