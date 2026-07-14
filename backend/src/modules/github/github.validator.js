const { body } = require("express-validator");

exports.usernameValidator = [
    body("github_username")
        .trim()
        .notEmpty()
        .withMessage("github_username is required")
        .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/)
        .withMessage("Invalid GitHub username")
];
