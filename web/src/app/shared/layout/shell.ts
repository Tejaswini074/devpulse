import { Component, computed } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { Icon } from "../components/icon";

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
  { label: "Reports", path: "/reports", icon: "bar-chart" },
  { label: "Team", path: "/team", icon: "users", roles: ["Admin", "Super Admin", "Manager"] },
  { label: "Admin", path: "/admin", icon: "settings", roles: ["Admin", "Super Admin"] }
];

@Component({
  selector: "app-shell",
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: "./shell.html"
})
export class Shell {
  readonly navItems = NAV_ITEMS;

  constructor(protected auth: AuthService) {}

  readonly visibleNavItems = computed(() =>
    this.navItems.filter((item) => !item.roles || this.auth.hasAnyRole(item.roles))
  );

  logout(): void {
    this.auth.logout();
  }
}
