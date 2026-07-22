const CommentRepository = require("./comment.repository");
const TaskRepository = require("../tasks/task.repository");
const UserRepository = require("../users/user.repository");
const NotificationService = require("../notifications/notification.services");
const ROLES = require("../../constants/roles");

class CommentService {

    async listByTask(taskId, organizationId) {
        const task = await TaskRepository.findById(taskId, organizationId);
        if (!task) {
            throw new Error("Task not found");
        }
        return CommentRepository.findByTask(taskId);
    }

    async create(taskId, user, comment, parentCommentId) {
        const task = await TaskRepository.findById(taskId, user.organization_id);
        if (!task) {
            throw new Error("Task not found");
        }

        const result = await CommentRepository.create(taskId, user.id, comment, parentCommentId);

        if (task.assigned_to !== user.id) {
            const author = await UserRepository.findById(user.id, user.organization_id);
            await NotificationService.notify(user.organization_id, task.assigned_to, {
                title: "New comment on your task",
                message: `${author?.name ?? "Someone"} commented on "${task.title}"`,
                type: "Comment",
                action_url: `/tasks/${taskId}`
            });
        }

        return { id: result.insertId };
    }

    async update(id, user, comment) {
        const existing = await CommentRepository.findById(id);
        if (!existing) {
            throw new Error("Comment not found");
        }
        const task = await TaskRepository.findById(existing.task_id, user.organization_id);
        if (!task) {
            throw new Error("Comment not found");
        }
        if (existing.user_id !== user.id) {
            throw new Error("You can only edit your own comments");
        }
        await CommentRepository.update(id, comment);
        return true;
    }

    async remove(id, user) {
        const existing = await CommentRepository.findById(id);
        if (!existing) {
            throw new Error("Comment not found");
        }
        const task = await TaskRepository.findById(existing.task_id, user.organization_id);
        if (!task) {
            throw new Error("Comment not found");
        }

        const isOwner = existing.user_id === user.id;
        const isManager = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(user.role);
        if (!isOwner && !isManager) {
            throw new Error("You do not have permission to delete this comment");
        }

        const replyCount = await CommentRepository.countReplies(id);
        if (replyCount > 0) {
            throw new Error("Cannot delete a comment that has replies");
        }

        await CommentRepository.remove(id);
        return true;
    }
}

module.exports = new CommentService();
