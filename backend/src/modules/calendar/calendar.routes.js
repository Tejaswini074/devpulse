const express = require("express");
const router = express.Router();
const CalendarController = require("./calendar.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const roleMiddleware = require("../../middleware/roleMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { calendarValidator } = require("./calendar.validator");
const ROLES = require("../../constants/roles");

router.use(authMiddleware);

router.get("/", CalendarController.list);

router.post("/", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), calendarValidator, validate, CalendarController.create);

router.delete("/:id", roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN), CalendarController.remove);

module.exports = router;
