const { body } = require("express-validator");

exports.teamValidator = [
    body("team_name")
        .trim()
        .notEmpty()
        .withMessage("Team name is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Team name must be between 2 and 100 characters"),

    body("description")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Description is too long"),

    body("manager_id")
        .optional({ nullable: true })
        .isInt()
        .withMessage("Invalid manager")
];
