const express = require("express");
const router = express.Router();
const MilestoneController = require("./milestone.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { milestoneValidator, listMilestonesValidator, milestoneStatusValidator } = require("./milestone.validator");
const ROLES = require("../../constants/roles");

const canManage = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.use(authMiddleware);

router.post("/", canManage, milestoneValidator, validate, MilestoneController.create);

router.get("/", listMilestonesValidator, validate, MilestoneController.listByProject);

router.put("/:id", canManage, milestoneValidator, validate, MilestoneController.update);

router.patch("/:id/status", canManage, milestoneStatusValidator, validate, MilestoneController.updateStatus);

router.delete("/:id", canManage, MilestoneController.remove);

module.exports = router;
