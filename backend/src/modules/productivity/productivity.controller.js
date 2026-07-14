const ProductivityService = require("./productivity.services");
const Response = require("../../utils/response");

class ProductivityController {

    async getMine(req, res) {
        try {
            const result = await ProductivityService.calculateForUser(req.user);
            return Response.success(res, "Productivity score fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getTeam(req, res) {
        try {
            const result = await ProductivityService.getTeamScores(req.user.organization_id, req.query.team_id);
            return Response.success(res, "Team productivity fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }
}

module.exports = new ProductivityController();
