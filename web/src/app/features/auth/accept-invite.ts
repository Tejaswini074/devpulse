import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { InviteService } from "../../core/services/invite.service";

@Component({
  selector: "app-accept-invite",
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./accept-invite.html"
})
export class AcceptInvite implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inviteService = inject(InviteService);

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly errorMessage = signal("");
  readonly success = signal(false);
  readonly invitee = signal<{ name: string; email: string; role: string; designation: string | null } | null>(null);

  private token = "";

  readonly form = this.fb.group({
    password: ["", [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get("token") ?? "";

    this.inviteService.verify(this.token).subscribe({
      next: (res) => {
        this.invitee.set(res.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message ?? "This invite link is invalid or has expired.");
        this.loading.set(false);
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set("");

    const { password } = this.form.getRawValue();
    this.inviteService.accept(this.token, password!).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigate(["/login"]), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message ?? "Could not accept invite. Please try again.");
      }
    });
  }
}
