import { Component, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
  selector: "app-signup",
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./signup.html"
})
export class Signup {
  readonly loading = signal(false);
  readonly errorMessage = signal("");

  readonly form = this.fb.group({
    organization_name: ["", [Validators.required, Validators.minLength(2)]],
    name: ["", [Validators.required, Validators.minLength(3)]],
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(8)]]
  });

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set("");

    this.auth.registerOrganization(this.form.getRawValue() as any).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(["/dashboard"]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? err?.error?.errors?.[0]?.msg ?? "Could not create your company.");
      }
    });
  }
}
