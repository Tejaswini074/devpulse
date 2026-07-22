const CalendarRepository = require("./calendar.repository");

class CalendarService {

    async listByYear(organizationId, year) {
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
        return CalendarRepository.findByYear(organizationId, targetYear);
    }

    async create(user, data) {
        const result = await CalendarRepository.create({
            organization_id: user.organization_id,
            calendar_date: data.calendar_date,
            day_type: "Holiday",
            holiday_name: data.holiday_name,
            holiday_type: data.holiday_type,
            working_hours: 0,
            description: data.description,
            created_by: user.id
        });
        return { id: result.insertId };
    }

    async remove(id, organizationId) {
        const entry = await CalendarRepository.findById(id, organizationId);
        if (!entry) {
            throw new Error("Calendar entry not found");
        }
        await CalendarRepository.remove(id);
        return true;
    }
}

module.exports = new CalendarService();
