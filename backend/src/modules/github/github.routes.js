const express = require("express");
const router = express.Router();
const GithubController = require("./github.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { usernameValidator } = require("./github.validator");

router.use(authMiddleware);

router.put("/username", usernameValidator, validate, GithubController.setUsername);

router.post("/sync", GithubController.sync);

router.get("/activity", GithubController.getActivity);

module.exports = router;
