const express = require("express");
const router = express.Router();
const DailyLogController = require("./dailyLog.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { dailyLogValidator } = require("./dailyLog.validator");

router.use(authMiddleware);

router.post("/", dailyLogValidator, validate, DailyLogController.create);

router.get("/", DailyLogController.list);

router.get("/user-hours", DailyLogController.userHours);

router.put("/:id", dailyLogValidator, validate, DailyLogController.update);

router.delete("/:id", DailyLogController.remove);

module.exports = router;
