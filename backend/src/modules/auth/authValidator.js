const { body } = require("express-validator");

exports.registerValidator = [

    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Name must be between 3 and 100 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Password must contain at least one special character"),

    body("role")
        .optional()
        .isIn([
            "Admin",
            "Manager",
            "Developer"
        ])
        .withMessage("Invalid role"),

    body("organization_id")
        .optional()
        .isInt()
        .withMessage("Invalid organization"),

    body("team_id")
        .optional()
        .isInt()
        .withMessage("Invalid team"),

    body("joining_date")
        .optional()
        .isISO8601()
        .withMessage("Invalid joining date")

];

exports.loginValidator = [

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")

];

exports.changePasswordValidator = [

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[A-Z]/)
        .withMessage("Must contain uppercase letter")
        .matches(/[a-z]/)
        .withMessage("Must contain lowercase letter")
        .matches(/[0-9]/)
        .withMessage("Must contain number")
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage("Must contain special character")

];

exports.updateProfileValidator = [

    body("name")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Invalid name"),

    body("designation")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Invalid designation"),

    body("department")
        .optional()
        .isLength({ max: 100 })
        .withMessage("Invalid department")

];

exports.refreshTokenValidator = [
    body("refreshToken")
        .notEmpty()
        .withMessage(
            "Refresh token is required"
        )
];
exports.forgotPasswordValidator = [

    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email")

];