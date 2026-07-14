const { body } = require("express-validator");

exports.dailyLogValidator = [
    body("project_id")
        .notEmpty()
        .withMessage("project_id is required")
        .isInt()
        .withMessage("Invalid project_id"),

    body("task_id")
        .notEmpty()
        .withMessage("task_id is required")
        .isInt()
        .withMessage("Invalid task_id"),

    body("hours_worked")
        .notEmpty()
        .withMessage("hours_worked is required")
        .isFloat({ min: 0.25, max: 24 })
        .withMessage("Hours worked must be between 0.25 and 24"),

    body("work_description")
        .trim()
        .notEmpty()
        .withMessage("Work description is required")
        .isLength({ max: 2000 })
        .withMessage("Work description is too long"),

    body("log_type")
        .optional()
        .isIn(["Development", "Bug Fix", "Testing", "Meeting", "Code Review", "Research", "Documentation", "Deployment", "Support"])
        .withMessage("Invalid log type"),

    body("work_status")
        .optional()
        .isIn(["In Progress", "Completed", "Blocked"])
        .withMessage("Invalid work status"),

    body("log_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid log date")
];
