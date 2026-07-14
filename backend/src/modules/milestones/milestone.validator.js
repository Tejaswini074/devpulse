const { body, query } = require("express-validator");

exports.milestoneValidator = [
    body("project_id")
        .notEmpty()
        .withMessage("project_id is required")
        .isInt()
        .withMessage("Invalid project_id"),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 200 })
        .withMessage("Title is too long"),

    body("target_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid target date")
];

exports.listMilestonesValidator = [
    query("project_id")
        .notEmpty()
        .withMessage("project_id is required")
        .isInt()
        .withMessage("Invalid project_id")
];

exports.milestoneStatusValidator = [
    body("status")
        .notEmpty()
        .isIn(["Pending", "Completed"])
        .withMessage("Invalid status")
];
