const db = require("../config/db");

exports.logActivity = async (organizationId, userId, { module_name, module_id, action, description }, req = null) => {
    const sql = `
        INSERT INTO activity_logs
            (organization_id, user_id, module_name, module_id, action, description, browser, device, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const browser = req?.headers?.["user-agent"] ?? null;
    const ip = req?.ip ?? null;

    await db.execute(sql, [
        organizationId,
        userId,
        module_name ?? null,
        module_id ?? null,
        action ?? null,
        description ?? null,
        browser,
        null,
        ip
    ]);
};
