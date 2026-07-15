import { Component, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-forgot-password",
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./forgot-password.html"
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  readonly loading = signal(false);
  readonly errorMessage = signal("");
  readonly submitted = signal(false);

  readonly form = this.fb.group({
    email: ["", [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set("");

    const { email } = this.form.getRawValue();
    this.auth.forgotPassword(email!).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? "Something went wrong. Please try again.");
      }
    });
  }
}
