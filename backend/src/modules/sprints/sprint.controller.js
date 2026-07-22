const SprintService = require("./sprint.services");
const Response = require("../../utils/response");

class SprintController {

    async create(req, res) {
        try {
            const result = await SprintService.create(req.user, req.body);
            return Response.success(res, "Sprint created successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async listByProject(req, res) {
        try {
            const result = await SprintService.listByProject(req.params.projectId, req.user.organization_id);
            return Response.success(res, "Sprints fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getById(req, res) {
        try {
            const result = await SprintService.getById(req.params.id, req.user.organization_id);
            return Response.success(res, "Sprint fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async update(req, res) {
        try {
            await SprintService.update(req.params.id, req.user.organization_id, req.body);
            return Response.success(res, "Sprint updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async updateStatus(req, res) {
        try {
            await SprintService.updateStatus(req.params.id, req.user.organization_id, req.body.status);
            return Response.success(res, "Sprint status updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await SprintService.remove(req.params.id, req.user.organization_id);
            return Response.success(res, "Sprint deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new SprintController();
