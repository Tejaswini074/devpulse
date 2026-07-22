const { body } = require("express-validator");

exports.calendarValidator = [
    body("calendar_date")
        .notEmpty()
        .withMessage("calendar_date is required")
        .isISO8601()
        .withMessage("Invalid date"),

    body("holiday_name")
        .trim()
        .notEmpty()
        .withMessage("holiday_name is required")
        .isLength({ max: 200 })
        .withMessage("holiday_name is too long"),

    body("holiday_type")
        .optional()
        .isIn(["National", "State", "Company"])
        .withMessage("Invalid holiday_type"),

    body("description")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("Description is too long")
];
