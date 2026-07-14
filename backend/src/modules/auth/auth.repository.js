const db = require("../../config/db");

class AuthRepository {

    async createUser(userData) {

    const sql = `
        INSERT INTO users
        (
            employee_code,
            organization_id,
            team_id,
            name,
            email,
            password,
            role,
            designation,
            department,
            joining_date,
            created_by
        )
        VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `;

    const [result] = await db.execute(sql, [
        userData.employee_code,
        userData.organization_id ?? null,
        userData.team_id ?? null,
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.designation,
        userData.department,
        userData.joining_date,
        userData.created_by ?? null
    ]);

    return result;
}
    async createOrganizationWithAdmin(orgData, userData) {

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [orgResult] = await connection.execute(
                `INSERT INTO organizations (organization_code, organization_name, email)
                 VALUES (?, ?, ?)`,
                [orgData.organization_code, orgData.organization_name, orgData.email]
            );

            const organizationId = orgResult.insertId;

            const [userResult] = await connection.execute(
                `INSERT INTO users
                    (employee_code, organization_id, name, email, password, role, status, invite_accepted)
                 VALUES (?, ?, ?, ?, ?, 'Admin', 'Active', 1)`,
                [
                    userData.employee_code,
                    organizationId,
                    userData.name,
                    userData.email,
                    userData.password
                ]
            );

            await connection.commit();

            return {
                organizationId,
                userId: userResult.insertId
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async findUserByEmail(email) {

        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
            AND is_deleted = 0
            LIMIT 1
        `;

        const [rows] = await db.execute(sql, [email]);

        return rows[0];
    }

    async findUserById(id) {

        const sql = `
            SELECT
id,
employee_code,
organization_id,
team_id,
name,
email,
password,
role,
designation,
department,
joining_date,
profile_photo,
status,
last_login,
created_at,
updated_at
FROM users
WHERE id=?
AND is_deleted=0
LIMIT 1
        `;

        const [rows] = await db.execute(sql, [id]);

        return rows[0];
    }
    async findUserByRefreshToken(refreshToken) {

        const sql = `
        SELECT *
        FROM users
        WHERE refresh_token = ?
        AND is_deleted = 0
        LIMIT 1
    `;

        const [rows] = await db.execute(
            sql,
            [refreshToken]
        );

        return rows[0];

    }
    async updateRefreshToken(userId, refreshToken) {

        const sql = `
            UPDATE users
            SET refresh_token = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            refreshToken,
            userId
        ]);

        return result;
    }
    async clearRefreshToken(userId) {

        const sql = `
        UPDATE users
        SET refresh_token = NULL
        WHERE id = ?
    `;

        const [result] = await db.execute(
            sql,
            [userId]
        );

        return result;

    }
    async updateLastLogin(userId, ipAddress) {

        const sql = `
            UPDATE users
            SET
                last_login = NOW(),
                last_login_ip = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            ipAddress,
            userId
        ]);

        return result;
    }

    async updatePassword(userId, password) {

        const sql = `
            UPDATE users
            SET
                password = ?,
                password_changed_at = NOW()
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [
            password,
            userId
        ]);

        return result;
    }

  async updateProfile(userId, data) {

    const sql = `
        UPDATE users
        SET
            name = ?,
            designation = ?,
            department = ?,
            profile_photo = ?
        WHERE id = ?
    `;

    const [result] = await db.execute(sql, [
        data.name ?? null,
        data.designation ?? null,
        data.department ?? null,
        data.profile_photo ?? null,
        userId
    ]);

    return result;
}


    async createPasswordResetToken(data) {

        const sql = `
        INSERT INTO password_reset_tokens
        (
            user_id,
            token,
            expires_at,
            created_ip
        )
        VALUES (?,?,?,?)
    `;

        const [result] = await db.execute(sql, [
            data.user_id,
            data.token,
            data.expires_at,
            data.created_ip
        ]);

        return result;
    }

    async findPasswordResetToken(token) {
        const sql = `
        SELECT *
        FROM password_reset_tokens
       WHERE token = ?
AND used = FALSE
AND expires_at > NOW()
        LIMIT 1
    `;
        const [rows] = await db.execute(sql, [token]);
        return rows[0];
    }

    async markPasswordResetTokenUsed(token) {
        const sql = `
        UPDATE password_reset_tokens
        SET
            used=TRUE,
            used_at=NOW()
        WHERE token=?
    `;
        const [result] = await db.execute(sql, [token]);
        return result;
    }

    async deleteOldPasswordTokens(userId) {
        const sql = `
        DELETE FROM password_reset_tokens
        WHERE user_id=?
    `;
        const [result] = await db.execute(sql, [userId]);
        return result;
    }
    async updateFailedLoginAttempts(userId, attempts) {
        const sql = `
        UPDATE users
        SET failed_login_attempts = ?
        WHERE id = ?
    `;

        const [result] = await db.execute(sql, [attempts, userId]);
        return result;
    }

    async lockAccount(userId, lockUntil) {
        const sql = `
        UPDATE users
        SET
            account_locked_until = ?,
            failed_login_attempts = 5
        WHERE id = ?
    `;
        const [result] = await db.execute(sql, [lockUntil, userId]);
        return result;
    }

    async resetFailedAttempts(userId) {
        const sql = `
        UPDATE users
        SET
            failed_login_attempts = 0,
            account_locked_until = NULL
        WHERE id = ?
    `;
        const [result] = await db.execute(sql, [userId]);
        return result;
    }
    async deletePasswordResetToken(token) {
        const sql = `
        DELETE FROM password_reset_tokens
        WHERE token = ?
    `;
        const [result] = await db.execute(sql, [token]);
        return result;

    }
}

module.exports = new AuthRepository();