const db = require("../../config/db");

class AttachmentRepository {

    async recordBelongsToOrg(moduleName, recordId, organizationId) {
        let sql;
        if (moduleName === "Project") {
            sql = "SELECT id FROM projects WHERE id = ? AND organization_id = ? AND is_deleted = 0";
        } else if (moduleName === "Task") {
            sql = "SELECT id FROM tasks WHERE id = ? AND organization_id = ? AND is_deleted = 0";
        } else if (moduleName === "DailyLog") {
            sql = `
                SELECT dl.id FROM daily_logs dl
                JOIN projects p ON p.id = dl.project_id
                WHERE dl.id = ? AND p.organization_id = ? AND dl.is_deleted = 0
            `;
        } else {
            return false;
        }
        const [rows] = await db.execute(sql, [recordId, organizationId]);
        return rows.length > 0;
    }

    async create(data) {
        const sql = `
            INSERT INTO attachments (module_name, record_id, file_name, file_path, file_size, file_type, uploaded_by)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            data.module_name,
            data.record_id,
            data.file_name,
            data.file_path,
            data.file_size ?? null,
            data.file_type ?? null,
            data.uploaded_by
        ]);
        return result;
    }

    async findByRecord(moduleName, recordId) {
        const sql = `
            SELECT a.*, u.name AS uploaded_by_name
            FROM attachments a
            JOIN users u ON u.id = a.uploaded_by
            WHERE a.module_name = ? AND a.record_id = ? AND a.is_deleted = 0
            ORDER BY a.uploaded_at DESC
        `;
        const [rows] = await db.execute(sql, [moduleName, recordId]);
        return rows;
    }

    async findById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM attachments WHERE id = ? AND is_deleted = 0",
            [id]
        );
        return rows[0];
    }

    async softDelete(id) {
        const [result] = await db.execute(
            "UPDATE attachments SET is_deleted = 1 WHERE id = ?",
            [id]
        );
        return result;
    }
}

module.exports = new AttachmentRepository();
