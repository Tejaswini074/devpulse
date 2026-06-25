const AuthService = require("./auth.service");
const Response = require("../../utils/response");
const MSG = require("../../constants/messages");

class AuthController {
    async register(req, res) {
        try {
            const data = {
                ...req.body,
                created_by: req.user ? req.user.id : null
            };
            const result = await AuthService.register(data);
            return Response.success(
                res,
                MSG.REGISTER_SUCCESS,
                result,
                201
            );
        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message || MSG.INTERNAL_SERVER_ERROR,
                500
            );
        }
    }
    
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
            const result = await AuthService.login(email, password, ipAddress);
            return Response.success(
                res,
                MSG.LOGIN_SUCCESS,
                result
            );
        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message || MSG.INTERNAL_SERVER_ERROR,
                500
            );
        }
    }

    async logout(req, res) {
        try {
            await AuthService.logout(req.user.id);
            return Response.success(
                res,
                MSG.LOGOUT_SUCCESS
            );
        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message || MSG.INTERNAL_SERVER_ERROR,
                500
            );
        }
    }

    async getProfile(req, res) {
        try {
            const result = await AuthService.getProfile(req.user.id);
            return Response.success(res, MSG.DATA_FETCHED, result);
        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message || MSG.INTERNAL_SERVER_ERROR,
                500
            );
        }
    }

    async updateProfile(req, res) {
        try {
            await AuthService.updateProfile(req.user.id, req.body);
            return Response.success(
                res,
                MSG.PROFILE_UPDATED
            );
        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message || MSG.INTERNAL_SERVER_ERROR,
                500
            );
        }
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            await AuthService.changePassword(req.user.id, currentPassword, newPassword);
            return Response.success(
                res,
                MSG.PASSWORD_CHANGED
            );

        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message || MSG.INTERNAL_SERVER_ERROR,
                500
            );
        }
    }

    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const result = await AuthService.refreshToken(refreshToken);
            return Response.success(
                res,
                MSG.TOKEN_REFRESHED,
                result
            );

        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message, 401
            );
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const ip = req.ip || req.socket.remoteAddress;

            await AuthService.forgotPassword(email, ip); return Response.success(
                res,
                MSG.PASSWORD_RESET_SENT
            );

        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                MSG.INTERNAL_SERVER_ERROR
            );
        }

    }
}

module.exports = new AuthController();