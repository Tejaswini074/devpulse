const db = require("../../config/db");

class ProjectRepository {

    async create(data) {
        const sql = `
            INSERT INTO projects
                (organization_id, project_code, project_name, description, project_type, client_name,
                 status, priority, start_date, end_date, budget, project_manager, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.organization_id,
            data.project_code,
            data.project_name,
            data.description ?? null,
            data.project_type ?? "Internal",
            data.client_name ?? null,
            data.status ?? "Planned",
            data.priority ?? "Medium",
            data.start_date ?? null,
            data.end_date ?? null,
            data.budget ?? 0,
            data.project_manager,
            data.created_by
        ]);
        return result;
    }

    async findAll(organizationId, { limit, offset, status }) {
        let sql = `
            SELECT p.*, u.name AS project_manager_name,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.is_deleted = 0) AS task_count,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.is_deleted = 0 AND t.status = 'Done') AS completed_task_count
            FROM projects p
            LEFT JOIN users u ON u.id = p.project_manager
            WHERE p.organization_id = ? AND p.is_deleted = 0
        `;
        const params = [organizationId];

        if (status) {
            sql += " AND p.status = ?";
            params.push(status);
        }

        sql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    async count(organizationId, status) {
        let sql = "SELECT COUNT(*) AS total FROM projects WHERE organization_id = ? AND is_deleted = 0";
        const params = [organizationId];
        if (status) {
            sql += " AND status = ?";
            params.push(status);
        }
        const [rows] = await db.execute(sql, params);
        return rows[0].total;
    }

    async findById(id, organizationId) {
        const sql = `
            SELECT p.*, u.name AS project_manager_name
            FROM projects p
            LEFT JOIN users u ON u.id = p.project_manager
            WHERE p.id = ? AND p.organization_id = ? AND p.is_deleted = 0
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id, organizationId]);
        return rows[0];
    }

    async update(id, organizationId, data) {
        const sql = `
            UPDATE projects
            SET project_name = ?, description = ?, project_type = ?, client_name = ?,
                status = ?, priority = ?, progress = ?, start_date = ?, end_date = ?,
                budget = ?, project_manager = ?, updated_by = ?
            WHERE id = ? AND organization_id = ?
        `;
        const [result] = await db.execute(sql, [
            data.project_name,
            data.description ?? null,
            data.project_type ?? "Internal",
            data.client_name ?? null,
            data.status ?? "Planned",
            data.priority ?? "Medium",
            data.progress ?? 0,
            data.start_date ?? null,
            data.end_date ?? null,
            data.budget ?? 0,
            data.project_manager,
            data.updated_by,
            id,
            organizationId
        ]);
        return result;
    }

    async softDelete(id, organizationId) {
        const [result] = await db.execute(
            "UPDATE projects SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND organization_id = ?",
            [id, organizationId]
        );
        return result;
    }

    async addMember(projectId, userId, memberRole, assignedBy) {
        const sql = `
            INSERT INTO project_members (project_id, user_id, member_role, assigned_by)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE member_role = VALUES(member_role), status = 'Active', left_at = NULL
        `;
        const [result] = await db.execute(sql, [projectId, userId, memberRole ?? "Developer", assignedBy]);
        return result;
    }

    async removeMember(projectId, userId) {
        const [result] = await db.execute(
            "UPDATE project_members SET status = 'Removed', left_at = NOW() WHERE project_id = ? AND user_id = ?",
            [projectId, userId]
        );
        return result;
    }

    async findMembers(projectId) {
        const sql = `
            SELECT pm.id, pm.member_role, pm.allocation_percentage, pm.status, u.id AS user_id, u.name, u.email, u.role
            FROM project_members pm
            JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = ? AND pm.status = 'Active'
            ORDER BY pm.joined_at
        `;
        const [rows] = await db.execute(sql, [projectId]);
        return rows;
    }

    async isMember(projectId, userId) {
        const [rows] = await db.execute(
            "SELECT id FROM project_members WHERE project_id = ? AND user_id = ? AND status = 'Active' LIMIT 1",
            [projectId, userId]
        );
        return !!rows[0];
    }
}

module.exports = new ProjectRepository();
