const express = require("express");
const router = express.Router();
const ActivityLogController = require("./activityLog.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.get("/", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), ActivityLogController.list);

module.exports = router;
