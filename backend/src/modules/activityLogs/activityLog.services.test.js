jest.mock("./activityLog.repository");

const ActivityLogRepository = require("./activityLog.repository");
const ActivityLogService = require("./activityLog.services");

describe("ActivityLogService.list", () => {
    beforeEach(() => jest.clearAllMocks());

    test("paginates and passes filters through to the repository", async () => {
        ActivityLogRepository.findAll.mockResolvedValue([{ id: 1, action: "created" }]);
        ActivityLogRepository.count.mockResolvedValue(1);

        const result = await ActivityLogService.list(1, {
            page: "2",
            pageSize: "10",
            module_name: "tasks",
            user_id: "5",
            from: "2026-01-01",
            to: "2026-01-31"
        });

        expect(ActivityLogRepository.findAll).toHaveBeenCalledWith(
            1,
            { module_name: "tasks", user_id: "5", from: "2026-01-01", to: "2026-01-31" },
            { limit: 10, offset: 10 }
        );
        expect(ActivityLogRepository.count).toHaveBeenCalledWith(
            1,
            { module_name: "tasks", user_id: "5", from: "2026-01-01", to: "2026-01-31" }
        );
        expect(result).toEqual({
            items: [{ id: 1, action: "created" }],
            pagination: { page: 2, pageSize: 10, total: 1, totalPages: 1 }
        });
    });

    test("defaults to page 1 when no filters are given", async () => {
        ActivityLogRepository.findAll.mockResolvedValue([]);
        ActivityLogRepository.count.mockResolvedValue(0);

        const result = await ActivityLogService.list(1, {});

        expect(ActivityLogRepository.findAll).toHaveBeenCalledWith(
            1,
            { module_name: undefined, user_id: undefined, from: undefined, to: undefined },
            { limit: 20, offset: 0 }
        );
        expect(result.pagination).toEqual({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
    });
});
