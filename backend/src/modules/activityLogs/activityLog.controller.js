const ActivityLogService = require("./activityLog.services");
const Response = require("../../utils/response");

class ActivityLogController {

    async list(req, res) {
        try {
            const result = await ActivityLogService.list(req.user.organization_id, req.query);
            return Response.success(res, "Activity logs fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }
}

module.exports = new ActivityLogController();
