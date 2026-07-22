import { Component, computed, inject, signal } from "@angular/core";
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { filter } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { ThemeService } from "../../core/services/theme.service";
import { Icon } from "../components/icon";
import { NotificationBell } from "../components/notification-bell";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Projects", path: "/projects", icon: "folder" },
  { label: "Tasks", path: "/tasks", icon: "check-square" },
  { label: "Daily Logs", path: "/daily-logs", icon: "clock" },
  { label: "Leave", path: "/leave", icon: "briefcase" },
  { label: "Reports", path: "/reports", icon: "bar-chart" },
  { label: "Team", path: "/team", icon: "users", roles: ["Admin", "Super Admin", "Manager"] },
  { label: "Admin", path: "/admin", icon: "settings", roles: ["Admin", "Super Admin"] }
];

@Component({
  selector: "app-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, NotificationBell],
  templateUrl: "./shell.html"
})
export class Shell {
  protected auth = inject(AuthService);
  protected themeService = inject(ThemeService);
  private router = inject(Router);

  readonly navItems = NAV_ITEMS;
  readonly sidebarOpen = signal(false);
  readonly theme = this.themeService.theme;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.sidebarOpen.set(false));
  }

  readonly visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.roles || this.auth.hasAnyRole(item.roles))
  );

  toggleTheme(): void {
    this.themeService.toggle();
  }

  toggleSidebar(): void {
    this.sidebarOpen.set(!this.sidebarOpen());
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
