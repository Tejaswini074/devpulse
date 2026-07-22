jest.mock("./sprint.repository");

const SprintRepository = require("./sprint.repository");
const SprintService = require("./sprint.services");

describe("SprintService.getById", () => {
    beforeEach(() => jest.clearAllMocks());

    test("computes points_total, points_done, and completion_pct from the sprint's tasks", async () => {
        SprintRepository.findById.mockResolvedValue({ id: 1, project_id: 1, sprint_name: "Sprint 1" });
        SprintRepository.findTasks.mockResolvedValue([
            { id: 1, status: "Done", story_points: 5 },
            { id: 2, status: "In Progress", story_points: 3 },
            { id: 3, status: "Done", story_points: 2 }
        ]);

        const result = await SprintService.getById(1, 2);

        expect(result.points_total).toBe(10);
        expect(result.points_done).toBe(7);
        expect(result.completion_pct).toBe(70);
    });

    test("returns 0% completion for a sprint with no tasks", async () => {
        SprintRepository.findById.mockResolvedValue({ id: 1, project_id: 1 });
        SprintRepository.findTasks.mockResolvedValue([]);

        const result = await SprintService.getById(1, 2);

        expect(result.points_total).toBe(0);
        expect(result.completion_pct).toBe(0);
    });

    test("throws when the sprint does not belong to the org", async () => {
        SprintRepository.findById.mockResolvedValue(undefined);
        await expect(SprintService.getById(1, 2)).rejects.toThrow("Sprint not found");
    });
});
