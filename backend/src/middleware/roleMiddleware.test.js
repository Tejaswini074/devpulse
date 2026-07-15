const roleMiddleware = require("./roleMiddleware");

function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("roleMiddleware", () => {
    test("calls next() when req.user.role is in the allowed list", () => {
        const req = { user: { role: "Admin" } };
        const res = mockRes();
        const next = jest.fn();

        roleMiddleware("Admin", "Super Admin")(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
    });

    test("responds 403 when req.user.role is not in the allowed list", () => {
        const req = { user: { role: "Developer" } };
        const res = mockRes();
        const next = jest.fn();

        roleMiddleware("Admin", "Super Admin")(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ success: false })
        );
    });

    test("responds 403 when req.user is missing entirely", () => {
        const req = {};
        const res = mockRes();
        const next = jest.fn();

        roleMiddleware("Admin")(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
