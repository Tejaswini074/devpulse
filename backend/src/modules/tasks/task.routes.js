const express = require("express");
const router = express.Router();
const TaskController = require("./task.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { taskValidator, taskStatusValidator } = require("./task.validator");
const ROLES = require("../../constants/roles");

const canManage = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.use(authMiddleware);

router.post("/", canManage, taskValidator, validate, TaskController.create);

router.get("/", TaskController.list);

router.get("/:id", TaskController.getById);

router.put("/:id", canManage, taskValidator, validate, TaskController.update);

router.patch("/:id/status", taskStatusValidator, validate, TaskController.updateStatus);

router.delete("/:id", canManage, TaskController.remove);

module.exports = router;
