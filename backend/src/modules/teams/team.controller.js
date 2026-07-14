const TeamService = require("./team.services");
const Response = require("../../utils/response");

class TeamController {

    async create(req, res) {
        try {
            const result = await TeamService.create(req.user.organization_id, req.body);
            return Response.success(res, "Team created successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async list(req, res) {
        try {
            const result = await TeamService.list(req.user.organization_id, req.query);
            return Response.success(res, "Teams fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getById(req, res) {
        try {
            const result = await TeamService.getById(req.params.id, req.user.organization_id);
            return Response.success(res, "Team fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async update(req, res) {
        try {
            await TeamService.update(req.params.id, req.user.organization_id, req.body);
            return Response.success(res, "Team updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async deactivate(req, res) {
        try {
            await TeamService.deactivate(req.params.id, req.user.organization_id);
            return Response.success(res, "Team deactivated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new TeamController();
