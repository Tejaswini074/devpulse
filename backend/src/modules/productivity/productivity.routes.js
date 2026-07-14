const express = require("express");
const router = express.Router();
const ProductivityController = require("./productivity.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.get("/me", ProductivityController.getMine);

router.get("/team", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER), ProductivityController.getTeam);

module.exports = router;
