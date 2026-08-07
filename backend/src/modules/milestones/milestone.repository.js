const db = require("../../config/db");

class MilestoneRepository {

    async create(data) {
        const sql = `
            INSERT INTO milestones (project_id, title, description, target_date, created_by)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.project_id,
            data.title,
            data.description ?? null,
            data.target_date || null,
            data.created_by
        ]);
        return result;
    }

    async findByProject(projectId, organizationId) {
        const sql = `
            SELECT m.*
            FROM milestones m
            JOIN projects p ON p.id = m.project_id
            WHERE m.project_id = ? AND p.organization_id = ?
            ORDER BY m.target_date IS NULL, m.target_date ASC
        `;
        const [rows] = await db.execute(sql, [projectId, organizationId]);
        return rows;
    }

    async findById(id, organizationId) {
        const sql = `
            SELECT m.*
            FROM milestones m
            JOIN projects p ON p.id = m.project_id
            WHERE m.id = ? AND p.organization_id = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id, organizationId]);
        return rows[0];
    }

    async update(id, data) {
        const sql = `
            UPDATE milestones
            SET title = ?, description = ?, target_date = ?
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [
            data.title,
            data.description ?? null,
            data.target_date || null,
            id
        ]);
        return result;
    }

    async updateStatus(id, status) {
        const [result] = await db.execute(
            "UPDATE milestones SET status = ? WHERE id = ?",
            [status, id]
        );
        return result;
    }

    async remove(id) {
        const [result] = await db.execute("DELETE FROM milestones WHERE id = ?", [id]);
        return result;
    }
}

module.exports = new MilestoneRepository();
