const DailyLogRepository = require("../dailyLogs/dailyLog.repository");
const GithubRepository = require("../github/github.repository");
const TaskRepository = require("../tasks/task.repository");
const { getWeekRange, toISODate } = require("../../utils/dateRange");

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function csvField(value) {
    const str = value === null || value === undefined ? "" : String(value);
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

class ReportService {

    async weeklyReport(user, reference = new Date()) {
        const { start, end } = getWeekRange(reference);

        const [hoursRows, commitRows, taskRows] = await Promise.all([
            DailyLogRepository.dailyHoursForRange(user.id, start, end),
            GithubRepository.dailyBreakdown(user.id, start, end),
            TaskRepository.dailyCompletedBreakdown(user.id, start, end)
        ]);

        const hoursByDate = Object.fromEntries(hoursRows.map((r) => [toISODate(new Date(r.log_date)), Number(r.hours)]));
        const commitsByDate = Object.fromEntries(commitRows.map((r) => [toISODate(new Date(r.activity_date)), r.commit_count]));
        const tasksByDate = Object.fromEntries(taskRows.map((r) => [toISODate(new Date(r.completed_date)), r.total]));

        const startDate = new Date(`${start}T00:00:00Z`);
        const days = DAY_LABELS.map((label, index) => {
            const date = new Date(startDate);
            date.setUTCDate(startDate.getUTCDate() + index);
            const iso = toISODate(date);
            return {
                day: label,
                date: iso,
                hours: hoursByDate[iso] ?? 0,
                commits: commitsByDate[iso] ?? 0,
                tasksCompleted: tasksByDate[iso] ?? 0
            };
        });

        return {
            weekStart: start,
            weekEnd: end,
            days,
            totals: {
                hours: days.reduce((sum, d) => sum + d.hours, 0),
                commits: days.reduce((sum, d) => sum + d.commits, 0),
                tasksCompleted: days.reduce((sum, d) => sum + d.tasksCompleted, 0)
            }
        };
    }

    async exportLogsCsv(user, from, to) {
        const filters = { user_id: user.id, from, to };
        const rows = await DailyLogRepository.findAll(user.organization_id, filters, { limit: 1000, offset: 0 });

        const header = ["Date", "Project", "Task", "Type", "Hours", "Status", "Description"];
        const lines = [header.map(csvField).join(",")];

        for (const row of rows) {
            const line = [
                row.log_date,
                row.project_name,
                row.task_title,
                row.log_type,
                row.hours_worked,
                row.work_status,
                row.work_description
            ].map(csvField).join(",");
            lines.push(line);
        }

        return lines.join("\n");
    }
}

module.exports = new ReportService();
