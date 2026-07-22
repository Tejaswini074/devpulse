jest.mock("./setting.repository");

const SettingRepository = require("./setting.repository");
const SettingService = require("./setting.services");

describe("SettingService.update", () => {
    beforeEach(() => jest.clearAllMocks());

    test("silently drops keys that are not on the allowlist", async () => {
        SettingRepository.findAllByOrg.mockResolvedValue([{ setting_key: "company_name", setting_value: "Acme" }]);

        await SettingService.update(2, 1, { company_name: "Acme", not_a_real_setting: "x" });

        expect(SettingRepository.upsert).toHaveBeenCalledTimes(1);
        expect(SettingRepository.upsert).toHaveBeenCalledWith(2, "company_name", "Acme", 1);
    });

    test("throws when no valid settings are provided", async () => {
        await expect(SettingService.update(2, 1, { not_a_real_setting: "x" })).rejects.toThrow(
            "No valid settings provided"
        );
    });
});

describe("SettingService.getNumber", () => {
    beforeEach(() => jest.clearAllMocks());

    test("returns the fallback when no override is stored", async () => {
        SettingRepository.findValue.mockResolvedValue(null);
        await expect(SettingService.getNumber(2, "weekly_hours_target", 40)).resolves.toBe(40);
    });

    test("returns the stored override when it is a valid positive number", async () => {
        SettingRepository.findValue.mockResolvedValue("35");
        await expect(SettingService.getNumber(2, "weekly_hours_target", 40)).resolves.toBe(35);
    });

    test("falls back when the stored value is not a valid positive number", async () => {
        SettingRepository.findValue.mockResolvedValue("not-a-number");
        await expect(SettingService.getNumber(2, "weekly_hours_target", 40)).resolves.toBe(40);
    });
});
