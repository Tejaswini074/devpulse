const TeamRepository = require("./team.repository");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");

class TeamService {

    async create(organizationId, data) {
        const result = await TeamRepository.create({
            organization_id: organizationId,
            team_name: data.team_name,
            description: data.description,
            manager_id: data.manager_id
        });
        return { id: result.insertId };
    }

    async list(organizationId, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const [rows, total] = await Promise.all([
            TeamRepository.findAll(organizationId, { limit, offset }),
            TeamRepository.count(organizationId)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async getById(id, organizationId) {
        const team = await TeamRepository.findById(id, organizationId);
        if (!team) {
            throw new Error("Team not found");
        }
        const members = await TeamRepository.findMembers(id);
        return { ...team, members };
    }

    async update(id, organizationId, data) {
        const team = await TeamRepository.findById(id, organizationId);
        if (!team) {
            throw new Error("Team not found");
        }
        await TeamRepository.update(id, organizationId, data);
        return true;
    }

    async deactivate(id, organizationId) {
        const team = await TeamRepository.findById(id, organizationId);
        if (!team) {
            throw new Error("Team not found");
        }
        await TeamRepository.setStatus(id, organizationId, "Inactive");
        return true;
    }
}

module.exports = new TeamService();
