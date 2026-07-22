jest.mock("./calendar.repository");

const CalendarRepository = require("./calendar.repository");
const CalendarService = require("./calendar.services");

describe("CalendarService.listByYear", () => {
    beforeEach(() => jest.clearAllMocks());

    test("uses the given year", async () => {
        CalendarRepository.findByYear.mockResolvedValue([{ id: 1, calendar_date: "2026-01-01" }]);

        const result = await CalendarService.listByYear(1, "2025");

        expect(CalendarRepository.findByYear).toHaveBeenCalledWith(1, 2025);
        expect(result).toEqual([{ id: 1, calendar_date: "2026-01-01" }]);
    });

    test("defaults to the current year when none is given", async () => {
        CalendarRepository.findByYear.mockResolvedValue([]);

        await CalendarService.listByYear(1, undefined);

        expect(CalendarRepository.findByYear).toHaveBeenCalledWith(1, new Date().getFullYear());
    });
});

describe("CalendarService.create", () => {
    beforeEach(() => jest.clearAllMocks());

    test("creates a Holiday entry scoped to the user's organization", async () => {
        CalendarRepository.create.mockResolvedValue({ insertId: 7 });

        const result = await CalendarService.create(
            { id: 3, organization_id: 1 },
            { calendar_date: "2026-08-15", holiday_name: "Independence Day", holiday_type: "National", description: "Public holiday" }
        );

        expect(CalendarRepository.create).toHaveBeenCalledWith({
            organization_id: 1,
            calendar_date: "2026-08-15",
            day_type: "Holiday",
            holiday_name: "Independence Day",
            holiday_type: "National",
            working_hours: 0,
            description: "Public holiday",
            created_by: 3
        });
        expect(result).toEqual({ id: 7 });
    });
});

describe("CalendarService.remove", () => {
    beforeEach(() => jest.clearAllMocks());

    test("removes an entry that belongs to the org", async () => {
        CalendarRepository.findById.mockResolvedValue({ id: 5, organization_id: 1 });
        CalendarRepository.remove.mockResolvedValue({ affectedRows: 1 });

        const result = await CalendarService.remove(5, 1);

        expect(CalendarRepository.remove).toHaveBeenCalledWith(5);
        expect(result).toBe(true);
    });

    test("throws when the entry does not belong to the org", async () => {
        CalendarRepository.findById.mockResolvedValue(undefined);

        await expect(CalendarService.remove(5, 1)).rejects.toThrow("Calendar entry not found");
        expect(CalendarRepository.remove).not.toHaveBeenCalled();
    });
});
