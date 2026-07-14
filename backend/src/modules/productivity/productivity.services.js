const ProductivityRepository = require("./productivity.repository");
const TaskRepository = require("../tasks/task.repository");
const DailyLogRepository = require("../dailyLogs/dailyLog.repository");
const GithubRepository = require("../github/github.repository");
const { getWeekRange, getISOWeekNumber } = require("../../utils/dateRange");
const { TARGET_WEEKLY_HOURS, TARGET_WEEKLY_COMMITS, WEIGHT_TASKS, WEIGHT_HOURS, WEIGHT_COMMITS } = require("../../constants/productivity");

class ProductivityService {

    async calculateForUser(user, reference = new Date()) {
        const { start, end } = getWeekRange(reference);

        const [completedTasks, assignedTasks, hoursWorked, commits] = await Promise.all([
            TaskRepository.countCompletedByUserSince(user.id, start),
            TaskRepository.countAssignedByUserSince(user.id, start),
            DailyLogRepository.sumHours(user.id, start, end),
            GithubRepository.sumCommits(user.id, start, end)
        ]);

        const taskCompletionRate = assignedTasks > 0 ? Math.min(completedTasks / assignedTasks, 1) : 0;
        const hoursRatio = Math.min(hoursWorked / TARGET_WEEKLY_HOURS, 1);
        const commitsRatio = Math.min(commits / TARGET_WEEKLY_COMMITS, 1);

        const score = Math.round(
            (taskCompletionRate * WEIGHT_TASKS + hoursRatio * WEIGHT_HOURS + commitsRatio * WEIGHT_COMMITS) * 100
        ) / 100;

        const week = getISOWeekNumber(reference);
        const month = reference.getUTCMonth() + 1;
        const year = reference.getUTCFullYear();

        await ProductivityRepository.upsertScore(user.organization_id, user.id, score, week, month, year);

        return { score, week, month, year, breakdown: { completedTasks, assignedTasks, hoursWorked, commits } };
    }

    async getLatest(userId) {
        const record = await ProductivityRepository.getLatestForUser(userId);
        return record ?? { score: 0, week: null, month: null, year: null };
    }

    async getTeamScores(organizationId, teamId) {
        return ProductivityRepository.getTeamScores(organizationId, teamId);
    }
}

module.exports = new ProductivityService();
