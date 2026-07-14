const ReportService = require("./report.services");
const Response = require("../../utils/response");
const { getWeekRange } = require("../../utils/dateRange");

class ReportController {

    async weekly(req, res) {
        try {
            const result = await ReportService.weeklyReport(req.user);
            return Response.success(res, "Weekly report fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async exportLogs(req, res) {
        try {
            const { start, end } = getWeekRange();
            const from = req.query.from || start;
            const to = req.query.to || end;

            const csv = await ReportService.exportLogsCsv(req.user, from, to);

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", `attachment; filename="devpulse-logs-${from}-to-${to}.csv"`);
            return res.status(200).send(csv);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }
}

module.exports = new ReportController();
