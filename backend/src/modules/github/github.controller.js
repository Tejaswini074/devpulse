const GithubService = require("./github.services");
const Response = require("../../utils/response");
const { getToday } = require("../../utils/dateRange");

class GithubController {

    async setUsername(req, res) {
        try {
            await GithubService.setUsername(req.user.id, req.body.github_username);
            return Response.success(res, "GitHub username updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async sync(req, res) {
        try {
            const result = await GithubService.syncOwnAccount(req.user.id);
            return Response.success(res, "GitHub activity synced successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async getActivity(req, res) {
        try {
            const to = req.query.to || getToday();
            const from = req.query.from || to;
            const result = await GithubService.getActivity(req.user.id, from, to);
            return Response.success(res, "GitHub activity fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }
}

module.exports = new GithubController();
