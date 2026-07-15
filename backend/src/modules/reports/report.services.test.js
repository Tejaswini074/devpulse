jest.mock("../dailyLogs/dailyLog.repository");
jest.mock("../github/github.repository");
jest.mock("../tasks/task.repository");

const DailyLogRepository = require("../dailyLogs/dailyLog.repository");
const GithubRepository = require("../github/github.repository");
const TaskRepository = require("../tasks/task.repository");
const ReportService = require("./report.services");

const user = { id: 1, organization_id: 2 };

describe("ReportService.weeklyReport", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("aggregates hours, commits, and completed tasks per day of the Mon-Sun week", async () => {
        DailyLogRepository.dailyHoursForRange.mockResolvedValue([
            { log_date: "2026-07-15", hours: "3.50" }
        ]);
        GithubRepository.dailyBreakdown.mockResolvedValue([
            { activity_date: "2026-07-15", commit_count: 4 }
        ]);
        TaskRepository.dailyCompletedBreakdown.mockResolvedValue([
            { completed_date: "2026-07-16", total: 2 }
        ]);

        const reference = new Date(Date.UTC(2026, 6, 15)); // Wednesday
        const report = await ReportService.weeklyReport(user, reference);

        expect(report.weekStart).toBe("2026-07-13");
        expect(report.weekEnd).toBe("2026-07-19");

        const wed = report.days.find((d) => d.date === "2026-07-15");
        expect(wed).toEqual({ day: "Wed", date: "2026-07-15", hours: 3.5, commits: 4, tasksCompleted: 0 });

        const thu = report.days.find((d) => d.date === "2026-07-16");
        expect(thu.tasksCompleted).toBe(2);

        const mon = report.days.find((d) => d.date === "2026-07-13");
        expect(mon).toEqual({ day: "Mon", date: "2026-07-13", hours: 0, commits: 0, tasksCompleted: 0 });

        expect(report.totals).toEqual({ hours: 3.5, commits: 4, tasksCompleted: 2 });
    });

    test("defaults every day to zero when there is no activity", async () => {
        DailyLogRepository.dailyHoursForRange.mockResolvedValue([]);
        GithubRepository.dailyBreakdown.mockResolvedValue([]);
        TaskRepository.dailyCompletedBreakdown.mockResolvedValue([]);

        const report = await ReportService.weeklyReport(user, new Date(Date.UTC(2026, 6, 15)));

        expect(report.days).toHaveLength(7);
        expect(report.days.every((d) => d.hours === 0 && d.commits === 0 && d.tasksCompleted === 0)).toBe(true);
        expect(report.totals).toEqual({ hours: 0, commits: 0, tasksCompleted: 0 });
    });
});

describe("ReportService.exportLogsCsv", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("produces a header row plus one row per log", async () => {
        DailyLogRepository.findAll.mockResolvedValue([
            {
                log_date: "2026-07-15",
                project_name: "Mobile Revamp",
                task_title: "Redesign login screen",
                log_type: "Development",
                hours_worked: "1.00",
                work_status: "In Progress",
                work_description: "Automated smoke-test log entry"
            }
        ]);

        const csv = await ReportService.exportLogsCsv(user, "2026-07-01", "2026-07-15");
        const lines = csv.split("\n");

        expect(lines[0]).toBe("Date,Project,Task,Type,Hours,Status,Description");
        expect(lines[1]).toBe("2026-07-15,Mobile Revamp,Redesign login screen,Development,1.00,In Progress,Automated smoke-test log entry");
        expect(DailyLogRepository.findAll).toHaveBeenCalledWith(
            user.organization_id,
            { user_id: user.id, from: "2026-07-01", to: "2026-07-15" },
            { limit: 1000, offset: 0 }
        );
    });

    test("quotes and escapes fields containing commas, quotes, or newlines", async () => {
        DailyLogRepository.findAll.mockResolvedValue([
            {
                log_date: "2026-07-15",
                project_name: 'Acme, Inc. "Phase 2"',
                task_title: "Line one\nLine two",
                log_type: "Development",
                hours_worked: "2.00",
                work_status: "Completed",
                work_description: "Fixed the \"login\" bug, verified"
            }
        ]);

        const csv = await ReportService.exportLogsCsv(user, "2026-07-01", "2026-07-15");
        const dataLine = csv.split("\n").slice(1).join("\n");

        expect(dataLine).toContain('"Acme, Inc. ""Phase 2"""');
        expect(dataLine).toContain('"Line one\nLine two"');
        expect(dataLine).toContain('"Fixed the ""login"" bug, verified"');
    });

    test("returns just the header when there are no logs", async () => {
        DailyLogRepository.findAll.mockResolvedValue([]);
        const csv = await ReportService.exportLogsCsv(user, "2026-07-01", "2026-07-15");
        expect(csv).toBe("Date,Project,Task,Type,Hours,Status,Description");
    });
});
