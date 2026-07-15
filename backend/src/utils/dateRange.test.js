const { toISODate, getToday, getWeekRange, getMonthRange, getISOWeekNumber } = require("./dateRange");

describe("dateRange utils", () => {
    test("toISODate formats a UTC date as YYYY-MM-DD", () => {
        expect(toISODate(new Date(Date.UTC(2026, 6, 15)))).toBe("2026-07-15");
    });

    test("getToday returns today's date in ISO form", () => {
        expect(getToday()).toBe(toISODate(new Date()));
    });

    describe("getWeekRange", () => {
        test("returns Monday-Sunday for a mid-week Wednesday", () => {
            const wednesday = new Date(Date.UTC(2026, 6, 15)); // 2026-07-15 is a Wednesday
            expect(getWeekRange(wednesday)).toEqual({ start: "2026-07-13", end: "2026-07-19" });
        });

        test("treats Sunday as the end of the previous Monday's week, not the start of a new one", () => {
            const sunday = new Date(Date.UTC(2026, 6, 19));
            expect(getWeekRange(sunday)).toEqual({ start: "2026-07-13", end: "2026-07-19" });
        });

        test("handles a Monday reference date (start of week)", () => {
            const monday = new Date(Date.UTC(2026, 6, 13));
            expect(getWeekRange(monday)).toEqual({ start: "2026-07-13", end: "2026-07-19" });
        });
    });

    describe("getMonthRange", () => {
        test("returns first and last day of the month", () => {
            const midJuly = new Date(Date.UTC(2026, 6, 15));
            expect(getMonthRange(midJuly)).toEqual({ start: "2026-07-01", end: "2026-07-31" });
        });

        test("handles February in a leap year correctly", () => {
            const feb = new Date(Date.UTC(2028, 1, 10));
            expect(getMonthRange(feb)).toEqual({ start: "2028-02-01", end: "2028-02-29" });
        });
    });

    describe("getISOWeekNumber", () => {
        test("returns week 1 for Jan 1 of a year that starts mid-week", () => {
            expect(getISOWeekNumber(new Date(Date.UTC(2026, 0, 1)))).toBe(1);
        });

        test("returns a plausible mid-year week number", () => {
            const week = getISOWeekNumber(new Date(Date.UTC(2026, 6, 15)));
            expect(week).toBeGreaterThanOrEqual(28);
            expect(week).toBeLessThanOrEqual(29);
        });
    });
});
