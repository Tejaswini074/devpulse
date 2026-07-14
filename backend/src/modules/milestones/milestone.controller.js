const MilestoneService = require("./milestone.services");
const Response = require("../../utils/response");

class MilestoneController {

    async create(req, res) {
        try {
            const result = await MilestoneService.create(req.user, req.body);
            return Response.success(res, "Milestone created successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async listByProject(req, res) {
        try {
            const result = await MilestoneService.listByProject(req.query.project_id, req.user.organization_id);
            return Response.success(res, "Milestones fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async update(req, res) {
        try {
            await MilestoneService.update(req.params.id, req.user.organization_id, req.body);
            return Response.success(res, "Milestone updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async updateStatus(req, res) {
        try {
            await MilestoneService.updateStatus(req.params.id, req.user.organization_id, req.body.status);
            return Response.success(res, "Milestone status updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await MilestoneService.remove(req.params.id, req.user.organization_id);
            return Response.success(res, "Milestone deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new MilestoneController();
