import { Component } from "@angular/core";
import { Icon } from "../components/icon";

const FEATURES = [
  { icon: "check-square", text: "Kanban boards with real-time drag-and-drop" },
  { icon: "github", text: "Automatic GitHub commit activity sync" },
  { icon: "bar-chart", text: "Weekly productivity insights, per person and team" }
];

@Component({
  selector: "app-auth-shell",
  imports: [Icon],
  templateUrl: "./auth-shell.html"
})
export class AuthShell {
  readonly features = FEATURES;
}
