const AuthRepository = require("./auth.repository");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require("../../utils/jwt");
const { generateEmployeeCode, generateOrganizationCode } = require("../../utils/generateCode");
const MSG = require("../../constants/messages");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { sendMail } = require("../../mail/mail.service");
const db = require("../../config/db");
class AuthService {

    async register(userData) {

        const existingUser = await AuthRepository.findUserByEmail(userData.email);

        if (existingUser) {
            throw new Error(MSG.EMAIL_ALREADY_EXISTS);
        }

        const hashedPassword = await hashPassword(userData.password);

        const employeeCode = generateEmployeeCode();

        const payload = {
            employee_code: employeeCode,
            organization_id: userData.organization_id,
            team_id: userData.team_id,
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role || "Developer",
            designation: userData.designation,
            department: userData.department,
            joining_date: userData.joining_date,
            created_by: userData.created_by ?? null
        };

        console.log(payload);

        const result = await AuthRepository.createUser(payload);
        // await sendMail({
        //     to: userData.email,
        //     subject: "Welcome to DevPulse",
        //     html
        // });
        // TODO: Send Welcome Email
        // TODO: Create Activity Log
        // TODO: Create Notification

        return {
            id: result.insertId,
            employee_code: employeeCode
        };
    }

    async registerOrganization(data) {

        const existingUser = await AuthRepository.findUserByEmail(data.email);

        if (existingUser) {
            throw new Error(MSG.EMAIL_ALREADY_EXISTS);
        }

        const hashedPassword = await hashPassword(data.password);

        const { organizationId, userId } = await AuthRepository.createOrganizationWithAdmin(
            {
                organization_code: generateOrganizationCode(),
                organization_name: data.organization_name,
                email: data.email
            },
            {
                employee_code: generateEmployeeCode(),
                name: data.name,
                email: data.email,
                password: hashedPassword
            }
        );

        const payload = {
            id: userId,
            organization_id: organizationId,
            team_id: null,
            role: "Admin"
        };

        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        await AuthRepository.updateRefreshToken(userId, refreshToken);

        return {
            accessToken,
            refreshToken,
            user: {
                id: userId,
                name: data.name,
                email: data.email,
                role: "Admin",
                organization_id: organizationId,
                team_id: null
            }
        };
    }

    async login(email, password, ipAddress) {

        const user = await AuthRepository.findUserByEmail(email);
        if (!user) {
            throw new Error(
                MSG.INVALID_CREDENTIALS
            );
        }
        if (user.status !== "Active") {
            throw new Error(
                MSG.ACCOUNT_INACTIVE
            );
        }
        if (
            user.account_locked_until &&
            new Date(user.account_locked_until) > new Date()
        ) {
            throw new Error(MSG.ACCOUNT_LOCKED);
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {

            const attempts = (user.failed_login_attempts || 0) + 1;
            if (attempts >= 5) {
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + 30);
                await AuthRepository.lockAccount(user.id, lockUntil);
                throw new Error(MSG.ACCOUNT_LOCKED);

            }
            await AuthRepository.updateFailedLoginAttempts(user.id, attempts);
            throw new Error(MSG.INVALID_CREDENTIALS);
        }
        const payload = {
            id: user.id,
            organization_id: user.organization_id,
            team_id: user.team_id,
            role: user.role
        };

        const accessToken = generateAccessToken(payload);

        const refreshToken = generateRefreshToken(payload);

        await AuthRepository.updateRefreshToken(user.id, refreshToken);

        await AuthRepository.updateLastLogin(user.id, ipAddress);
        // TODO: Create Login Activity Log
        await AuthRepository.resetFailedAttempts(user.id);
        // Activity Log
        // await ActivityLogService.create({
        //     organization_id: user.organization_id,
        //     user_id: user.id,
        //     module_name: "Authentication",
        //     action: "Login",
        //     description: "User logged in successfully.",
        //     ip_address: ipAddress
        // });
        return {
            accessToken, refreshToken,
            user: {
                id: user.id,
                employee_code: user.employee_code,
                name: user.name,
                email: user.email,
                role: user.role,
                organization_id: user.organization_id,
                team_id: user.team_id
            }
        };
    }

    async logout(userId) {

        const user = await AuthRepository.findUserById(userId);

        await AuthRepository.clearRefreshToken(userId);

        // await ActivityLogService.create({
        //     organization_id: user.organization_id,
        //     user_id: user.id,
        //     module_name: "Authentication",
        //     action: "Logout",
        //     description: "User logged out."
        // });

        return true;
    }

    async getProfile(userId) {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new Error(MSG.USER_NOT_FOUND);
        }
        const { password, ...profile } = user;
        return profile;
    }

