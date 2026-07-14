const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const ROLES = require("../../constants/roles");

const { registerValidator, registerOrganizationValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator,
    changePasswordValidator, updateProfileValidator, refreshTokenValidator } = require("./auth.validator");

router.post("/register-organization", registerOrganizationValidator, validate, AuthController.registerOrganization);

router.post(
    "/register",
    authMiddleware,
    roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    registerValidator,
    validate,
    AuthController.register
);

router.post("/login", loginValidator, validate, AuthController.login);

router.post("/logout", authMiddleware, AuthController.logout);

router.get("/profile", authMiddleware, AuthController.getProfile);

router.put("/profile", authMiddleware, updateProfileValidator, validate, AuthController.updateProfile);

router.put("/change-password", authMiddleware, changePasswordValidator, validate, AuthController.changePassword);

router.post("/refresh-token", refreshTokenValidator, validate, AuthController.refreshToken);

router.post("/forgot-password", forgotPasswordValidator, validate, AuthController.forgotPassword);

router.post("/reset-password", resetPasswordValidator, validate, AuthController.resetPassword);

module.exports = router;