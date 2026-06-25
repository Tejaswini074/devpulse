const AuthRepository = require("./auth.repository");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require("../../utils/jwt");
const { generateEmployeeCode } = require("../../utils/generateCode");
const MSG = require("../../constants/messages");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { sendMail } = require("../../mail/mail.service");

class AuthService {

    async register(userData) {
        const existingUser = await AuthRepository.findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error(MSG.EMAIL_ALREADY_EXISTS);
        }
        const hashedPassword = await hashPassword(userData.password);

        const employeeCode = generateEmployeeCode();
        const result = await AuthRepository.createUser({
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
            created_by: userData.created_by
        });
        // TODO: Send Welcome Email

        // TODO: Create Activity Log

        // TODO: Create Notification

        return {
            id: result.insertId,
            employee_code: employeeCode
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
        await AuthRepository.clearRefreshToken(userId);
        return true;
    }

    async getProfile(userId) {
        const user = await AuthRepository.findUserById(userId);
        if (!user) {
            throw new Error(MSG.USER_NOT_FOUND);
        }
        return user;
    }

    async updateProfile(userId, data) {
        await AuthRepository.updateProfile(userId, data);
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
        return true;
        // TODO: Send Password Changed Email

        // TODO: Create Activity Log
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
        return true;
        // TODO: Create Forgot Password Activity Log
    }
}
module.exports = new AuthService();