const CommentService = require("./comment.services");
const Response = require("../../utils/response");

class CommentController {

    async listByTask(req, res) {
        try {
            const result = await CommentService.listByTask(req.params.taskId, req.user.organization_id);
            return Response.success(res, "Comments fetched successfully", result);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 404);
        }
    }

    async create(req, res) {
        try {
            const result = await CommentService.create(
                req.params.taskId,
                req.user,
                req.body.comment,
                req.body.parent_comment_id
            );
            return Response.success(res, "Comment added successfully", result, 201);
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async update(req, res) {
        try {
            await CommentService.update(req.params.id, req.user, req.body.comment);
            return Response.success(res, "Comment updated successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }

    async remove(req, res) {
        try {
            await CommentService.remove(req.params.id, req.user);
            return Response.success(res, "Comment deleted successfully");
        } catch (error) {
            console.error(error);
            return Response.error(res, error.message, 400);
        }
    }
}

module.exports = new CommentController();
