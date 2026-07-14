const db = require("../../config/db");

class GithubRepository {

    async upsertActivity(organizationId, userId, activityDate, commitCount, pullRequests, issuesClosed) {
        const sql = `
            INSERT INTO github_activity (organization_id, user_id, commit_count, pull_requests, issues_closed, activity_date)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                commit_count = VALUES(commit_count),
                pull_requests = VALUES(pull_requests),
                issues_closed = VALUES(issues_closed)
        `;
        const [result] = await db.execute(sql, [
            organizationId, userId, commitCount, pullRequests, issuesClosed, activityDate
        ]);
        return result;
    }

    async findByUserRange(userId, from, to) {
        const sql = `
            SELECT activity_date, commit_count, pull_requests, issues_closed
            FROM github_activity
            WHERE user_id = ? AND activity_date BETWEEN ? AND ?
            ORDER BY activity_date
        `;
        const [rows] = await db.execute(sql, [userId, from, to]);
        return rows;
    }

    async sumCommits(userId, from, to) {
        const [rows] = await db.execute(
            `SELECT COALESCE(SUM(commit_count), 0) AS total
             FROM github_activity WHERE user_id = ? AND activity_date BETWEEN ? AND ?`,
            [userId, from, to]
        );
        return Number(rows[0].total);
    }

    async dailyBreakdown(userId, from, to) {
        const [rows] = await db.execute(
            `SELECT activity_date, commit_count FROM github_activity
             WHERE user_id = ? AND activity_date BETWEEN ? AND ?`,
            [userId, from, to]
        );
        return rows;
    }

    async findUserForSync(userId) {
        const [rows] = await db.execute(
            "SELECT id, organization_id, github_username FROM users WHERE id = ? LIMIT 1",
            [userId]
        );
        return rows[0];
    }

    async findUsersWithGithubUsername(organizationId = null) {
        let sql = `
            SELECT id, organization_id, github_username
            FROM users
            WHERE github_username IS NOT NULL AND github_username != '' AND is_deleted = 0
        `;
        const params = [];
        if (organizationId) {
            sql += " AND organization_id = ?";
            params.push(organizationId);
        }
        const [rows] = await db.query(sql, params);
        return rows;
    }
}

module.exports = new GithubRepository();
