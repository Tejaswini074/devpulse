const express = require("express");
const router = express.Router();
const TeamController = require("./team.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { teamValidator } = require("./team.validator");
const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.post("/", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), teamValidator, validate, TeamController.create);

router.get("/", TeamController.list);

router.get("/:id", TeamController.getById);

router.put("/:id", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), teamValidator, validate, TeamController.update);

router.delete("/:id", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), TeamController.deactivate);

module.exports = router;
