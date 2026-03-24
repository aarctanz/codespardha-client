import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("spring:theme") as Theme | null;
    return saved ?? "system";
  });

  const setTheme = useCallback((t: Theme) => {
    localStorage.setItem("spring:theme", t);
    document.documentElement.classList.add("theme-transition");
    setThemeState(t);
    applyTheme(t);
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 350);
  }, []);

  // Apply on mount and listen for system changes
  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const resolved: "light" | "dark" =
    theme === "system" ? getSystemTheme() : theme;

  return { theme, resolved, setTheme };
}
