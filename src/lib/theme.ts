export type ThemeSetting = "dark" | "light" | "system";

const STORAGE_KEY = "bluesky_theme_mode";

export function getStoredTheme(): ThemeSetting {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(STORAGE_KEY) as ThemeSetting;
  if (saved === "dark" || saved === "light" || saved === "system") {
    return saved;
  }
  return "dark";
}

export function applyTheme(mode: ThemeSetting) {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, mode);
  const root = document.documentElement;

  let isDark = false;
  if (mode === "system") {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {
    isDark = mode === "dark";
  }

  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}