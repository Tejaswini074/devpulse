const InviteRepository = require("./invite.repository");
const { generateEmployeeCode } = require("../../utils/generateCode");
const { hashPassword } = require("../../utils/hash");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { sendMail } = require("../../mail/mail.service");
const MSG = require("../../constants/messages");

class InviteService {

    // Invite Employee
    async inviteUser(data) {

        const existingUser = await InviteRepository.findUserByEmail(data.email);

        if (existingUser) {
            throw new Error(MSG.EMAIL_ALREADY_EXISTS);
        }

        const employeeCode = generateEmployeeCode();

        const inviteToken = uuidv4().replace(/-/g, "");

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        await InviteRepository.createInvitation({

            employee_code: employeeCode,
            organization_id: data.organization_id,
            team_id: data.team_id,
            name: data.name,
            email: data.email,
            role: data.role,
            designation: data.designation,
            department: data.department,
            joining_date: data.joining_date,
            invite_token: inviteToken,
            invite_expires_at: expiresAt,
            created_by: data.created_by

        });

        // Send Invite Email

        const templatePath = path.join(__dirname, "../../mail/templates/inviteUser.html");

        let html = fs.readFileSync(templatePath, "utf8");

        html = html
            .replace("{{NAME}}", data.name)
            .replace("{{ROLE}}", data.role)
            .replace(
                "{{INVITE_LINK}}",
                `${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`
            );

        await sendMail({
            to: data.email,
            subject: "You're invited to DevPulse",
            html
        });

        return true;
    }

    // Verify Invite Link

    async verifyInvite(token) {

        const invite = await InviteRepository.findInviteByToken(token);

        if (!invite) {
            throw new Error(MSG.INVALID_INVITE_TOKEN);
        }

        if (invite.invite_accepted) {
            throw new Error(MSG.INVITE_ALREADY_ACCEPTED);
        }

        if (new Date(invite.invite_expires_at) < new Date()) {
            throw new Error(MSG.INVITE_EXPIRED);
        }

        return {
            name: invite.name,
            email: invite.email,
            role: invite.role,
            designation: invite.designation
        };
    }

    // Accept Invite

    async acceptInvite(token, password) {

        const invite = await InviteRepository.findInviteByToken(token);
        if (!invite) {
            throw new Error(MSG.INVALID_INVITE_TOKEN);
        }
        if (invite.invite_accepted) {
            throw new Error(MSG.INVITE_ALREADY_ACCEPTED);
        }
        if (new Date(invite.invite_expires_at) < new Date()) {
            throw new Error(MSG.INVITE_EXPIRED);
        }

        const hashedPassword = await hashPassword(password);
        await InviteRepository.acceptInvite(invite.id, hashedPassword);
        return true;
    }

    // Resend Invite

    async resendInvite(token) {

        const invite = await InviteRepository.findInviteByToken(token);
        if (!invite) {
            throw new Error(MSG.INVALID_INVITE_TOKEN);
        }

        const newToken = uuidv4().replace(/-/g, "");
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);

        await InviteRepository.resendInvite(            invite.id,            newToken,            expiresAt        );

        const templatePath = path.join(__dirname, "../../mail/templates/inviteUser.html");

        let html = fs.readFileSync(templatePath, "utf8");

        html = html
            .replace("{{NAME}}", invite.name)
            .replace("{{ROLE}}", invite.role)
            .replace(
                "{{INVITE_LINK}}",
                `${process.env.FRONTEND_URL}/accept-invite/${newToken}`
            );
            
        await sendMail({
            to: invite.email,
            subject: "Your DevPulse Invitation",
            html
        });
        return true;
    }
}

module.exports = new InviteService();