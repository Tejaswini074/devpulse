const db = require("../../config/db");

class TaskRepository {

    async create(data) {
        const sql = `
            INSERT INTO tasks
                (organization_id, task_code, project_id, assigned_to, title, description,
                 task_type, priority, severity, status, estimated_hours, due_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.organization_id,
            data.task_code,
            data.project_id,
            data.assigned_to,
            data.title,
            data.description ?? null,
            data.task_type ?? "Task",
            data.priority ?? "Medium",
            data.severity ?? "Medium",
            data.status ?? "Todo",
            data.estimated_hours ?? null,
            data.due_date ?? null,
            data.created_by
        ]);
        return result;
    }

    async findAll(organizationId, filters, { limit, offset }) {
        let sql = `
            SELECT t.*, u.name AS assigned_to_name, p.project_name
            FROM tasks t
            JOIN users u ON u.id = t.assigned_to
            JOIN projects p ON p.id = t.project_id
            WHERE t.organization_id = ? AND t.is_deleted = 0
        `;
        const params = [organizationId];

        if (filters.project_id) {
            sql += " AND t.project_id = ?";
            params.push(filters.project_id);
        }
        if (filters.status) {
            sql += " AND t.status = ?";
            params.push(filters.status);
        }
        if (filters.assigned_to) {
            sql += " AND t.assigned_to = ?";
            params.push(filters.assigned_to);
        }

        sql += " ORDER BY t.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    async count(organizationId, filters) {
        let sql = "SELECT COUNT(*) AS total FROM tasks WHERE organization_id = ? AND is_deleted = 0";
        const params = [organizationId];
        if (filters.project_id) {
            sql += " AND project_id = ?";
            params.push(filters.project_id);
        }
        if (filters.status) {
            sql += " AND status = ?";
            params.push(filters.status);
        }
        if (filters.assigned_to) {
            sql += " AND assigned_to = ?";
            params.push(filters.assigned_to);
        }
        const [rows] = await db.execute(sql, params);
        return rows[0].total;
    }

    async findById(id, organizationId) {
        const sql = `
            SELECT t.*, u.name AS assigned_to_name, p.project_name
            FROM tasks t
            JOIN users u ON u.id = t.assigned_to
            JOIN projects p ON p.id = t.project_id
            WHERE t.id = ? AND t.organization_id = ? AND t.is_deleted = 0
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id, organizationId]);
        return rows[0];
    }

    async update(id, organizationId, data) {
        const sql = `
            UPDATE tasks
            SET title = ?, description = ?, assigned_to = ?, task_type = ?, priority = ?, severity = ?,
                status = ?, estimated_hours = ?, due_date = ?, progress = ?, updated_by = ?
            WHERE id = ? AND organization_id = ?
        `;
        const [result] = await db.execute(sql, [
            data.title,
            data.description ?? null,
            data.assigned_to,
            data.task_type ?? "Task",
            data.priority ?? "Medium",
            data.severity ?? "Medium",
            data.status ?? "Todo",
            data.estimated_hours ?? null,
            data.due_date ?? null,
            data.progress ?? 0,
            data.updated_by,
            id,
            organizationId
        ]);
        return result;
    }

    async updateStatus(id, organizationId, status, updatedBy) {
        const completedDate = status === "Done" ? new Date() : null;
        const sql = `
            UPDATE tasks
            SET status = ?, updated_by = ?, completed_date = ?
            WHERE id = ? AND organization_id = ?
        `;
        const [result] = await db.execute(sql, [status, updatedBy, completedDate, id, organizationId]);
        return result;
    }

    async softDelete(id, organizationId) {
        const [result] = await db.execute(
            "UPDATE tasks SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND organization_id = ?",
            [id, organizationId]
        );
        return result;
    }

    async recordHistory(taskId, changedBy, fieldName, oldValue, newValue) {
        const sql = `
            INSERT INTO task_history (task_id, changed_by, field_name, old_value, new_value)
            VALUES (?, ?, ?, ?, ?)
        `;
        await db.execute(sql, [taskId, changedBy, fieldName, String(oldValue ?? ""), String(newValue ?? "")]);
    }

    async countCompletedByUserSince(userId, since) {
        const [rows] = await db.execute(
            `SELECT COUNT(*) AS total FROM tasks
             WHERE assigned_to = ? AND status = 'Done' AND is_deleted = 0 AND completed_date >= ?`,
            [userId, since]
        );
        return rows[0].total;
    }

    async dailyCompletedBreakdown(userId, from, to) {
        const [rows] = await db.execute(
            `SELECT DATE(completed_date) AS completed_date, COUNT(*) AS total
             FROM tasks
             WHERE assigned_to = ? AND status = 'Done' AND is_deleted = 0
                AND completed_date BETWEEN ? AND ?
             GROUP BY DATE(completed_date)`,
            [userId, from, `${to} 23:59:59`]
        );
        return rows;
    }

    async countAssignedByUserSince(userId, since) {
        const [rows] = await db.execute(
            `SELECT COUNT(*) AS total FROM tasks
             WHERE assigned_to = ? AND is_deleted = 0 AND created_at >= ?`,
            [userId, since]
        );
        return rows[0].total;
    }
}

module.exports = new TaskRepository();
