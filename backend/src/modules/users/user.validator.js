const { body } = require("express-validator");

exports.updateUserValidator = [
    body("role")
        .optional()
        .isIn(["Super Admin", "Admin", "Manager", "Developer", "Tester"])
        .withMessage("Invalid role"),

    body("team_id")
        .optional({ nullable: true })
        .isInt()
        .withMessage("Invalid team_id"),

    body("status")
        .optional()
        .isIn(["Pending", "Active", "Inactive"])
        .withMessage("Invalid status")
];
