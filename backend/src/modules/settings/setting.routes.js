const express = require("express");
const router = express.Router();
const SettingController = require("./setting.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.get("/", SettingController.getAll);

router.put("/", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), SettingController.update);

module.exports = router;
