const SettingRepository = require("./setting.repository");

const ALLOWED_KEYS = ["company_name", "weekly_hours_target", "weekly_commits_target"];

class SettingService {

    async getAll(organizationId) {
        const rows = await SettingRepository.findAllByOrg(organizationId);
        const map = {};
        for (const row of rows) {
            map[row.setting_key] = row.setting_value;
        }
        return map;
    }

    async update(organizationId, updatedBy, settings) {
        const entries = Object.entries(settings).filter(([key]) => ALLOWED_KEYS.includes(key));
        if (entries.length === 0) {
            throw new Error("No valid settings provided");
        }
        for (const [key, value] of entries) {
            await SettingRepository.upsert(organizationId, key, String(value), updatedBy);
        }
        return this.getAll(organizationId);
    }

    async getNumber(organizationId, key, fallback) {
        const value = await SettingRepository.findValue(organizationId, key);
        const parsed = value !== null ? Number(value) : NaN;
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }
}

module.exports = new SettingService();
