require("dotenv").config();

const app = require("./src/app");
const githubSyncJob = require("./src/jobs/githubSync");
const productivityCronJob = require("./src/jobs/productivityCron");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 DevPulse Server running on port ${PORT}`);
    githubSyncJob.start();
    productivityCronJob.start();
});