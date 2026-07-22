const ActivityLogRepository = require("./activityLog.repository");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");

class ActivityLogService {

    async list(organizationId, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const filters = {
            module_name: query.module_name,
            user_id: query.user_id,
            from: query.from,
            to: query.to
        };
        const [rows, total] = await Promise.all([
            ActivityLogRepository.findAll(organizationId, filters, { limit, offset }),
            ActivityLogRepository.count(organizationId, filters)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }
}

module.exports = new ActivityLogService();
