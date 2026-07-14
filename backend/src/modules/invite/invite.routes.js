const express = require("express");

const router = express.Router();

const InviteController = require("./invite.controller");

const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const ROLES = require("../../constants/roles");

const validate = require("../../middleware/validationMiddleware");

const { inviteValidator, acceptInviteValidator, resendInviteValidator } = require("./invite.validator");

const canInvite = roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN);

router.post("/", authMiddleware, canInvite, inviteValidator, validate, InviteController.inviteUser);

router.get("/:token", InviteController.verifyInvite);

router.post("/accept", acceptInviteValidator, validate, InviteController.acceptInvite);

router.post("/resend", authMiddleware, canInvite, resendInviteValidator, validate, InviteController.resendInvite);

module.exports = router;