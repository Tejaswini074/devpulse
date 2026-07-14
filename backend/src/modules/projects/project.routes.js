const express = require("express");
const router = express.Router();
const ProjectController = require("./project.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { projectValidator, addMemberValidator } = require("./project.validator");
const ROLES = require("../../constants/roles");

const canManage = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER);

router.use(authMiddleware);

router.post("/", canManage, projectValidator, validate, ProjectController.create);

router.get("/", ProjectController.list);

router.get("/:id", ProjectController.getById);

router.put("/:id", canManage, projectValidator, validate, ProjectController.update);

router.delete("/:id", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), ProjectController.remove);

router.post("/:id/members", canManage, addMemberValidator, validate, ProjectController.addMember);

router.delete("/:id/members/:userId", canManage, ProjectController.removeMember);

module.exports = router;
