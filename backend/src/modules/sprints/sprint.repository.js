const db = require("../../config/db");

class SprintRepository {

    async create(data) {
        const sql = `
            INSERT INTO sprints (project_id, sprint_name, goal, start_date, end_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.project_id,
            data.sprint_name,
            data.goal ?? null,
            data.start_date || null,
            data.end_date || null,
            data.created_by
        ]);
        return result;
    }

    async findByProject(projectId, organizationId) {
        const sql = `
            SELECT s.*
            FROM sprints s
            JOIN projects p ON p.id = s.project_id
            WHERE s.project_id = ? AND p.organization_id = ?
            ORDER BY s.created_at DESC
        `;
        const [rows] = await db.execute(sql, [projectId, organizationId]);
        return rows;
    }

    async findById(id, organizationId) {
        const sql = `
            SELECT s.*
            FROM sprints s
            JOIN projects p ON p.id = s.project_id
            WHERE s.id = ? AND p.organization_id = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id, organizationId]);
        return rows[0];
    }

    async findTasks(sprintId) {
        const sql = `
            SELECT t.*, u.name AS assigned_to_name
            FROM tasks t
            JOIN users u ON u.id = t.assigned_to
            WHERE t.sprint_id = ? AND t.is_deleted = 0
            ORDER BY t.priority DESC, t.created_at ASC
        `;
        const [rows] = await db.execute(sql, [sprintId]);
        return rows;
    }

    async update(id, data) {
        const sql = `
            UPDATE sprints
            SET sprint_name = ?, goal = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [
            data.sprint_name,
            data.goal ?? null,
            data.start_date || null,
            data.end_date || null,
            id
        ]);
        return result;
    }

    async updateStatus(id, status) {
        const [result] = await db.execute("UPDATE sprints SET status = ? WHERE id = ?", [status, id]);
        return result;
    }

    async remove(id) {
        const [result] = await db.execute("DELETE FROM sprints WHERE id = ?", [id]);
        return result;
    }
}

module.exports = new SprintRepository();
