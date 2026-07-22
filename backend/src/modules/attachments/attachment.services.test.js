jest.mock("./attachment.repository");
jest.mock("fs");

const fs = require("fs");
const AttachmentRepository = require("./attachment.repository");
const AttachmentService = require("./attachment.services");

const user = { id: 6, organization_id: 2, role: "Developer" };

describe("AttachmentService.assertRecordAccess", () => {
    beforeEach(() => jest.clearAllMocks());

    test("rejects an unknown module name", async () => {
        await expect(AttachmentService.assertRecordAccess("Comment", 1, 2)).rejects.toThrow("Invalid module name");
    });

    test("rejects when the record does not belong to the caller's org", async () => {
        AttachmentRepository.recordBelongsToOrg.mockResolvedValue(false);
        await expect(AttachmentService.assertRecordAccess("Task", 1, 2)).rejects.toThrow("Record not found");
    });

    test("passes when the record belongs to the org", async () => {
        AttachmentRepository.recordBelongsToOrg.mockResolvedValue(true);
        await expect(AttachmentService.assertRecordAccess("Task", 1, 2)).resolves.toBeUndefined();
    });
});

describe("AttachmentService.remove", () => {
    beforeEach(() => jest.clearAllMocks());

    test("allows the uploader to delete their own attachment", async () => {
        AttachmentRepository.findById.mockResolvedValue({
            id: 1, module_name: "Task", record_id: 1, uploaded_by: 6, file_path: "2/file.txt"
        });
        AttachmentRepository.recordBelongsToOrg.mockResolvedValue(true);
        fs.unlink.mockImplementation((_, cb) => cb());

        await AttachmentService.remove(1, user);

        expect(AttachmentRepository.softDelete).toHaveBeenCalledWith(1);
    });

    test("rejects a different developer deleting someone else's attachment", async () => {
        AttachmentRepository.findById.mockResolvedValue({
            id: 1, module_name: "Task", record_id: 1, uploaded_by: 999, file_path: "2/file.txt"
        });
        AttachmentRepository.recordBelongsToOrg.mockResolvedValue(true);

        await expect(AttachmentService.remove(1, user)).rejects.toThrow(
            "You do not have permission to delete this attachment"
        );
        expect(AttachmentRepository.softDelete).not.toHaveBeenCalled();
    });

    test("throws when the attachment does not exist", async () => {
        AttachmentRepository.findById.mockResolvedValue(undefined);
        await expect(AttachmentService.remove(1, user)).rejects.toThrow("Attachment not found");
    });
});

describe("AttachmentService.getForDownload", () => {
    beforeEach(() => jest.clearAllMocks());

    test("throws when the underlying file is missing from disk", async () => {
        AttachmentRepository.findById.mockResolvedValue({
            id: 1, module_name: "Task", record_id: 1, file_path: "2/gone.txt", file_name: "gone.txt"
        });
        AttachmentRepository.recordBelongsToOrg.mockResolvedValue(true);
        fs.existsSync.mockReturnValue(false);

        await expect(AttachmentService.getForDownload(1, 2)).rejects.toThrow("File no longer exists on the server");
    });
});
