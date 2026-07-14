const TaskService = require("./task.services");
const Response = require("../../utils/response");

class TaskController {

    async create(req, res) {
        try {
            const result = await TaskService.create(req.user, req.body);
            return Response.success(res, "Task created successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async list(req, res) {
        try {
            const result = await TaskService.list(req.user.organization_id, req.query);
            return Response.success(res, "Tasks fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async getById(req, res) {
        try {
            const result = await TaskService.getById(req.params.id, req.user.organization_id);
            return Response.success(res, "Task fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async update(req, res) {
        try {
            await TaskService.update(req.params.id, req.user, req.body);
            return Response.success(res, "Task updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async updateStatus(req, res) {
        try {
            await TaskService.updateStatus(req.params.id, req.user, req.body.status);
            return Response.success(res, "Task status updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 403);
        }
    }

    async remove(req, res) {
        try {
            await TaskService.remove(req.params.id, req.user.organization_id);
            return Response.success(res, "Task deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new TaskController();
