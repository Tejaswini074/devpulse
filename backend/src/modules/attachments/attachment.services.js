const fs = require("fs");
const path = require("path");
const AttachmentRepository = require("./attachment.repository");
const { UPLOAD_ROOT } = require("./attachment.upload");
const ROLES = require("../../constants/roles");

const MODULES = ["Project", "Task", "DailyLog"];

class AttachmentService {

    async assertRecordAccess(moduleName, recordId, organizationId) {
        if (!MODULES.includes(moduleName)) {
            throw new Error("Invalid module name");
        }
        const belongs = await AttachmentRepository.recordBelongsToOrg(moduleName, recordId, organizationId);
        if (!belongs) {
            throw new Error("Record not found");
        }
    }

    async listByRecord(moduleName, recordId, organizationId) {
        await this.assertRecordAccess(moduleName, recordId, organizationId);
        return AttachmentRepository.findByRecord(moduleName, recordId);
    }

    async create(moduleName, recordId, user, file) {
        await this.assertRecordAccess(moduleName, recordId, user.organization_id);

        const relativePath = path.join(String(user.organization_id), file.filename);
        const result = await AttachmentRepository.create({
            module_name: moduleName,
            record_id: recordId,
            file_name: file.originalname,
            file_path: relativePath,
            file_size: file.size,
            file_type: file.mimetype,
            uploaded_by: user.id
        });
        return { id: result.insertId };
    }

    async getForDownload(id, organizationId) {
        const attachment = await AttachmentRepository.findById(id);
        if (!attachment) {
            throw new Error("Attachment not found");
        }
        await this.assertRecordAccess(attachment.module_name, attachment.record_id, organizationId);

        const absolutePath = path.join(UPLOAD_ROOT, attachment.file_path);
        if (!fs.existsSync(absolutePath)) {
            throw new Error("File no longer exists on the server");
        }
        return { absolutePath, fileName: attachment.file_name, fileType: attachment.file_type };
    }

    async remove(id, user) {
        const attachment = await AttachmentRepository.findById(id);
        if (!attachment) {
            throw new Error("Attachment not found");
        }
        await this.assertRecordAccess(attachment.module_name, attachment.record_id, user.organization_id);

        const isOwner = attachment.uploaded_by === user.id;
        const isManager = [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.MANAGER].includes(user.role);
        if (!isOwner && !isManager) {
            throw new Error("You do not have permission to delete this attachment");
        }

        await AttachmentRepository.softDelete(id);

        const absolutePath = path.join(UPLOAD_ROOT, attachment.file_path);
        fs.unlink(absolutePath, () => {});

        return true;
    }
}

module.exports = new AttachmentService();
