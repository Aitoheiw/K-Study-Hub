"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("krdict:theme") as Theme | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);

  function applyTheme(t: Theme) {
    const html = document.documentElement;

    // Remove both theme classes first
    html.classList.remove("theme-light", "theme-dark");

    if (t === "light") {
      html.classList.add("theme-light");
    } else if (t === "dark") {
      html.classList.add("theme-dark");
    }
    // "system" = no class added, uses media query automatically

    // Force a repaint to ensure styles are applied
    html.style.display = "none";
    html.offsetHeight; // Trigger reflow
    html.style.display = "";
  }

  function toggleTheme() {
    let next: Theme;
    if (theme === "system") {
      next = "light";
    } else if (theme === "light") {
      next = "dark";
    } else {
      next = "system";
    }

    setTheme(next);
    localStorage.setItem("krdict:theme", next);
    applyTheme(next);
  }

  if (!mounted) {
    return (
      <button className="theme-toggle" aria-label="Changer de thème">
        ⏳
      </button>
    );
  }

  const icon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🔄";
  const label =
    theme === "light"
      ? "Mode clair"
      : theme === "dark"
      ? "Mode sombre"
      : "Auto (système)";

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Thème: ${label}. Cliquez pour changer.`}
      title={`Thème: ${label}`}
    >
      {icon}
    </button>
  );
}
