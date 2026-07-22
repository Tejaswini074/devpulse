jest.mock("./comment.repository");
jest.mock("../tasks/task.repository");
jest.mock("../users/user.repository");
jest.mock("../notifications/notification.services");

const CommentRepository = require("./comment.repository");
const TaskRepository = require("../tasks/task.repository");
const UserRepository = require("../users/user.repository");
const NotificationService = require("../notifications/notification.services");
const CommentService = require("./comment.services");

const orgUser = { id: 6, organization_id: 2, role: "Developer" };
const task = { id: 1, organization_id: 2, assigned_to: 7, title: "Attendance API" };

describe("CommentService.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("notifies the assignee when someone else comments", async () => {
        TaskRepository.findById.mockResolvedValue(task);
        CommentRepository.create.mockResolvedValue({ insertId: 10 });
        UserRepository.findById.mockResolvedValue({ name: "Rahul Sharma" });

        await CommentService.create(1, orgUser, "Nice work", null);

        expect(NotificationService.notify).toHaveBeenCalledWith(2, 7, expect.objectContaining({ type: "Comment" }));
    });

    test("does not notify when the assignee comments on their own task", async () => {
        TaskRepository.findById.mockResolvedValue({ ...task, assigned_to: orgUser.id });
        CommentRepository.create.mockResolvedValue({ insertId: 11 });

        await CommentService.create(1, orgUser, "Note to self", null);

        expect(NotificationService.notify).not.toHaveBeenCalled();
    });

    test("throws when the task does not exist in the user's org", async () => {
        TaskRepository.findById.mockResolvedValue(undefined);
        await expect(CommentService.create(999, orgUser, "x", null)).rejects.toThrow("Task not found");
    });
});

describe("CommentService.update", () => {
    beforeEach(() => jest.clearAllMocks());

    test("allows the comment owner to edit", async () => {
        CommentRepository.findById.mockResolvedValue({ id: 5, task_id: 1, user_id: orgUser.id });
        TaskRepository.findById.mockResolvedValue(task);

        await CommentService.update(5, orgUser, "edited");

        expect(CommentRepository.update).toHaveBeenCalledWith(5, "edited");
    });

    test("rejects editing someone else's comment", async () => {
        CommentRepository.findById.mockResolvedValue({ id: 5, task_id: 1, user_id: 999 });
        TaskRepository.findById.mockResolvedValue(task);

        await expect(CommentService.update(5, orgUser, "edited")).rejects.toThrow(
            "You can only edit your own comments"
        );
    });
});

describe("CommentService.remove", () => {
    beforeEach(() => jest.clearAllMocks());

    test("blocks deleting a comment that has replies", async () => {
        CommentRepository.findById.mockResolvedValue({ id: 5, task_id: 1, user_id: orgUser.id });
        TaskRepository.findById.mockResolvedValue(task);
        CommentRepository.countReplies.mockResolvedValue(2);

        await expect(CommentService.remove(5, orgUser)).rejects.toThrow("Cannot delete a comment that has replies");
        expect(CommentRepository.remove).not.toHaveBeenCalled();
    });

    test("allows a manager to delete someone else's comment when there are no replies", async () => {
        const manager = { id: 99, organization_id: 2, role: "Manager" };
        CommentRepository.findById.mockResolvedValue({ id: 5, task_id: 1, user_id: orgUser.id });
        TaskRepository.findById.mockResolvedValue(task);
        CommentRepository.countReplies.mockResolvedValue(0);

        await CommentService.remove(5, manager);

        expect(CommentRepository.remove).toHaveBeenCalledWith(5);
    });

    test("rejects a developer deleting someone else's comment", async () => {
        const otherDev = { id: 100, organization_id: 2, role: "Developer" };
        CommentRepository.findById.mockResolvedValue({ id: 5, task_id: 1, user_id: orgUser.id });
        TaskRepository.findById.mockResolvedValue(task);
        CommentRepository.countReplies.mockResolvedValue(0);

        await expect(CommentService.remove(5, otherDev)).rejects.toThrow(
            "You do not have permission to delete this comment"
        );
    });
});
