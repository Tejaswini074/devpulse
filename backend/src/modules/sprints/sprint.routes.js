const express = require("express");
const router = express.Router();
const SprintController = require("./sprint.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { sprintValidator, sprintStatusValidator } = require("./sprint.validator");
const ROLES = require("../../constants/roles");

const canManage = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.use(authMiddleware);

router.post("/", canManage, sprintValidator, validate, SprintController.create);

router.get("/project/:projectId", SprintController.listByProject);

router.get("/:id", SprintController.getById);

router.put("/:id", canManage, sprintValidator, validate, SprintController.update);

router.patch("/:id/status", canManage, sprintStatusValidator, validate, SprintController.updateStatus);

router.delete("/:id", canManage, SprintController.remove);

module.exports = router;
