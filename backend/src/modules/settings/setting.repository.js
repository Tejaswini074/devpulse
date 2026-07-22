const db = require("../../config/db");

class SettingRepository {

    async findAllByOrg(organizationId) {
        const [rows] = await db.execute(
            "SELECT setting_key, setting_value FROM app_settings WHERE organization_id = ?",
            [organizationId]
        );
        return rows;
    }

    async upsert(organizationId, key, value, updatedBy) {
        const sql = `
            INSERT INTO app_settings (organization_id, setting_key, setting_value, updated_by)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)
        `;
        const [result] = await db.execute(sql, [organizationId, key, value, updatedBy]);
        return result;
    }

    async findValue(organizationId, key) {
        const [rows] = await db.execute(
            "SELECT setting_value FROM app_settings WHERE organization_id = ? AND setting_key = ?",
            [organizationId, key]
        );
        return rows[0]?.setting_value ?? null;
    }
}

module.exports = new SettingRepository();
