const db = require("../../config/db");

class CalendarRepository {

    async findByYear(organizationId, year) {
        const sql = `
            SELECT * FROM work_calendar
            WHERE organization_id = ? AND YEAR(calendar_date) = ?
            ORDER BY calendar_date ASC
        `;
        const [rows] = await db.execute(sql, [organizationId, year]);
        return rows;
    }

    async create(data) {
        const sql = `
            INSERT INTO work_calendar
                (organization_id, calendar_date, day_type, holiday_name, holiday_type, working_hours, description, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.organization_id,
            data.calendar_date,
            data.day_type ?? "Holiday",
            data.holiday_name ?? null,
            data.holiday_type ?? "Company",
            data.working_hours ?? 0,
            data.description ?? null,
            data.created_by
        ]);
        return result;
    }

    async findById(id, organizationId) {
        const [rows] = await db.execute(
            "SELECT * FROM work_calendar WHERE id = ? AND organization_id = ?",
            [id, organizationId]
        );
        return rows[0];
    }

    async remove(id) {
        const [result] = await db.execute("DELETE FROM work_calendar WHERE id = ?", [id]);
        return result;
    }
}

module.exports = new CalendarRepository();
