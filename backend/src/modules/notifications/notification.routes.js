const express = require("express");
const router = express.Router();
const NotificationController = require("./notification.controller");
const authMiddleware = require("../../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", NotificationController.list);

router.get("/unread-count", NotificationController.unreadCount);

router.patch("/read-all", NotificationController.markAllRead);

router.patch("/:id/read", NotificationController.markRead);

module.exports = router;
