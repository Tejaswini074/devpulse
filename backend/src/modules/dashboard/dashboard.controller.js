const DashboardService = require("./dashboard.services");
const Response = require("../../utils/response");

class DashboardController {

    async getMine(req, res) {
        try {
            const result = await DashboardService.getMine(req.user);
            return Response.success(res, "Dashboard fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getTeam(req, res) {
        try {
            const result = await DashboardService.getTeam(req.user.organization_id, req.query.team_id);
            return Response.success(res, "Team dashboard fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }
}

module.exports = new DashboardController();
