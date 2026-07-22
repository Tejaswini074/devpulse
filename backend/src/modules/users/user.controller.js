const UserService = require("./user.services");
const Response = require("../../utils/response");
const { logActivity } = require("../../utils/activityLogger");

class UserController {

    async list(req, res) {
        try {
            const result = await UserService.list(req.user.organization_id, req.query);
            return Response.success(res, "Users fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getById(req, res) {
        try {
            const result = await UserService.getById(req.params.id, req.user.organization_id);
            return Response.success(res, "User fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async update(req, res) {
        try {
            await UserService.update(req.params.id, req.user.organization_id, req.body);
            return Response.success(res, "User updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await UserService.remove(req.params.id, req.user.organization_id);
            await logActivity(req.user.organization_id, req.user.id, {
                module_name: "User",
                module_id: req.params.id,
                action: "Deactivate",
                description: "Deactivated a user"
            }, req);
            return Response.success(res, "User deactivated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new UserController();
