const db = require("../../config/db");

class TeamRepository {

    async create(data) {
        const sql = `
            INSERT INTO teams (organization_id, team_name, description, manager_id)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.organization_id,
            data.team_name,
            data.description ?? null,
            data.manager_id ?? null
        ]);
        return result;
    }

    async findAll(organizationId, { limit, offset }) {
        const sql = `
            SELECT t.*, u.name AS manager_name,
                (SELECT COUNT(*) FROM users WHERE users.team_id = t.id AND users.is_deleted = 0) AS member_count
            FROM teams t
            LEFT JOIN users u ON u.id = t.manager_id
            WHERE t.organization_id = ?
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.query(sql, [organizationId, limit, offset]);
        return rows;
    }

    async count(organizationId) {
        const [rows] = await db.execute(
            "SELECT COUNT(*) AS total FROM teams WHERE organization_id = ?",
            [organizationId]
        );
        return rows[0].total;
    }

    async findById(id, organizationId) {
        const sql = `
            SELECT t.*, u.name AS manager_name
            FROM teams t
            LEFT JOIN users u ON u.id = t.manager_id
            WHERE t.id = ? AND t.organization_id = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id, organizationId]);
        return rows[0];
    }

    async findMembers(teamId) {
        const sql = `
            SELECT id, name, email, role, designation, status
            FROM users
            WHERE team_id = ? AND is_deleted = 0
            ORDER BY name
        `;
        const [rows] = await db.execute(sql, [teamId]);
        return rows;
    }

    async update(id, organizationId, data) {
        const sql = `
            UPDATE teams
            SET team_name = ?, description = ?, manager_id = ?, status = ?
            WHERE id = ? AND organization_id = ?
        `;
        const [result] = await db.execute(sql, [
            data.team_name,
            data.description ?? null,
            data.manager_id ?? null,
            data.status ?? "Active",
            id,
            organizationId
        ]);
        return result;
    }

    async setStatus(id, organizationId, status) {
        const [result] = await db.execute(
            "UPDATE teams SET status = ? WHERE id = ? AND organization_id = ?",
            [status, id, organizationId]
        );
        return result;
    }
}

module.exports = new TeamRepository();
