const { body } = require("express-validator");

exports.commentValidator = [
    body("comment")
        .trim()
        .notEmpty()
        .withMessage("Comment is required")
        .isLength({ max: 2000 })
        .withMessage("Comment is too long"),

    body("parent_comment_id")
        .optional({ nullable: true })
        .isInt()
        .withMessage("Invalid parent_comment_id")
];
