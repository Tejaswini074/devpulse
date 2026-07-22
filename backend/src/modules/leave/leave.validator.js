const { body } = require("express-validator");

exports.leaveValidator = [
    body("leave_type")
        .optional({ nullable: true })
        .isIn(["Casual", "Sick", "Earned", "Work From Home", "Comp Off"])
        .withMessage("Invalid leave type"),

    body("start_date")
        .notEmpty()
        .withMessage("start_date is required")
        .isISO8601()
        .withMessage("Invalid start date"),

    body("end_date")
        .notEmpty()
        .withMessage("end_date is required")
        .isISO8601()
        .withMessage("Invalid end date"),

    body("reason")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("Reason is too long")
];

exports.leaveStatusValidator = [
    body("status")
        .notEmpty()
        .isIn(["Approved", "Rejected"])
        .withMessage("Invalid status"),

    body("remarks")
        .optional({ nullable: true })
        .isLength({ max: 1000 })
        .withMessage("Remarks are too long")
];
