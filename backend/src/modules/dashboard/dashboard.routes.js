const express = require("express");
const router = express.Router();
const DashboardController = require("./dashboard.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.get("/", DashboardController.getMine);

router.get("/team", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER), DashboardController.getTeam);

module.exports = router;
