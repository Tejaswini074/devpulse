const MilestoneRepository = require("./milestone.repository");

class MilestoneService {

    async create(user, data) {
        const result = await MilestoneRepository.create({ ...data, created_by: user.id });
        return { id: result.insertId };
    }

    async listByProject(projectId, organizationId) {
        return MilestoneRepository.findByProject(projectId, organizationId);
    }

    async update(id, organizationId, data) {
        const milestone = await MilestoneRepository.findById(id, organizationId);
        if (!milestone) {
            throw new Error("Milestone not found");
        }
        await MilestoneRepository.update(id, data);
        return true;
    }

    async updateStatus(id, organizationId, status) {
        const milestone = await MilestoneRepository.findById(id, organizationId);
        if (!milestone) {
            throw new Error("Milestone not found");
        }
        await MilestoneRepository.updateStatus(id, status);
        return true;
    }

    async remove(id, organizationId) {
        const milestone = await MilestoneRepository.findById(id, organizationId);
        if (!milestone) {
            throw new Error("Milestone not found");
        }
        await MilestoneRepository.remove(id);
        return true;
    }
}

module.exports = new MilestoneService();
