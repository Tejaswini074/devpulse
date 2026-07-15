import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";
import { AuthShell } from "../../shared/layout/auth-shell";

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get("password")?.value;
  const confirmPassword = control.get("confirmPassword")?.value;
  return password && confirmPassword && password !== confirmPassword ? { mismatch: true } : null;
}

@Component({
  selector: "app-reset-password",
  imports: [ReactiveFormsModule, RouterLink, AuthShell],
  templateUrl: "./reset-password.html"
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal("");
  readonly success = signal(false);

  private token = this.route.snapshot.paramMap.get("token") ?? "";

  readonly form = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required]]
    },
    { validators: passwordsMatch }
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set("");

    const { password } = this.form.getRawValue();
    this.auth.resetPassword(this.token, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(["/login"]), 1500);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? "This reset link is invalid or has expired.");
      }
    });
  }
}
