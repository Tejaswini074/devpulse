import { Injectable, signal } from "@angular/core";

const THEME_KEY = "devpulse_theme";
type Theme = "light" | "dark";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.readInitialTheme());
  readonly theme = this.themeSignal.asReadonly();

  constructor() {
    this.apply(this.themeSignal());
  }

  private readInitialTheme(): Theme {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  private apply(theme: Theme): void {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }

  toggle(): void {
    const next: Theme = this.themeSignal() === "dark" ? "light" : "dark";
    this.themeSignal.set(next);
    localStorage.setItem(THEME_KEY, next);
    this.apply(next);
  }
}
