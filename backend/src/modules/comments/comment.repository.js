const db = require("../../config/db");

class CommentRepository {

    async findByTask(taskId) {
        const sql = `
            SELECT c.*, u.name AS user_name
            FROM task_comments c
            JOIN users u ON u.id = c.user_id
            WHERE c.task_id = ?
            ORDER BY c.created_at ASC
        `;
        const [rows] = await db.execute(sql, [taskId]);
        return rows;
    }

    async create(taskId, userId, comment, parentCommentId) {
        const sql = `
            INSERT INTO task_comments (task_id, user_id, parent_comment_id, comment)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [taskId, userId, parentCommentId ?? null, comment]);
        return result;
    }

    async findById(id) {
        const [rows] = await db.execute("SELECT * FROM task_comments WHERE id = ?", [id]);
        return rows[0];
    }

    async countReplies(id) {
        const [rows] = await db.execute(
            "SELECT COUNT(*) AS total FROM task_comments WHERE parent_comment_id = ?",
            [id]
        );
        return rows[0].total;
    }

    async update(id, comment) {
        const [result] = await db.execute(
            "UPDATE task_comments SET comment = ?, is_edited = 1 WHERE id = ?",
            [comment, id]
        );
        return result;
    }

    async remove(id) {
        const [result] = await db.execute("DELETE FROM task_comments WHERE id = ?", [id]);
        return result;
    }
}

module.exports = new CommentRepository();
