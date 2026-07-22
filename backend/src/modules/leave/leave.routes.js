const express = require("express");
const router = express.Router();
const LeaveController = require("./leave.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { leaveValidator, leaveStatusValidator } = require("./leave.validator");
const ROLES = require("../../constants/roles");

const canApprove = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.use(authMiddleware);

router.post("/", leaveValidator, validate, LeaveController.create);

router.get("/me", LeaveController.listMine);

router.get("/team", canApprove, LeaveController.listTeam);

router.patch("/:id/status", canApprove, leaveStatusValidator, validate, LeaveController.updateStatus);

router.delete("/:id", LeaveController.cancel);

module.exports = router;
