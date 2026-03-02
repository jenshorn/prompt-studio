export type ThemePreference = "light" | "dark";

export const applyThemePreference = (theme: ThemePreference) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const body = document.body;
  const opposite = theme === "dark" ? "light" : "dark";

  for (const el of [root, body]) {
    if (!el) continue;
    el.classList.remove(opposite);
    el.classList.add(theme);
    el.setAttribute("data-theme", theme);
    el.style.colorScheme = theme;
  }
};
