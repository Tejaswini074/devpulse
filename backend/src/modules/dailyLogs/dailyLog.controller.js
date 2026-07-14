const DailyLogService = require("./dailyLog.services");
const Response = require("../../utils/response");

class DailyLogController {

    async create(req, res) {
        try {
            const result = await DailyLogService.create(req.user, req.body);
            return Response.success(res, "Work log added successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async list(req, res) {
        try {
            const result = await DailyLogService.list(req.user, req.query);
            return Response.success(res, "Work logs fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async update(req, res) {
        try {
            await DailyLogService.update(req.params.id, req.user, req.body);
            return Response.success(res, "Work log updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await DailyLogService.remove(req.params.id, req.user);
            return Response.success(res, "Work log deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async userHours(req, res) {
        try {
            const result = await DailyLogService.userHours(req.user.id);
            return Response.success(res, "Hours fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }
}

module.exports = new DailyLogController();
