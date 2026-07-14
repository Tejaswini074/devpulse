const express = require("express");
const router = express.Router();
const UserController = require("./user.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { updateUserValidator } = require("./user.validator");
const ROLES = require("../../constants/roles");

const canManage = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN);

router.use(authMiddleware);

router.get("/", UserController.list);

router.get("/:id", UserController.getById);

router.put("/:id", canManage, updateUserValidator, validate, UserController.update);

router.delete("/:id", canManage, UserController.remove);

module.exports = router;
