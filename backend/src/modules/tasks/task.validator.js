const { body } = require("express-validator");

const STATUSES = ["Backlog", "Todo", "In Progress", "Code Review", "Testing", "Done", "Blocked"];

exports.taskValidator = [
    body("project_id")
        .notEmpty()
        .withMessage("project_id is required")
        .isInt()
        .withMessage("Invalid project_id"),

    body("assigned_to")
        .notEmpty()
        .withMessage("assigned_to is required")
        .isInt()
        .withMessage("Invalid assigned_to"),

    body("sprint_id")
        .optional({ nullable: true })
        .isInt()
        .withMessage("Invalid sprint_id"),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 2, max: 255 })
        .withMessage("Title must be between 2 and 255 characters"),

    body("task_type")
        .optional()
        .isIn(["Story", "Feature", "Bug", "Task", "Research", "Documentation"])
        .withMessage("Invalid task type"),

    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid priority"),

    body("status")
        .optional()
        .isIn(STATUSES)
        .withMessage("Invalid status"),

    body("due_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid due date")
];

exports.taskStatusValidator = [
    body("status")
        .notEmpty()
        .withMessage("status is required")
        .isIn(STATUSES)
        .withMessage("Invalid status")
];
