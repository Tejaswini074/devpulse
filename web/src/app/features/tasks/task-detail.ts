import { Component, EventEmitter, Input, OnChanges, Output, inject, signal } from "@angular/core";
import { DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskService } from "../../core/services/task.service";
import { CommentService } from "../../core/services/comment.service";
import { AttachmentService } from "../../core/services/attachment.service";
import { SprintService } from "../../core/services/sprint.service";
import { AuthService } from "../../core/services/auth.service";
import { ToastService } from "../../core/services/toast.service";
import { OrgUser } from "../../core/services/user.service";
import { Task, TaskStatus } from "../../core/models/task.model";
import { TaskComment } from "../../core/models/comment.model";
import { Attachment } from "../../core/models/attachment.model";
import { Sprint } from "../../core/models/sprint.model";
import { Modal } from "../../shared/components/modal";
import { Icon } from "../../shared/components/icon";
import { Skeleton } from "../../shared/components/skeleton";
import { EmptyState } from "../../shared/components/empty-state";

@Component({
  selector: "app-task-detail",
  imports: [FormsModule, DatePipe, Modal, Icon, Skeleton, EmptyState],
  templateUrl: "./task-detail.html"
})
export class TaskDetail implements OnChanges {
  private taskService = inject(TaskService);
  private commentService = inject(CommentService);
  private attachmentService = inject(AttachmentService);
  private sprintService = inject(SprintService);
  private toast = inject(ToastService);
  protected auth = inject(AuthService);

  @Input() taskId: number | null = null;
  @Input() orgUsers: OrgUser[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  readonly loading = signal(true);
  readonly task = signal<Task | null>(null);
  readonly comments = signal<TaskComment[]>([]);
  readonly attachments = signal<Attachment[]>([]);
  readonly sprints = signal<Sprint[]>([]);
  readonly uploading = signal(false);

  newComment = "";
  replyingToId: number | null = null;
  replyText = "";
  editingCommentId: number | null = null;
  editText = "";

  get open(): boolean {
    return this.taskId !== null;
  }

  ngOnChanges(): void {
    if (this.taskId !== null) {
      this.load(this.taskId);
    }
  }

  private load(taskId: number): void {
    this.loading.set(true);
    this.taskService.getById(taskId).subscribe((res) => {
      this.task.set(res.data);
      this.loading.set(false);
      this.sprintService.listByProject(res.data.project_id).subscribe((sres) => this.sprints.set(sres.data));
    });
    this.loadComments(taskId);
    this.loadAttachments(taskId);
  }

  private loadComments(taskId: number): void {
    this.commentService.listByTask(taskId).subscribe((res) => this.comments.set(res.data));
  }

  private loadAttachments(taskId: number): void {
    this.attachmentService.listByRecord("Task", taskId).subscribe((res) => this.attachments.set(res.data));
  }

  topLevelComments(): TaskComment[] {
    return this.comments().filter((c) => !c.parent_comment_id);
  }

  repliesFor(commentId: number): TaskComment[] {
    return this.comments().filter((c) => c.parent_comment_id === commentId);
  }

  isOwnComment(comment: TaskComment): boolean {
    return comment.user_id === this.auth.currentUser()?.id;
  }

  canManage(): boolean {
    return this.auth.hasAnyRole(["Admin", "Super Admin", "Manager"]);
  }

  onClose(): void {
    this.close.emit();
  }

  changeStatus(status: TaskStatus): void {
    const task = this.task();
    if (!task) return;
    this.taskService.updateStatus(task.id, status).subscribe({
      next: () => {
        this.task.set({ ...task, status });
        this.toast.success(`Status changed to ${status}`);
        this.updated.emit();
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not update status.")
    });
  }

  reassign(userId: number): void {
    const task = this.task();
    if (!task) return;
    this.taskService.update(task.id, { ...task, assigned_to: userId }).subscribe({
      next: () => {
        this.task.set({ ...task, assigned_to: userId });
        this.toast.success("Task reassigned");
        this.updated.emit();
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not reassign task.")
    });
  }

  assignSprint(sprintId: string): void {
    const task = this.task();
    if (!task) return;
    const parsed = sprintId ? Number(sprintId) : null;
    this.taskService.update(task.id, { ...task, sprint_id: parsed }).subscribe({
      next: () => {
        this.toast.success("Sprint updated");
        this.updated.emit();
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not update sprint.")
    });
  }

  submitComment(): void {
    const task = this.task();
    if (!task || !this.newComment.trim()) return;
    this.commentService.create(task.id, this.newComment.trim()).subscribe({
      next: () => {
        this.newComment = "";
        this.loadComments(task.id);
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not add comment.")
    });
  }

  startReply(commentId: number): void {
    this.replyingToId = commentId;
    this.replyText = "";
  }

  cancelReply(): void {
    this.replyingToId = null;
    this.replyText = "";
  }

  submitReply(parentId: number): void {
    const task = this.task();
    if (!task || !this.replyText.trim()) return;
    this.commentService.create(task.id, this.replyText.trim(), parentId).subscribe({
      next: () => {
        this.cancelReply();
        this.loadComments(task.id);
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not add reply.")
    });
  }

  startEdit(comment: TaskComment): void {
    this.editingCommentId = comment.id;
    this.editText = comment.comment;
  }

  cancelEdit(): void {
    this.editingCommentId = null;
    this.editText = "";
  }

  saveEdit(commentId: number): void {
    const task = this.task();
    if (!task || !this.editText.trim()) return;
    this.commentService.update(commentId, this.editText.trim()).subscribe({
      next: () => {
        this.cancelEdit();
        this.loadComments(task.id);
      },
      error: (err) => this.toast.error(err?.error?.message ?? "Could not update comment.")
    });
  }

  deleteComment(commentId: number): void {
    const task = this.task();
    if (!task) return;
    this.commentService.remove(commentId).subscribe({
      next: () => this.loadComments(task.id),
      error: (err) => this.toast.error(err?.error?.message ?? "Could not delete comment.")
    });
  }

  onFileSelected(event: Event): void {
    const task = this.task();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!task || !file) return;

    this.uploading.set(true);
    this.attachmentService.upload("Task", task.id, file).subscribe({
      next: () => {
        this.uploading.set(false);
        input.value = "";
        this.loadAttachments(task.id);
        this.toast.success("File uploaded");
      },
      error: (err) => {
        this.uploading.set(false);
        this.toast.error(err?.error?.message ?? "Upload failed.");
      }
    });
  }

  downloadAttachment(attachment: Attachment): void {
    this.attachmentService.download(attachment.id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.file_name;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  deleteAttachment(attachment: Attachment): void {
    const task = this.task();
    if (!task) return;
    this.attachmentService.remove(attachment.id).subscribe({
      next: () => this.loadAttachments(task.id),
      error: (err) => this.toast.error(err?.error?.message ?? "Could not delete attachment.")
    });
  }

  formatSize(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
