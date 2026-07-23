import { Component, OnInit, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { AuthService } from "../../core/services/auth.service";
import { GithubService } from "../../core/services/github.service";
import { ToastService } from "../../core/services/toast.service";
import { UserProfile } from "../../core/models/user.model";
import { Icon } from "../../shared/components/icon";
import { Tabs, TabItem } from "../../shared/components/tabs";
import { Skeleton } from "../../shared/components/skeleton";

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get("newPassword")?.value;
  const confirmPassword = control.get("confirmPassword")?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword ? { mismatch: true } : null;
}

const TABS: TabItem[] = [
  { id: "profile", label: "Profile" },
  { id: "github", label: "GitHub" },
  { id: "security", label: "Security" }
];

@Component({
  selector: "app-profile",
  imports: [ReactiveFormsModule, DatePipe, Icon, Tabs, Skeleton],
  templateUrl: "./profile.html"
})
export class Profile implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private githubService = inject(GithubService);
  private toast = inject(ToastService);

  readonly tabs = TABS;
  readonly activeTab = signal("profile");
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly syncing = signal(false);
  readonly changingPassword = signal(false);
  readonly profile = signal<UserProfile | null>(null);

  readonly profileForm = this.fb.group({
    name: ["", [Validators.required, Validators.minLength(3)]],
    designation: [""],
    department: [""]
  });

  readonly githubForm = this.fb.group({
    github_username: [""]
  });

  readonly passwordForm = this.fb.group(
    {
      currentPassword: ["", [Validators.required]],
      newPassword: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  ngOnInit(): void {
    this.auth.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res.data);
        this.profileForm.patchValue({
          name: res.data.name,
          designation: res.data.designation ?? "",
          department: res.data.department ?? ""
        });
        this.githubForm.patchValue({ github_username: res.data.github_username ?? "" });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  setTab(tab: string): void {
    this.activeTab.set(tab);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.auth.updateProfile(this.profileForm.getRawValue() as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success("Profile updated");
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? "Could not update profile.");
      }
    });
  }

  saveGithubUsername(): void {
    const username = this.githubForm.getRawValue().github_username?.trim() ?? "";
    this.saving.set(true);
    this.githubService.setUsername(username).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success("GitHub username saved");
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(err?.error?.message ?? "Could not save GitHub username.");
      }
    });
  }

  syncGithub(): void {
    this.syncing.set(true);
    this.githubService.sync().subscribe({
      next: (res) => {
        this.syncing.set(false);
        if (res.data.synced) {
          this.toast.success(`Synced ${res.data.daysUpdated ?? 0} day(s) of GitHub activity`);
        } else {
          this.toast.error(res.data.reason ?? "Nothing to sync.");
        }
      },
      error: (err) => {
        this.syncing.set(false);
        this.toast.error(err?.error?.message ?? "GitHub sync failed.");
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.changingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.auth.changePassword(currentPassword!, newPassword!).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.toast.success("Password changed. Please sign in again.");
        setTimeout(() => this.auth.logout(), 1500);
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.toast.error(err?.error?.message ?? "Could not change password.");
      }
    });
  }
}
