const db = require("../../config/db");

class InviteRepository {

    async findUserByEmail(email) {
        const sql = ` SELECT id  FROM users  WHERE email = ? LIMIT 1 `;
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }

    async createInvitation(data) {
        const sql = `  INSERT INTO users
            (
                employee_code,
                organization_id,
                team_id,
                name,
                email,
                role,
                designation,
                department,
                joining_date,
                invite_token,
                invite_expires_at,
                invite_accepted,
                status,
                created_by
            )
            VALUES
            ( ?,?,?,?,?,?,?,?,?,?,?,0,'Pending',? )
        `;

        const [result] = await db.execute(sql, [
            data.employee_code,
            data.organization_id,
            data.team_id,
            data.name,
            data.email,
            data.role,
            data.designation,
            data.department,
            data.joining_date,
            data.invite_token,
            data.invite_expires_at,
            data.created_by
        ]);
        return result;
    }
    async findInviteByToken(token) {

        const sql = ` SELECT * FROM users WHERE invite_token = ?  LIMIT 1 `;
        const [rows] = await db.execute(sql, [token]);
        return rows[0];
    }
    async acceptInvite(userId, password) {

        const sql = `  UPDATE users  SET
                password = ?,
                invite_accepted = 1,
                invite_token = NULL,
                invite_expires_at = NULL,
                status = 'Active',
                password_changed_at = NOW()
            WHERE id = ?
        `;
        const [result] = await db.execute(sql, [password, userId]);
        return result;
    }
    async resendInvite(userId, token, expiresAt) {

        const sql = `
            UPDATE users
            SET  invite_token = ?,
                invite_expires_at = ?

            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            token,
            expiresAt,
            userId
        ]);
        return result;
    }
}

module.exports = new InviteRepository();