jest.mock("../../src/config/db", () => ({
    execute: jest.fn(),
    query: jest.fn()
}));

const db = require("../../src/config/db");
const TaskRepository = require("../../src/modules/tasks/task.repository");
const ProjectRepository = require("../../src/modules/projects/project.repository");
const MilestoneRepository = require("../../src/modules/milestones/milestone.repository");
const SprintRepository = require("../../src/modules/sprints/sprint.repository");

// Regression coverage for a real bug an E2E run caught: the "create task/project/
// milestone/sprint" forms always submit an empty string for an unset optional date
// (never omit the key), which used to reach MySQL as due_date='' and fail with
// "Incorrect date value" since a DATE column only accepts a real date or NULL.

describe("Empty-string optional dates are normalized to NULL before hitting MySQL", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        db.execute.mockResolvedValue([{ insertId: 1 }]);
    });

    test("TaskRepository.create sends null, not '', for an empty due_date", async () => {
        await TaskRepository.create({
            organization_id: 1, task_code: "TSK-1", project_id: 1, assigned_to: 1,
            title: "Task", created_by: 1, due_date: ""
        });

        const params = db.execute.mock.calls[0][1];
        expect(params[params.length - 2]).toBeNull(); // due_date is second-to-last bound param
    });

    test("ProjectRepository.create sends null, not '', for empty start_date/end_date", async () => {
        await ProjectRepository.create({
            organization_id: 1, project_code: "P-1", project_name: "Project", created_by: 1,
            start_date: "", end_date: ""
        });

        const params = db.execute.mock.calls[0][1];
        expect(params).toContain(null);
        expect(params).not.toContain("");
    });

    test("MilestoneRepository.create sends null, not '', for an empty target_date", async () => {
        await MilestoneRepository.create({ project_id: 1, title: "Milestone", created_by: 1, target_date: "" });

        const params = db.execute.mock.calls[0][1];
        expect(params).toContain(null);
        expect(params).not.toContain("");
    });

    test("SprintRepository.create sends null, not '', for empty start_date/end_date", async () => {
        await SprintRepository.create({ project_id: 1, sprint_name: "Sprint 1", created_by: 1, start_date: "", end_date: "" });

        const params = db.execute.mock.calls[0][1];
        expect(params).toContain(null);
        expect(params).not.toContain("");
    });
});
