const ProjectRepository = require("./project.repository");
const { generateProjectCode } = require("../../utils/generateCode");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");

class ProjectService {

    async create(user, data) {
        const result = await ProjectRepository.create({
            organization_id: user.organization_id,
            project_code: generateProjectCode(),
            project_name: data.project_name,
            description: data.description,
            project_type: data.project_type,
            client_name: data.client_name,
            status: data.status,
            priority: data.priority,
            start_date: data.start_date,
            end_date: data.end_date,
            budget: data.budget,
            project_manager: data.project_manager ?? user.id,
            created_by: user.id
        });

        await ProjectRepository.addMember(result.insertId, data.project_manager ?? user.id, "Project Manager", user.id);

        return { id: result.insertId };
    }

    async list(organizationId, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const [rows, total] = await Promise.all([
            ProjectRepository.findAll(organizationId, { limit, offset, status: query.status }),
            ProjectRepository.count(organizationId, query.status)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async getById(id, organizationId) {
        const project = await ProjectRepository.findById(id, organizationId);
        if (!project) {
            throw new Error("Project not found");
        }
        const members = await ProjectRepository.findMembers(id);
        return { ...project, members };
    }

    async update(id, user, data) {
        const project = await ProjectRepository.findById(id, user.organization_id);
        if (!project) {
            throw new Error("Project not found");
        }
        await ProjectRepository.update(id, user.organization_id, {
            ...data,
            project_manager: data.project_manager ?? project.project_manager,
            updated_by: user.id
        });
        return true;
    }

    async remove(id, organizationId) {
        const project = await ProjectRepository.findById(id, organizationId);
        if (!project) {
            throw new Error("Project not found");
        }
        await ProjectRepository.softDelete(id, organizationId);
        return true;
    }

    async addMember(projectId, organizationId, userId, memberRole, assignedBy) {
        const project = await ProjectRepository.findById(projectId, organizationId);
        if (!project) {
            throw new Error("Project not found");
        }
        await ProjectRepository.addMember(projectId, userId, memberRole, assignedBy);
        return true;
    }

    async removeMember(projectId, organizationId, userId) {
        const project = await ProjectRepository.findById(projectId, organizationId);
        if (!project) {
            throw new Error("Project not found");
        }
        await ProjectRepository.removeMember(projectId, userId);
        return true;
    }
}

module.exports = new ProjectService();
