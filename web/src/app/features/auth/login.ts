import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { AuthShell } from "../../shared/layout/auth-shell";

@Component({
  selector: "app-login",
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  templateUrl: "./login.html"
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal("");

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set("");

    const { email, password } = this.form.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? "Login failed. Please try again.");
      }
    });
  }
}
