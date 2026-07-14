const DashboardRepository = require("./dashboard.repository");
const DailyLogService = require("../dailyLogs/dailyLog.services");
const GithubRepository = require("../github/github.repository");
const TaskRepository = require("../tasks/task.repository");
const ProductivityService = require("../productivity/productivity.services");
const { getWeekRange } = require("../../utils/dateRange");

class DashboardService {

    async getMine(user) {
        const { start, end } = getWeekRange();

        const [hours, commits, completedTasks, productivity] = await Promise.all([
            DailyLogService.userHours(user.id),
            GithubRepository.sumCommits(user.id, start, end),
            TaskRepository.countCompletedByUserSince(user.id, start),
            ProductivityService.calculateForUser(user)
        ]);

        return {
            todayHours: hours.todayHours,
            weeklyHours: hours.weeklyHours,
            commits,
            completedTasks,
            productivityScore: productivity.score
        };
    }

    async getTeam(organizationId, teamId) {
        const { start, end } = getWeekRange();
        return DashboardRepository.getTeamOverview(organizationId, teamId, start, end);
    }
}

module.exports = new DashboardService();
