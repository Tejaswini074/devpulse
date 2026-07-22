const AttachmentService = require("./attachment.services");
const Response = require("../../utils/response");

class AttachmentController {

    async listByRecord(req, res) {
        try {
            const result = await AttachmentService.listByRecord(
                req.params.moduleName,
                req.params.recordId,
                req.user.organization_id
            );
            return Response.success(res, "Attachments fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async upload(req, res) {
        try {
            if (!req.file) {
                return Response.error(res, "No file uploaded", 400);
            }
            const result = await AttachmentService.create(
                req.params.moduleName,
                req.params.recordId,
                req.user,
                req.file
            );
            return Response.success(res, "File uploaded successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async download(req, res) {
        try {
            const { absolutePath, fileName } = await AttachmentService.getForDownload(
                req.params.id,
                req.user.organization_id
            );
            return res.download(absolutePath, fileName);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async remove(req, res) {
        try {
            await AttachmentService.remove(req.params.id, req.user);
            return Response.success(res, "Attachment deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new AttachmentController();
