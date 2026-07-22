const db = require("../../config/db");

class ActivityLogRepository {

    async findAll(organizationId, filters, { limit, offset }) {
        let sql = `
            SELECT al.*, u.name AS user_name
            FROM activity_logs al
            LEFT JOIN users u ON u.id = al.user_id
            WHERE al.organization_id = ?
        `;
        const params = [organizationId];

        if (filters.module_name) {
            sql += " AND al.module_name = ?";
            params.push(filters.module_name);
        }
        if (filters.user_id) {
            sql += " AND al.user_id = ?";
            params.push(filters.user_id);
        }
        if (filters.from) {
            sql += " AND al.created_at >= ?";
            params.push(filters.from);
        }
        if (filters.to) {
            sql += " AND al.created_at <= ?";
            params.push(`${filters.to} 23:59:59`);
        }

        sql += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    async count(organizationId, filters) {
        let sql = "SELECT COUNT(*) AS total FROM activity_logs WHERE organization_id = ?";
        const params = [organizationId];

        if (filters.module_name) {
            sql += " AND module_name = ?";
            params.push(filters.module_name);
        }
        if (filters.user_id) {
            sql += " AND user_id = ?";
            params.push(filters.user_id);
        }
        if (filters.from) {
            sql += " AND created_at >= ?";
            params.push(filters.from);
        }
        if (filters.to) {
            sql += " AND created_at <= ?";
            params.push(`${filters.to} 23:59:59`);
        }

        const [rows] = await db.execute(sql, params);
        return rows[0].total;
    }
}

module.exports = new ActivityLogRepository();
