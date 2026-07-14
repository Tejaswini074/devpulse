const db = require("../../config/db");

class ProductivityRepository {

    async upsertScore(organizationId, userId, score, week, month, year) {
        const sql = `
            INSERT INTO productivity_scores (organization_id, user_id, score, week, month, year)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE score = VALUES(score), calculated_at = CURRENT_TIMESTAMP
        `;
        const [result] = await db.execute(sql, [organizationId, userId, score, week, month, year]);
        return result;
    }

    async getLatestForUser(userId) {
        const [rows] = await db.execute(
            "SELECT * FROM productivity_scores WHERE user_id = ? ORDER BY year DESC, week DESC LIMIT 1",
            [userId]
        );
        return rows[0];
    }

    async getTeamScores(organizationId, teamId = null) {
        let sql = `
            SELECT u.id AS user_id, u.name, u.email, ps.score, ps.week, ps.year
            FROM users u
            LEFT JOIN productivity_scores ps ON ps.user_id = u.id
                AND ps.id = (SELECT id FROM productivity_scores WHERE user_id = u.id ORDER BY year DESC, week DESC LIMIT 1)
            WHERE u.organization_id = ? AND u.is_deleted = 0
        `;
        const params = [organizationId];
        if (teamId) {
            sql += " AND u.team_id = ?";
            params.push(teamId);
        }
        sql += " ORDER BY u.name";
        const [rows] = await db.query(sql, params);
        return rows;
    }
}

module.exports = new ProductivityRepository();