async updateProfile(userId, data) {

    await AuthRepository.updateProfile(userId, data);

    // TODO:
    // Activity Log

    return true;
}
    async changePassword(userId, currentPassword, newPassword) {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new Error(MSG.USER_NOT_FOUND);
        }
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            throw new Error("Current password is incorrect");
        }
        const isSamePassword = await comparePassword(newPassword, user.password);

        if (isSamePassword) {
            throw new Error("New password cannot be the same as the current password");
        }

        const hashedPassword = await hashPassword(newPassword);
        await AuthRepository.updatePassword(userId, hashedPassword);

        await AuthRepository.deleteOldPasswordTokens(userId);

        await AuthRepository.clearRefreshToken(userId);
        // await ActivityLogService.create({
        //     organization_id: user.organization_id,
        //     user_id,
        //     module_name: "Authentication",
        //     action: "Password Changed",
        //     description: "Password changed successfully."
        // });
        // TODO Send Password Changed Email

        // TODO Activity Log

        return true;
    }

    async refreshToken(refreshToken) {
        if (!refreshToken) {
            throw new Error(MSG.REFRESH_TOKEN_REQUIRED);
        }

        const user = await AuthRepository.findUserByRefreshToken(refreshToken);

        if (!user) {
            throw new Error(MSG.INVALID_TOKEN);
        }
        try {
            const decoded = verifyRefreshToken(refreshToken);

            if (decoded.id !== user.id) {
                throw new Error(MSG.INVALID_TOKEN);
            }
        } catch (err) {
            throw new Error(MSG.INVALID_TOKEN);

        } const payload = {
            id: user.id,
            organization_id: user.organization_id,
            team_id: user.team_id,
            role: user.role
        };

        const newAccessToken = generateAccessToken(payload);

        const newRefreshToken = generateRefreshToken(payload);

        await AuthRepository.updateRefreshToken(user.id, newRefreshToken);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
    }

    async forgotPassword(email, ipAddress) {

        const user = await AuthRepository.findUserByEmail(email);

        if (!user) { return true; }

        await AuthRepository.deleteOldPasswordTokens(user.id);
        const token = uuidv4().replace(/-/g, "");
        const expiresAt = new Date();

        expiresAt.setMinutes(
            expiresAt.getMinutes() + 15
        );
        await AuthRepository.createPasswordResetToken({
            user_id: user.id,
            token,
            expires_at: expiresAt,
            created_ip: ipAddress
        });

        const templatePath = path.join(
            __dirname,
            "../../mail/templates/forgotPassword.html"
        );

        let html = fs.readFileSync(templatePath, "utf8");

        html = html
            .replace("{{NAME}}", user.name)
            .replace(
                "{{RESET_LINK}}",
                `${process.env.FRONTEND_URL}/reset-password/${token}`
            );

        await sendMail({
            to: user.email,
            subject: "Reset Your Password",
            html
        });
        // await ActivityLogService.create({
        //     organization_id: user.organization_id,
        //     user_id: user.id,
        //     module_name: "Authentication",
        //     action: "Forgot Password",
        //     description: "Password reset email sent."
        // });
        // TODO: Create Forgot Password Activity Log

        return true;
    }

    async resetPassword(token, newPassword) {

        const resetToken =
            await AuthRepository.findPasswordResetToken(token);

        if (!resetToken) {
            throw new Error(MSG.INVALID_RESET_TOKEN);
        }

        if (new Date(resetToken.expires_at) < new Date()) {
            throw new Error(MSG.RESET_TOKEN_EXPIRED);
        }

        const user = await AuthRepository.findUserById(resetToken.user_id);

        const isSamePassword = await comparePassword(newPassword, user.password);

        if (isSamePassword) {
            throw new Error(
                "New password cannot be the same as old password"
            );
        }

        const hashedPassword =
            await hashPassword(newPassword);

        await AuthRepository.updatePassword(
            resetToken.user_id,
            hashedPassword
        );
        await AuthRepository.markPasswordResetTokenUsed(token);
        // Delete every password reset token
        await AuthRepository.deleteOldPasswordTokens(
            resetToken.user_id
        );

        // Force logout from every device
        await AuthRepository.clearRefreshToken(
            resetToken.user_id
        );

        const templatePath = path.join(
            __dirname,
            "../../mail/templates/passwordChanged.html"
        );

        let html = fs.readFileSync(templatePath, "utf8");

        html = html.replace("{{NAME}}", user.name);

        await sendMail({
            to: user.email,
            subject: "Password Changed Successfully",
            html
        });
        // await ActivityLogService.create({
        //     organization_id: user.organization_id,
        //     user_id: user.id,
        //     module_name: "Authentication",
        //     action: "Reset Password",
        //     description: "Password reset completed."
        // });
        // TODO: Activity Log

        return true;
    }
}
module.exports = new AuthService();