const SettingService = require("./setting.services");
const Response = require("../../utils/response");

class SettingController {

    async getAll(req, res) {
        try {
            const result = await SettingService.getAll(req.user.organization_id);
            return Response.success(res, "Settings fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async update(req, res) {
        try {
            const result = await SettingService.update(req.user.organization_id, req.user.id, req.body);
            return Response.success(res, "Settings updated successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new SettingController();
