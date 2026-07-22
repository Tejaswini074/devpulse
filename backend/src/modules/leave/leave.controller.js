const LeaveService = require("./leave.services");
const Response = require("../../utils/response");
const { logActivity } = require("../../utils/activityLogger");

class LeaveController {

    async create(req, res) {
        try {
            const result = await LeaveService.create(req.user, req.body);
            return Response.success(res, "Leave request submitted successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async listMine(req, res) {
        try {
            const result = await LeaveService.listMine(req.user.id, req.query);
            return Response.success(res, "Leave requests fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async listTeam(req, res) {
        try {
            const result = await LeaveService.listTeam(req.user, req.query);
            return Response.success(res, "Team leave requests fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async updateStatus(req, res) {
        try {
            await LeaveService.updateStatus(req.params.id, req.user, req.body.status, req.body.remarks);
            await logActivity(req.user.organization_id, req.user.id, {
                module_name: "Leave",
                module_id: req.params.id,
                action: req.body.status,
                description: `${req.body.status} a leave request`
            }, req);
            return Response.success(res, "Leave request updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async cancel(req, res) {
        try {
            await LeaveService.cancel(req.params.id, req.user);
            return Response.success(res, "Leave request cancelled successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new LeaveController();
