import { Component, ElementRef, HostListener, OnInit, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { Router } from "@angular/router";
import { NotificationService } from "../../core/services/notification.service";
import { AppNotification } from "../../core/models/notification.model";
import { Icon } from "./icon";
import { EmptyState } from "./empty-state";

@Component({
  selector: "app-notification-bell",
  imports: [DatePipe, Icon, EmptyState],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggle()"
        class="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notifications"
      >
        <app-icon name="bell" [size]="18" />
        @if (unreadCount() > 0) {
          <span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
            {{ unreadCount() > 9 ? "9+" : unreadCount() }}
          </span>
        }
      </button>

      @if (open()) {
        <div class="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden transition-all duration-150 starting:opacity-0 starting:-translate-y-1">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <span class="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
            @if (unreadCount() > 0) {
              <button (click)="markAllRead()" class="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline">Mark all read</button>
            }
          </div>
          <div class="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            @for (n of notifications(); track n.id) {
              <button
                type="button"
                (click)="openNotification(n)"
                class="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                [class.bg-brand-50]="!n.is_read"
                [class.dark:bg-brand-500/5]="!n.is_read"
              >
                <div class="flex items-start gap-2">
                  @if (!n.is_read) {
                    <span class="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 shrink-0"></span>
                  }
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{{ n.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ n.message }}</p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ n.created_at | date: "MMM d, h:mm a" }}</p>
                  </div>
                </div>
              </button>
            } @empty {
              <app-empty-state icon="bell" title="You're all caught up" subtitle="New notifications will show up here." />
            }
          </div>
        </div>
      }
    </div>
  `
})
export class NotificationBell implements OnInit {
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);
  readonly unreadCount = signal(0);
  readonly notifications = signal<AppNotification[]>([]);

  ngOnInit(): void {
    this.refreshUnreadCount();
    this.notificationService.onNewNotification().subscribe((notification) => {
      this.notifications.update((list) => [notification, ...list]);
      this.unreadCount.update((c) => c + 1);
    });
  }

  private refreshUnreadCount(): void {
    this.notificationService.unreadCount().subscribe((res) => this.unreadCount.set(res.data.count));
  }

  toggle(): void {
    this.open.set(!this.open());
    if (this.open()) {
      this.notificationService.list().subscribe((res) => this.notifications.set(res.data.items));
    }
  }

  markAllRead(): void {
    this.notificationService.markAllRead().subscribe(() => {
      this.notifications.update((list) => list.map((n) => ({ ...n, is_read: 1 })));
      this.unreadCount.set(0);
    });
  }

  openNotification(notification: AppNotification): void {
    if (!notification.is_read) {
      this.notificationService.markRead(notification.id).subscribe(() => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === notification.id ? { ...n, is_read: 1 } : n))
        );
        this.unreadCount.update((c) => Math.max(0, c - 1));
      });
    }
    this.open.set(false);
    if (notification.action_url) {
      this.router.navigateByUrl(notification.action_url);
    }
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
