jest.mock("./notification.repository");
jest.mock("../../sockets/io");

const NotificationRepository = require("./notification.repository");
const { emitToUser } = require("../../sockets/io");
const NotificationService = require("./notification.services");

describe("NotificationService.notify", () => {
    beforeEach(() => jest.clearAllMocks());

    test("creates the row and emits a socket event to the target user", async () => {
        NotificationRepository.create.mockResolvedValue({ insertId: 5 });

        const result = await NotificationService.notify(2, 7, {
            title: "New task assigned to you",
            message: "You were assigned X",
            type: "Task",
            action_url: "/tasks/1"
        });

        expect(result.id).toBe(5);
        expect(emitToUser).toHaveBeenCalledWith(7, "notification:new", expect.objectContaining({ id: 5, user_id: 7 }));
    });
});

describe("NotificationService.unreadCount", () => {
    beforeEach(() => jest.clearAllMocks());

    test("returns the repository's count wrapped in an object", async () => {
        NotificationRepository.unreadCount.mockResolvedValue(3);
        await expect(NotificationService.unreadCount(7)).resolves.toEqual({ count: 3 });
    });
});

describe("NotificationService.markRead", () => {
    beforeEach(() => jest.clearAllMocks());

    test("throws when the notification does not belong to the user", async () => {
        NotificationRepository.findById.mockResolvedValue(undefined);
        await expect(NotificationService.markRead(1, 7)).rejects.toThrow("Notification not found");
        expect(NotificationRepository.markRead).not.toHaveBeenCalled();
    });

    test("marks an owned notification as read", async () => {
        NotificationRepository.findById.mockResolvedValue({ id: 1, user_id: 7 });
        await NotificationService.markRead(1, 7);
        expect(NotificationRepository.markRead).toHaveBeenCalledWith(1, 7);
    });
});
