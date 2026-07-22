const db = require("../../config/db");

class NotificationRepository {

    async create(organizationId, userId, { title, message, type, action_url }) {
        const sql = `
            INSERT INTO notifications (organization_id, user_id, title, message, type, action_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            organizationId,
            userId,
            title,
            message,
            type ?? "System",
            action_url ?? null
        ]);
        return result;
    }

    async findAll(userId, { limit, offset, unreadOnly }) {
        let sql = "SELECT * FROM notifications WHERE user_id = ?";
        const params = [userId];
        if (unreadOnly) {
            sql += " AND is_read = 0";
        }
        sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);
        const [rows] = await db.query(sql, params);
        return rows;
    }

    async count(userId, { unreadOnly }) {
        let sql = "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?";
        const params = [userId];
        if (unreadOnly) {
            sql += " AND is_read = 0";
        }
        const [rows] = await db.execute(sql, params);
        return rows[0].total;
    }

    async unreadCount(userId) {
        const [rows] = await db.execute(
            "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0",
            [userId]
        );
        return rows[0].total;
    }

    async findById(id, userId) {
        const [rows] = await db.execute(
            "SELECT * FROM notifications WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        return rows[0];
    }

    async markRead(id, userId) {
        const [result] = await db.execute(
            "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        return result;
    }

    async markAllRead(userId) {
        const [result] = await db.execute(
            "UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0",
            [userId]
        );
        return result;
    }
}

module.exports = new NotificationRepository();
