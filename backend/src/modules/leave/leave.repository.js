const db = require("../../config/db");

class LeaveRepository {

    async create(data) {
        const sql = `
            INSERT INTO leave_requests
                (organization_id, user_id, leave_type, start_date, end_date, total_days, reason)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.organization_id,
            data.user_id,
            data.leave_type ?? null,
            data.start_date,
            data.end_date,
            data.total_days,
            data.reason ?? null
        ]);
        return result;
    }

    async findMine(userId, { limit, offset }) {
        const sql = `
            SELECT * FROM leave_requests
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await db.query(sql, [userId, limit, offset]);
        return rows;
    }

    async countMine(userId) {
        const [rows] = await db.execute(
            "SELECT COUNT(*) AS total FROM leave_requests WHERE user_id = ?",
            [userId]
        );
        return rows[0].total;
    }

    async findTeamRequests(organizationId, managerId, { limit, offset }) {
        let sql = `
            SELECT lr.*, u.name AS user_name, u.team_id
            FROM leave_requests lr
            JOIN users u ON u.id = lr.user_id
            LEFT JOIN teams t ON t.id = u.team_id
            WHERE lr.organization_id = ?
        `;
        const params = [organizationId];

        if (managerId) {
            sql += " AND t.manager_id = ?";
            params.push(managerId);
        }

        sql += " ORDER BY lr.status = 'Pending' DESC, lr.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    async countTeamRequests(organizationId, managerId) {
        let sql = `
            SELECT COUNT(*) AS total
            FROM leave_requests lr
            JOIN users u ON u.id = lr.user_id
            LEFT JOIN teams t ON t.id = u.team_id
            WHERE lr.organization_id = ?
        `;
        const params = [organizationId];
        if (managerId) {
            sql += " AND t.manager_id = ?";
            params.push(managerId);
        }
        const [rows] = await db.execute(sql, params);
        return rows[0].total;
    }

    async findById(id, organizationId) {
        const [rows] = await db.execute(
            "SELECT * FROM leave_requests WHERE id = ? AND organization_id = ?",
            [id, organizationId]
        );
        return rows[0];
    }

    async updateStatus(id, status, approvedBy, remarks) {
        const [result] = await db.execute(
            `UPDATE leave_requests
             SET status = ?, approved_by = ?, approved_at = NOW(), remarks = ?
             WHERE id = ?`,
            [status, approvedBy, remarks ?? null, id]
        );
        return result;
    }

    async cancel(id) {
        const [result] = await db.execute(
            "UPDATE leave_requests SET status = 'Cancelled' WHERE id = ?",
            [id]
        );
        return result;
    }

    async findManagerForUser(userId) {
        const sql = `
            SELECT t.manager_id
            FROM users u
            LEFT JOIN teams t ON t.id = u.team_id
            WHERE u.id = ?
            LIMIT 1
        `;
        const [rows] = await db.execute(sql, [userId]);
        return rows[0]?.manager_id ?? null;
    }

    async findAdmins(organizationId) {
        const [rows] = await db.execute(
            `SELECT id FROM users
             WHERE organization_id = ? AND role IN ('Admin', 'Super Admin') AND is_deleted = 0`,
            [organizationId]
        );
        return rows.map((r) => r.id);
    }
}

module.exports = new LeaveRepository();
