const db = require("../../config/db");

class DashboardRepository {

    async getTeamOverview(organizationId, teamId, from, to) {
        let sql = `
            SELECT
                u.id AS user_id,
                u.name,
                u.email,
                COALESCE((
                    SELECT SUM(dl.hours_worked) FROM daily_logs dl
                    WHERE dl.user_id = u.id AND dl.is_deleted = 0 AND dl.log_date BETWEEN ? AND ?
                ), 0) AS hours,
                COALESCE((
                    SELECT SUM(ga.commit_count) FROM github_activity ga
                    WHERE ga.user_id = u.id AND ga.activity_date BETWEEN ? AND ?
                ), 0) AS commits,
                COALESCE((
                    SELECT COUNT(*) FROM tasks t
                    WHERE t.assigned_to = u.id AND t.is_deleted = 0 AND t.status = 'Done'
                        AND t.completed_date BETWEEN ? AND ?
                ), 0) AS completed_tasks,
                (
                    SELECT ps.score FROM productivity_scores ps
                    WHERE ps.user_id = u.id ORDER BY ps.year DESC, ps.week DESC LIMIT 1
                ) AS score
            FROM users u
            WHERE u.organization_id = ? AND u.is_deleted = 0
        `;
        const params = [from, to, from, to, from, to, organizationId];

        if (teamId) {
            sql += " AND u.team_id = ?";
            params.push(teamId);
        }

        sql += " ORDER BY u.name";

        const [rows] = await db.query(sql, params);
        return rows;
    }
}

module.exports = new DashboardRepository();
