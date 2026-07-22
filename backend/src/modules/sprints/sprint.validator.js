const { body } = require("express-validator");

exports.sprintValidator = [
    body("project_id")
        .notEmpty()
        .withMessage("project_id is required")
        .isInt()
        .withMessage("Invalid project_id"),

    body("sprint_name")
        .trim()
        .notEmpty()
        .withMessage("Sprint name is required")
        .isLength({ max: 100 })
        .withMessage("Sprint name is too long"),

    body("goal")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("Goal is too long"),

    body("start_date")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Invalid start date"),

    body("end_date")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Invalid end date")
];

exports.sprintStatusValidator = [
    body("status")
        .notEmpty()
        .isIn(["Planned", "Active", "Completed"])
        .withMessage("Invalid status")
];
