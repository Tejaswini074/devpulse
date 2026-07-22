const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "..", "uploads");

const ALLOWED_MIME_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "application/pdf",
    "text/plain",
    "text/csv",
    "application/json",
    "application/zip",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const orgDir = path.join(UPLOAD_ROOT, String(req.user.organization_id));
        fs.mkdirSync(orgDir, { recursive: true });
        cb(null, orgDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuid()}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        return cb(new Error("File type not allowed"));
    }
    cb(null, true);
};

exports.upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

exports.UPLOAD_ROOT = UPLOAD_ROOT;
