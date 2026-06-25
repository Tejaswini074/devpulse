const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validationMiddleware");

const { registerValidator, loginValidator, changePasswordValidator, updateProfileValidator, refreshTokenValidator } = require("./auth.validator");

router.post("/register", registerValidator, validate, AuthController.register);

router.post("/login", loginValidator, validate, AuthController.login);

router.post("/logout", authMiddleware, AuthController.logout);

router.get("/profile", authMiddleware, AuthController.getProfile);

router.put("/profile", authMiddleware, updateProfileValidator, validate, AuthController.updateProfile);

router.put("/change-password", authMiddleware, changePasswordValidator, validate, AuthController.changePassword);

router.post("/refresh-token", refreshTokenValidator, validate, AuthController.refreshToken);

router.post("/forgot-password", forgotPasswordValidator, validate, AuthController.forgotPassword);

module.exports = router;