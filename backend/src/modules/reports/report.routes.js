const express = require("express");
const router = express.Router();
const ReportController = require("./report.controller");
const authMiddleware = require("../../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/weekly", ReportController.weekly);

router.get("/export", ReportController.exportLogs);

module.exports = router;
