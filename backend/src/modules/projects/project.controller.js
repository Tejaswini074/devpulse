const ProjectService = require("./project.services");
const Response = require("../../utils/response");
const { logActivity } = require("../../utils/activityLogger");

class ProjectController {

    async create(req, res) {
        try {
            const result = await ProjectService.create(req.user, req.body);
            await logActivity(req.user.organization_id, req.user.id, {
                module_name: "Project",
                module_id: result.id,
                action: "Create",
                description: `Created project "${req.body.project_name}"`
            }, req);
            return Response.success(res, "Project created successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async list(req, res) {
        try {
            const result = await ProjectService.list(req.user.organization_id, req.query);
            return Response.success(res, "Projects fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getById(req, res) {
        try {
            const result = await ProjectService.getById(req.params.id, req.user.organization_id);
            return Response.success(res, "Project fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async update(req, res) {
        try {
            await ProjectService.update(req.params.id, req.user, req.body);
            await logActivity(req.user.organization_id, req.user.id, {
                module_name: "Project",
                module_id: req.params.id,
                action: "Update",
                description: `Updated project "${req.body.project_name}"`
            }, req);
            return Response.success(res, "Project updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await ProjectService.remove(req.params.id, req.user.organization_id);
            return Response.success(res, "Project deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async addMember(req, res) {
        try {
            await ProjectService.addMember(
                req.params.id,
                req.user.organization_id,
                req.body.user_id,
                req.body.member_role,
                req.user.id
            );
            return Response.success(res, "Member added successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async removeMember(req, res) {
        try {
            await ProjectService.removeMember(req.params.id, req.user.organization_id, req.params.userId);
            return Response.success(res, "Member removed successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new ProjectController();
