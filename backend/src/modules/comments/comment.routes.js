const express = require("express");
const router = express.Router();
const CommentController = require("./comment.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const validate = require("../../middleware/validationMiddleware");
const { commentValidator } = require("./comment.validator");

router.use(authMiddleware);

router.get("/task/:taskId", CommentController.listByTask);

router.post("/task/:taskId", commentValidator, validate, CommentController.create);

router.put("/:id", commentValidator, validate, CommentController.update);

router.delete("/:id", CommentController.remove);

module.exports = router;
