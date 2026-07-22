const NotificationRepository = require("./notification.repository");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");
const { emitToUser } = require("../../sockets/io");

class NotificationService {

    async notify(organizationId, userId, { title, message, type, action_url }) {
        const result = await NotificationRepository.create(organizationId, userId, {
            title,
            message,
            type,
            action_url
        });

        const notification = {
            id: result.insertId,
            organization_id: organizationId,
            user_id: userId,
            title,
            message,
            type: type ?? "System",
            action_url: action_url ?? null,
            is_read: 0,
            created_at: new Date().toISOString()
        };

        emitToUser(userId, "notification:new", notification);

        return notification;
    }

    async list(userId, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const unreadOnly = query.unread === "true";
        const [rows, total] = await Promise.all([
            NotificationRepository.findAll(userId, { limit, offset, unreadOnly }),
            NotificationRepository.count(userId, { unreadOnly })
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async unreadCount(userId) {
        const total = await NotificationRepository.unreadCount(userId);
        return { count: total };
    }

    async markRead(id, userId) {
        const notification = await NotificationRepository.findById(id, userId);
        if (!notification) {
            throw new Error("Notification not found");
        }
        await NotificationRepository.markRead(id, userId);
        return true;
    }

    async markAllRead(userId) {
        await NotificationRepository.markAllRead(userId);
        return true;
    }
}

module.exports = new NotificationService();
