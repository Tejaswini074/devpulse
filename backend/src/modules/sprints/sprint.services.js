const SprintRepository = require("./sprint.repository");

class SprintService {

    async create(user, data) {
        const result = await SprintRepository.create({ ...data, created_by: user.id });
        return { id: result.insertId };
    }

    async listByProject(projectId, organizationId) {
        return SprintRepository.findByProject(projectId, organizationId);
    }

    async getById(id, organizationId) {
        const sprint = await SprintRepository.findById(id, organizationId);
        if (!sprint) {
            throw new Error("Sprint not found");
        }
        const tasks = await SprintRepository.findTasks(id);

        const points_total = tasks.reduce((sum, t) => sum + (t.story_points || 0), 0);
        const points_done = tasks
            .filter((t) => t.status === "Done")
            .reduce((sum, t) => sum + (t.story_points || 0), 0);
        const completion_pct = points_total > 0 ? Math.round((points_done / points_total) * 100) : 0;

        return { ...sprint, tasks, points_total, points_done, completion_pct };
    }

    async update(id, organizationId, data) {
        const sprint = await SprintRepository.findById(id, organizationId);
        if (!sprint) {
            throw new Error("Sprint not found");
        }
        await SprintRepository.update(id, data);
        return true;
    }

    async updateStatus(id, organizationId, status) {
        const sprint = await SprintRepository.findById(id, organizationId);
        if (!sprint) {
            throw new Error("Sprint not found");
        }
        await SprintRepository.updateStatus(id, status);
        return true;
    }

    async remove(id, organizationId) {
        const sprint = await SprintRepository.findById(id, organizationId);
        if (!sprint) {
            throw new Error("Sprint not found");
        }
        await SprintRepository.remove(id);
        return true;
    }
}

module.exports = new SprintService();
