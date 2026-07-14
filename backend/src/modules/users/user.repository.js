const db = require("../../config/db");

class UserRepository {

    async findAll(organizationId, { limit, offset, role, teamId }) {
        let sql = `
            SELECT id, employee_code, name, email, role, designation, department, team_id,
                   github_username, status, profile_photo, created_at
            FROM users
            WHERE organization_id = ? AND is_deleted = 0
        `;
        const params = [organizationId];

        if (role) {
            sql += " AND role = ?";
            params.push(role);
        }
        if (teamId) {
            sql += " AND team_id = ?";
            params.push(teamId);
        }

        sql += " ORDER BY name LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    async count(organizationId, { role, teamId }) {
        let sql = "SELECT COUNT(*) AS total FROM users WHERE organization_id = ? AND is_deleted = 0";
        const params = [organizationId];
        if (role) {
            sql += " AND role = ?";
            params.push(role);
        }
        if (teamId) {
            sql += " AND team_id = ?";
            params.push(teamId);
        }
        const [rows] = await db.query(sql, params);
        return rows[0].total;
    }

    async findById(id, organizationId) {
        const sql = `
            SELECT id, employee_code, name, email, role, designation, department, team_id,
                   github_username, status, profile_photo, created_at
            FROM users
            WHERE id = ? AND organization_id = ? AND is_deleted = 0
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [id, organizationId]);
        return rows[0];
    }

    async update(id, organizationId, data) {
        const sql = `
            UPDATE users
            SET role = ?, team_id = ?, designation = ?, department = ?, status = ?
            WHERE id = ? AND organization_id = ?
        `;
        const [result] = await db.execute(sql, [
            data.role,
            data.team_id ?? null,
            data.designation ?? null,
            data.department ?? null,
            data.status,
            id,
            organizationId
        ]);
        return result;
    }

    async softDelete(id, organizationId) {
        const [result] = await db.execute(
            "UPDATE users SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND organization_id = ?",
            [id, organizationId]
        );
        return result;
    }
}

module.exports = new UserRepository();
