const CalendarService = require("./calendar.services");
const Response = require("../../utils/response");

class CalendarController {

    async list(req, res) {
        try {
            const result = await CalendarService.listByYear(req.user.organization_id, req.query.year);
            return Response.success(res, "Calendar entries fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async create(req, res) {
        try {
            const result = await CalendarService.create(req.user, req.body);
            return Response.success(res, "Holiday added successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await CalendarService.remove(req.params.id, req.user.organization_id);
            return Response.success(res, "Calendar entry removed successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new CalendarController();
