const cron = require("node-cron");
const db = require("../config/db");
const ProductivityService = require("../modules/productivity/productivity.services");
const logger = require("../config/logger");

const start = () => {
    cron.schedule("30 23 * * *", async () => {
        logger.info("Starting nightly productivity score recalculation");

        const [users] = await db.query(
            "SELECT id, organization_id FROM users WHERE is_deleted = 0 AND status = 'Active'"
        );

        let updated = 0;
        for (const user of users) {
            try {
                await ProductivityService.calculateForUser(user);
                updated += 1;
            } catch (error) {
                logger.error(`Failed to calculate productivity for user ${user.id}: ${error.message}`);
            }
        }

        logger.info(`Productivity recalculation finished: ${updated}/${users.length} users updated`);
    });
};

module.exports = { start };
