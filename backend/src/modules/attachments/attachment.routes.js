const express = require("express");
const router = express.Router();
const AttachmentController = require("./attachment.controller");
const authMiddleware = require("../../middleware/authMiddleware");
const { upload } = require("./attachment.upload");

router.use(authMiddleware);

const uploadSingle = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
};

// Registered before the /:moduleName/:recordId pattern below, since both are
// 2-segment GET routes and Express matches by registration order — without
// this ordering, "/:moduleName/:recordId" would swallow "/:id/download" requests.
router.get("/:id/download", AttachmentController.download);

router.delete("/:id", AttachmentController.remove);

router.get("/:moduleName/:recordId", AttachmentController.listByRecord);

router.post("/:moduleName/:recordId", uploadSingle, AttachmentController.upload);

module.exports = router;
