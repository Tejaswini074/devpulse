const db = require("../../config/db");

class DailyLogRepository {

    async create(data) {
        const sql = `
            INSERT INTO daily_logs
                (log_code, user_id, project_id, task_id, log_type, hours_worked, work_description, work_status, log_date, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.log_code,
            data.user_id,
            data.project_id,
            data.task_id,
            data.log_type ?? "Development",
            data.hours_worked,
            data.work_description,
            data.work_status ?? "Completed",
            data.log_date,
            data.created_by
        ]);
        return result;
    }

    async findAll(organizationId, filters, { limit, offset }) {
        let sql = `
            SELECT dl.*, u.name AS user_name, p.project_name, t.title AS task_title
            FROM daily_logs dl
            JOIN users u ON u.id = dl.user_id
            JOIN projects p ON p.id = dl.project_id
            JOIN tasks t ON t.id = dl.task_id
            WHERE u.organization_id = ? AND dl.is_deleted = 0
        `;
        const params = [organizationId];

        if (filters.user_id) {
            sql += " AND dl.user_id = ?";
            params.push(filters.user_id);
        }
        if (filters.project_id) {
            sql += " AND dl.project_id = ?";
            params.push(filters.project_id);
        }
        if (filters.from) {
            sql += " AND dl.log_date >= ?";
            params.push(filters.from);
        }
        if (filters.to) {
            sql += " AND dl.log_date <= ?";
            params.push(filters.to);
        }

        sql += " ORDER BY dl.log_date DESC, dl.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [rows] = await db.query(sql, params);
        return rows;
    }

    async count(organizationId, filters) {
        let sql = `
            SELECT COUNT(*) AS total
            FROM daily_logs dl
            JOIN users u ON u.id = dl.user_id
            WHERE u.organization_id = ? AND dl.is_deleted = 0
        `;
        const params = [organizationId];
        if (filters.user_id) {
            sql += " AND dl.user_id = ?";
            params.push(filters.user_id);
        }
        if (filters.project_id) {
            sql += " AND dl.project_id = ?";
            params.push(filters.project_id);
        }
        if (filters.from) {
            sql += " AND dl.log_date >= ?";
            params.push(filters.from);
        }
        if (filters.to) {
            sql += " AND dl.log_date <= ?";
            params.push(filters.to);
        }
        const [rows] = await db.query(sql, params);
        return rows[0].total;
    }

    async findById(id, userId) {
        const [rows] = await db.execute(
            "SELECT * FROM daily_logs WHERE id = ? AND user_id = ? AND is_deleted = 0 LIMIT 1",
            [id, userId]
        );
        return rows[0];
    }

    async update(id, userId, data) {
        const sql = `
            UPDATE daily_logs
            SET project_id = ?, task_id = ?, log_type = ?, hours_worked = ?, work_description = ?, work_status = ?, log_date = ?, updated_by = ?
            WHERE id = ? AND user_id = ?
        `;
        const [result] = await db.execute(sql, [
            data.project_id,
            data.task_id,
            data.log_type ?? "Development",
            data.hours_worked,
            data.work_description,
            data.work_status ?? "Completed",
            data.log_date,
            userId,
            id,
            userId
        ]);
        return result;
    }

    async softDelete(id, userId) {
        const [result] = await db.execute(
            "UPDATE daily_logs SET is_deleted = 1, deleted_at = NOW() WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        return result;
    }

    async sumHours(userId, fromDate, toDate) {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(hours_worked), 0) AS total
             FROM daily_logs
             WHERE user_id = ? AND is_deleted = 0 AND log_date BETWEEN ? AND ?`,
            [userId, fromDate, toDate]
        );
        return Number(rows[0].total);
    }

    async dailyHoursForRange(userId, fromDate, toDate) {
        const [rows] = await db.execute(
            `SELECT log_date, SUM(hours_worked) AS hours
             FROM daily_logs
             WHERE user_id = ? AND is_deleted = 0 AND log_date BETWEEN ? AND ?
             GROUP BY log_date
             ORDER BY log_date`,
            [userId, fromDate, toDate]
        );
        return rows;
    }
}

module.exports = new DailyLogRepository();
