const { body } = require("express-validator");

exports.projectValidator = [
    body("project_name")
        .trim()
        .notEmpty()
        .withMessage("Project name is required")
        .isLength({ min: 2, max: 200 })
        .withMessage("Project name must be between 2 and 200 characters"),

    body("description")
        .optional()
        .isLength({ max: 5000 })
        .withMessage("Description is too long"),

    body("project_type")
        .optional()
        .isIn(["Internal", "Client", "Research"])
        .withMessage("Invalid project type"),

    body("status")
        .optional()
        .isIn(["Planned", "Active", "Completed", "On Hold", "Cancelled"])
        .withMessage("Invalid status"),

    body("priority")
        .optional()
        .isIn(["Low", "Medium", "High", "Critical"])
        .withMessage("Invalid priority"),

    body("project_manager")
        .optional()
        .isInt()
        .withMessage("Invalid project manager"),

    body("start_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid start date"),

    body("end_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid end date")
];

exports.addMemberValidator = [
    body("user_id")
        .notEmpty()
        .withMessage("user_id is required")
        .isInt()
        .withMessage("Invalid user_id"),

    body("member_role")
        .optional()
        .isIn(["Project Manager", "Developer", "Tester", "UI/UX", "Business Analyst"])
        .withMessage("Invalid member role")
];
