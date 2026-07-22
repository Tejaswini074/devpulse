const TaskRepository = require("./task.repository");
const { generateTaskCode } = require("../../utils/generateCode");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");
const ROLES = require("../../constants/roles");
const NotificationService = require("../notifications/notification.services");

class TaskService {

    async create(user, data) {
        const result = await TaskRepository.create({
            organization_id: user.organization_id,
            task_code: generateTaskCode(),
            project_id: data.project_id,
            sprint_id: data.sprint_id,
            assigned_to: data.assigned_to,
            title: data.title,
            description: data.description,
            task_type: data.task_type,
            priority: data.priority,
            severity: data.severity,
            status: data.status,
            estimated_hours: data.estimated_hours,
            due_date: data.due_date,
            created_by: user.id
        });

        if (data.assigned_to !== user.id) {
            await NotificationService.notify(user.organization_id, data.assigned_to, {
                title: "New task assigned to you",
                message: `You were assigned "${data.title}"`,
                type: "Task",
                action_url: `/tasks/${result.insertId}`
            });
        }

        return { id: result.insertId };
    }

    async list(organizationId, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const filters = {
            project_id: query.project_id,
            status: query.status,
            assigned_to: query.assigned_to
        };
        const [rows, total] = await Promise.all([
            TaskRepository.findAll(organizationId, filters, { limit, offset }),
            TaskRepository.count(organizationId, filters)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async getById(id, organizationId) {
        const task = await TaskRepository.findById(id, organizationId);
        if (!task) {
            throw new Error("Task not found");
        }
        return task;
    }

    async update(id, user, data) {
        const task = await TaskRepository.findById(id, user.organization_id);
        if (!task) {
            throw new Error("Task not found");
        }
        const newAssignee = data.assigned_to ?? task.assigned_to;
        await TaskRepository.update(id, user.organization_id, {
            ...data,
            assigned_to: newAssignee,
            sprint_id: data.sprint_id ?? task.sprint_id,
            updated_by: user.id
        });

        if (newAssignee !== task.assigned_to && newAssignee !== user.id) {
            await NotificationService.notify(user.organization_id, newAssignee, {
                title: "Task assigned to you",
                message: `You were assigned "${task.title}"`,
                type: "Task",
                action_url: `/tasks/${id}`
            });
        }

        return true;
    }

    async updateStatus(id, user, status) {
        const task = await TaskRepository.findById(id, user.organization_id);
        if (!task) {
            throw new Error("Task not found");
        }

        const isOwner = task.assigned_to === user.id;
        const isManager = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(user.role);

        if (!isOwner && !isManager) {
            throw new Error("You can only update the status of tasks assigned to you");
        }

        await TaskRepository.updateStatus(id, user.organization_id, status, user.id);
        await TaskRepository.recordHistory(id, user.id, "status", task.status, status);

        if (status === "Done" && task.created_by && task.created_by !== user.id) {
            await NotificationService.notify(user.organization_id, task.created_by, {
                title: "Task completed",
                message: `"${task.title}" was marked Done`,
                type: "Task",
                action_url: `/tasks/${id}`
            });
        }

        return true;
    }

    async remove(id, organizationId) {
        const task = await TaskRepository.findById(id, organizationId);
        if (!task) {
            throw new Error("Task not found");
        }
        await TaskRepository.softDelete(id, organizationId);
        return true;
    }
}

module.exports = new TaskService();
