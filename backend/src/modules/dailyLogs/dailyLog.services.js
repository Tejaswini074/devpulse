const DailyLogRepository = require("./dailyLog.repository");
const { generateLogCode } = require("../../utils/generateCode");
const { getPagination, buildPaginatedResponse } = require("../../utils/pagination");
const { getToday, getWeekRange, getMonthRange } = require("../../utils/dateRange");

class DailyLogService {

    async create(user, data) {
        const result = await DailyLogRepository.create({
            log_code: generateLogCode(),
            user_id: user.id,
            project_id: data.project_id,
            task_id: data.task_id,
            log_type: data.log_type,
            hours_worked: data.hours_worked,
            work_description: data.work_description,
            work_status: data.work_status,
            log_date: data.log_date ?? getToday(),
            created_by: user.id
        });
        return { id: result.insertId };
    }

    async list(user, query) {
        const { page, pageSize, limit, offset } = getPagination(query);
        const isManager = ["Admin", "Super Admin", "Manager"].includes(user.role);

        const filters = {
            user_id: isManager ? query.user_id : user.id,
            project_id: query.project_id,
            from: query.from,
            to: query.to
        };

        const [rows, total] = await Promise.all([
            DailyLogRepository.findAll(user.organization_id, filters, { limit, offset }),
            DailyLogRepository.count(user.organization_id, filters)
        ]);
        return buildPaginatedResponse(rows, total, page, pageSize);
    }

    async update(id, user, data) {
        const log = await DailyLogRepository.findById(id, user.id);
        if (!log) {
            throw new Error("Daily log not found");
        }
        await DailyLogRepository.update(id, user.id, data);
        return true;
    }

    async remove(id, user) {
        const log = await DailyLogRepository.findById(id, user.id);
        if (!log) {
            throw new Error("Daily log not found");
        }
        await DailyLogRepository.softDelete(id, user.id);
        return true;
    }

    async userHours(userId) {
        const today = getToday();
        const week = getWeekRange();
        const month = getMonthRange();

        const [todayHours, weeklyHours, monthlyHours] = await Promise.all([
            DailyLogRepository.sumHours(userId, today, today),
            DailyLogRepository.sumHours(userId, week.start, week.end),
            DailyLogRepository.sumHours(userId, month.start, month.end)
        ]);

        return { todayHours, weeklyHours, monthlyHours };
    }
}

module.exports = new DailyLogService();
