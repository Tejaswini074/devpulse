const NotificationService = require("./notification.services");
const Response = require("../../utils/response");

class NotificationController {

    async list(req, res) {
        try {
            const result = await NotificationService.list(req.user.id, req.query);
            return Response.success(res, "Notifications fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async unreadCount(req, res) {
        try {
            const result = await NotificationService.unreadCount(req.user.id);
            return Response.success(res, "Unread count fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 500);
        }
    }

    async markRead(req, res) {
        try {
            await NotificationService.markRead(req.params.id, req.user.id);
            return Response.success(res, "Notification marked as read");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async markAllRead(req, res) {
        try {
            await NotificationService.markAllRead(req.user.id);
            return Response.success(res, "All notifications marked as read");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new NotificationController();
