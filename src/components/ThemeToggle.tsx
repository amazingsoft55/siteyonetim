"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-md bg-transparent" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative inline-flex items-center justify-center rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label="Temayı değiştir"
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 text-zinc-900 dark:text-zinc-100 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-zinc-900 dark:text-zinc-100 transition-all" />
      )}
      <span className="sr-only">Temayı değiştir</span>
    </button>
  );
}

