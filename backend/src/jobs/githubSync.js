const cron = require("node-cron");
const GithubService = require("../modules/github/github.services");
const logger = require("../config/logger");

const start = () => {
    cron.schedule("0 23 * * *", async () => {
        logger.info("Starting nightly GitHub activity sync");
        const results = await GithubService.syncAllUsers();
        const synced = results.filter((r) => r.synced).length;
        logger.info(`GitHub activity sync finished: ${synced}/${results.length} users updated`);
    });
};

module.exports = { start };
