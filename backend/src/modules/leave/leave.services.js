const LeaveRepository = require("./leave.repository");
const NotificationService = require("../notifications/notification.services");
const UserRepository = require("../users/user.repository");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");
const ROLES = require("../../constants/roles");

function daysBetweenInclusive(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

class LeaveService {

    async create(user, data) {
        const totalDays = daysBetweenInclusive(data.start_date, data.end_date);
        if (totalDays <= 0) {
            throw new Error("End date must be on or after the start date");
        }

        const result = await LeaveRepository.create({
            organization_id: user.organization_id,
            user_id: user.id,
            leave_type: data.leave_type,
            start_date: data.start_date,
            end_date: data.end_date,
            total_days: totalDays,
            reason: data.reason
        });

        const managerId = await LeaveRepository.findManagerForUser(user.id);
        const approverIds = managerId ? [managerId] : await LeaveRepository.findAdmins(user.organization_id);
        const requester = await UserRepository.findById(user.id, user.organization_id);

        for (const approverId of approverIds) {
            if (approverId !== user.id) {
                await NotificationService.notify(user.organization_id, approverId, {
                    title: "New leave request",
                    message: `${requester?.name ?? "A team member"} requested ${totalDays} day(s) leave`,
                    type: "Leave",
                    action_url: "/leave"
                });
            }
        }

        return { id: result.insertId, total_days: totalDays };
    }

    async listMine(userId, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const [rows, total] = await Promise.all([
            LeaveRepository.findMine(userId, { limit, offset }),
            LeaveRepository.countMine(userId)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async listTeam(user, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const managerId = user.role === ROLES.MANAGER ? user.id : null;
        const [rows, total] = await Promise.all([
            LeaveRepository.findTeamRequests(user.organization_id, managerId, { limit, offset }),
            LeaveRepository.countTeamRequests(user.organization_id, managerId)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async updateStatus(id, user, status, remarks) {
        const request = await LeaveRepository.findById(id, user.organization_id);
        if (!request) {
            throw new Error("Leave request not found");
        }
        if (request.status !== "Pending") {
            throw new Error("This request has already been decided");
        }

        if (user.role === ROLES.MANAGER) {
            const managerId = await LeaveRepository.findManagerForUser(request.user_id);
            if (managerId !== user.id) {
                throw new Error("You can only approve requests from your own team");
            }
        }

        await LeaveRepository.updateStatus(id, status, user.id, remarks);

        await NotificationService.notify(user.organization_id, request.user_id, {
            title: `Leave request ${status.toLowerCase()}`,
            message: `Your leave request for ${request.start_date} to ${request.end_date} was ${status.toLowerCase()}`,
            type: "Leave",
            action_url: "/leave"
        });

        return true;
    }

    async cancel(id, user) {
        const request = await LeaveRepository.findById(id, user.organization_id);
        if (!request) {
            throw new Error("Leave request not found");
        }
        if (request.user_id !== user.id) {
            throw new Error("You can only cancel your own requests");
        }
        if (request.status !== "Pending") {
            throw new Error("Only pending requests can be cancelled");
        }
        await LeaveRepository.cancel(id);
        return true;
    }
}

module.exports = new LeaveService();
