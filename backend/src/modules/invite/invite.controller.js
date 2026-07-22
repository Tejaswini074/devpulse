const InviteService = require("./invite.services");
const Response = require("../../utils/response");
const MSG = require("../../constants/messages");
const { logActivity } = require("../../utils/activityLogger");

class InviteController {

    async inviteUser(req, res) {
        try {
            const data = { ...req.body, organization_id: req.user.organization_id, created_by: req.user.id };
            await InviteService.inviteUser(data);

            await logActivity(req.user.organization_id, req.user.id, {
                module_name: "User",
                action: "Invite",
                description: `Invited ${req.body.email} as ${req.body.role}`
            }, req);

            return Response.success(
                res,
                MSG.INVITE_SENT
            );

        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message,
                500
            );
        }
    }

    async verifyInvite(req, res) {

        try {
            const { token } = req.params;
            const result = await InviteService.verifyInvite(token);
            return Response.success(
                res,
                MSG.DATA_FETCHED,
                result
            );

        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message,
                400
            );
        }
    }

    async acceptInvite(req, res) {

        try {
            const { token, password } = req.body;
            await InviteService.acceptInvite(token, password);

            return Response.success(
                res,
                MSG.INVITE_ACCEPTED
            );

        } catch (error) {
            console.error(error);

            return Response.error(
                res,
                error.message,
                400
            );
        }
    }

    async resendInvite(req, res) {
        try {
            const { token } = req.body;
            await InviteService.resendInvite(token);
            return Response.success(
                res,
                MSG.INVITE_RESENT
            );

        } catch (error) {
            console.error(error);
            return Response.error(
                res,
                error.message,
                400
            );
        }
    }
}

module.exports = new InviteController();