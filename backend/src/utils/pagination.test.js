const { getPagination, buildPaginatedResponse } = require("./pagination");

describe("pagination utils", () => {
    describe("getPagination", () => {
        test("defaults to page 1, pageSize 20 when query is empty", () => {
            expect(getPagination({})).toEqual({ page: 1, pageSize: 20, limit: 20, offset: 0 });
        });

        test("computes offset from page and pageSize", () => {
            expect(getPagination({ page: "3", pageSize: "10" })).toEqual({ page: 3, pageSize: 10, limit: 10, offset: 20 });
        });

        test("clamps pageSize to a maximum of 100", () => {
            expect(getPagination({ pageSize: "500" }).pageSize).toBe(100);
        });

        test("clamps a negative page to a minimum of 1", () => {
            expect(getPagination({ page: "-5" })).toEqual({ page: 1, pageSize: 20, limit: 20, offset: 0 });
        });

        test("pageSize of 0 is falsy and falls back to the default of 20 (not clamped to 1)", () => {
            expect(getPagination({ pageSize: "0" }).pageSize).toBe(20);
        });

        test("falls back to defaults for non-numeric input", () => {
            expect(getPagination({ page: "abc", pageSize: "xyz" })).toEqual({ page: 1, pageSize: 20, limit: 20, offset: 0 });
        });
    });

    describe("buildPaginatedResponse", () => {
        test("wraps rows with pagination metadata", () => {
            const result = buildPaginatedResponse([{ id: 1 }, { id: 2 }], 42, 2, 10);
            expect(result).toEqual({
                items: [{ id: 1 }, { id: 2 }],
                pagination: { page: 2, pageSize: 10, total: 42, totalPages: 5 }
            });
        });

        test("totalPages is 0 when there are no rows", () => {
            expect(buildPaginatedResponse([], 0, 1, 20).pagination.totalPages).toBe(0);
        });
    });
});
