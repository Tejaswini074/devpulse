const { body } = require("express-validator");

exports.inviteValidator = [

    body("team_id")
        .optional()
        .isInt()
        .withMessage("Invalid team"),

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email required"),

    body("role")
        .isIn([
            "Super Admin",
            "Admin",
            "Manager",
            "Developer",
            "Tester"
        ])
        .withMessage("Invalid role")

];

exports.acceptInviteValidator = [
    body("token")
        .notEmpty()
        .withMessage("Token required"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
];

exports.resendInviteValidator = [
    body("token")
        .notEmpty()
        .withMessage("Token required")

];