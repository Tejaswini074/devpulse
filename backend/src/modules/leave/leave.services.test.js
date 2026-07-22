jest.mock("./leave.repository");
jest.mock("../users/user.repository");
jest.mock("../notifications/notification.services");

const LeaveRepository = require("./leave.repository");
const UserRepository = require("../users/user.repository");
const NotificationService = require("../notifications/notification.services");
const LeaveService = require("./leave.services");

const user = { id: 7, organization_id: 2, role: "Developer" };

describe("LeaveService.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("computes total_days inclusive of both endpoints", async () => {
        LeaveRepository.create.mockResolvedValue({ insertId: 1 });
        LeaveRepository.findManagerForUser.mockResolvedValue(6);
        UserRepository.findById.mockResolvedValue({ name: "Priya" });

        const result = await LeaveService.create(user, {
            leave_type: "Casual",
            start_date: "2026-08-01",
            end_date: "2026-08-03",
            reason: "Trip"
        });

        expect(result.total_days).toBe(3);
        expect(LeaveRepository.create).toHaveBeenCalledWith(expect.objectContaining({ total_days: 3 }));
    });

    test("rejects when end_date is before start_date", async () => {
        await expect(
            LeaveService.create(user, { start_date: "2026-08-05", end_date: "2026-08-01" })
        ).rejects.toThrow("End date must be on or after the start date");
        expect(LeaveRepository.create).not.toHaveBeenCalled();
    });

    test("notifies the team manager when one exists, falling back to org admins otherwise", async () => {
        LeaveRepository.create.mockResolvedValue({ insertId: 1 });
        LeaveRepository.findManagerForUser.mockResolvedValue(null);
        LeaveRepository.findAdmins.mockResolvedValue([1, 2]);
        UserRepository.findById.mockResolvedValue({ name: "Priya" });

        await LeaveService.create(user, { start_date: "2026-08-01", end_date: "2026-08-01" });

        expect(NotificationService.notify).toHaveBeenCalledTimes(2);
    });
});

describe("LeaveService.updateStatus", () => {
    beforeEach(() => jest.clearAllMocks());

    test("rejects re-deciding an already-decided request", async () => {
        LeaveRepository.findById.mockResolvedValue({ id: 1, status: "Approved", user_id: 7 });
        const manager = { id: 6, organization_id: 2, role: "Admin" };

        await expect(LeaveService.updateStatus(1, manager, "Rejected")).rejects.toThrow(
            "This request has already been decided"
        );
    });

    test("rejects a manager approving a request outside their own team", async () => {
        LeaveRepository.findById.mockResolvedValue({
            id: 1, status: "Pending", user_id: 7, start_date: "2026-08-01", end_date: "2026-08-01"
        });
        LeaveRepository.findManagerForUser.mockResolvedValue(999);
        const manager = { id: 6, organization_id: 2, role: "Manager" };

        await expect(LeaveService.updateStatus(1, manager, "Approved")).rejects.toThrow(
            "You can only approve requests from your own team"
        );
    });

    test("approves and notifies the requester when the manager owns the team", async () => {
        LeaveRepository.findById.mockResolvedValue({
            id: 1, status: "Pending", user_id: 7, start_date: "2026-08-01", end_date: "2026-08-01"
        });
        LeaveRepository.findManagerForUser.mockResolvedValue(6);
        const manager = { id: 6, organization_id: 2, role: "Manager" };

        await LeaveService.updateStatus(1, manager, "Approved");

        expect(LeaveRepository.updateStatus).toHaveBeenCalledWith(1, "Approved", 6, undefined);
        expect(NotificationService.notify).toHaveBeenCalledWith(2, 7, expect.objectContaining({ type: "Leave" }));
    });
});

describe("LeaveService.cancel", () => {
    beforeEach(() => jest.clearAllMocks());

    test("rejects cancelling someone else's request", async () => {
        LeaveRepository.findById.mockResolvedValue({ id: 1, user_id: 999, status: "Pending" });
        await expect(LeaveService.cancel(1, user)).rejects.toThrow("You can only cancel your own requests");
    });

    test("rejects cancelling a request that is no longer pending", async () => {
        LeaveRepository.findById.mockResolvedValue({ id: 1, user_id: 7, status: "Approved" });
        await expect(LeaveService.cancel(1, user)).rejects.toThrow("Only pending requests can be cancelled");
    });
});
