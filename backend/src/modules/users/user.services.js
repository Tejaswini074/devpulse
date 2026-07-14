const UserRepository = require("./user.repository");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");

class UserService {

    async list(organizationId, query) {
        const { page, pageSize, limit, offset } = getPagination({ ...query, pageSize: query.pageSize ?? 100 });
        const filters = { role: query.role, teamId: query.team_id };
        const [rows, total] = await Promise.all([
            UserRepository.findAll(organizationId, { limit, offset, ...filters }),
            UserRepository.count(organizationId, filters)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async getById(id, organizationId) {
        const user = await UserRepository.findById(id, organizationId);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }

    async update(id, organizationId, data) {
        const user = await UserRepository.findById(id, organizationId);
        if (!user) {
            throw new Error("User not found");
        }
        await UserRepository.update(id, organizationId, {
            role: data.role ?? user.role,
            team_id: data.team_id,
            designation: data.designation,
            department: data.department,
            status: data.status ?? user.status
        });
        return true;
    }

    async remove(id, organizationId) {
        const user = await UserRepository.findById(id, organizationId);
        if (!user) {
            throw new Error("User not found");
        }
        await UserRepository.softDelete(id, organizationId);
        return true;
    }
}

module.exports = new UserService();
