process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

jest.mock("../../src/config/db", () => ({
    execute: jest.fn(),
    query: jest.fn(),
    getConnection: jest.fn()
}));

const request = require("supertest");
const jwt = require("jsonwebtoken");
const db = require("../../src/config/db");
const app = require("../../src/app");

function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
}

describe("App integration", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("unknown route returns the 404 handler's JSON shape", async () => {
        const res = await request(app).get("/api/this-route-does-not-exist");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ success: false, message: "Route not found" });
    });

    describe("authMiddleware, wired through a real protected route", () => {
        test("rejects a request with no Authorization header", async () => {
            const res = await request(app).get("/api/teams");

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("No token provided");
        });

        test("rejects a request with a malformed/invalid token", async () => {
            const res = await request(app).get("/api/teams").set("Authorization", "Bearer not-a-real-token");

            expect(res.status).toBe(401);
            expect(res.body.message).toBe("Invalid token");
        });

        test("accepts a validly-signed token and reaches the real controller/service/repository chain", async () => {
            db.query.mockResolvedValueOnce([[]]); // TeamRepository.findAll
            db.execute.mockResolvedValueOnce([[{ total: 0 }]]); // TeamRepository.count

            const token = signToken({ id: 1, organization_id: 2, team_id: null, role: "Admin" });
            const res = await request(app).get("/api/teams").set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual({
                success: true,
                message: expect.any(String),
                data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }
            });
        });
    });

    describe("roleMiddleware, wired through a real Admin-only route", () => {
        test("blocks a non-admin role with 403 before it reaches the repository", async () => {
            const token = signToken({ id: 1, organization_id: 2, team_id: null, role: "Developer" });
            const res = await request(app)
                .post("/api/teams")
                .set("Authorization", `Bearer ${token}`)
                .send({ team_name: "New Team" });

            expect(res.status).toBe(403);
            expect(db.execute).not.toHaveBeenCalled();
        });
    });

    describe("express-validator + validationMiddleware, wired through /auth/login", () => {
        test("rejects an empty body with a 400 and a validation errors array", async () => {
            const res = await request(app).post("/api/auth/login").send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(Array.isArray(res.body.errors)).toBe(true);
            expect(res.body.errors.length).toBeGreaterThan(0);
        });

        test("rejects a malformed email with a 400", async () => {
            const res = await request(app).post("/api/auth/login").send({ email: "not-an-email", password: "x" });

            expect(res.status).toBe(400);
            expect(res.body.errors.some((e) => e.path === "email")).toBe(true);
        });

        test("valid shape but unknown user reaches AuthService and returns 401 invalid credentials", async () => {
            db.execute.mockResolvedValueOnce([[]]); // AuthRepository.findUserByEmail -> no rows

            const res = await request(app)
                .post("/api/auth/login")
                .send({ email: "nobody@devpulse.com", password: "whatever123" });

            expect(res.status).toBe(401);
            expect(res.body).toEqual({ success: false, message: "Invalid email or password" });
        });
    });

    describe("POST /api/tasks with an empty optional due_date", () => {
        test("no longer rejected as a 400 validation error (regression: forms always send '' for an unset date)", async () => {
            db.execute.mockResolvedValueOnce([{ insertId: 99 }]); // TaskRepository.create

            const token = signToken({ id: 1, organization_id: 2, team_id: 2, role: "Manager" });
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "New task", project_id: 1, assigned_to: 1, due_date: "" });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ success: true, message: "Task created successfully", data: { id: 99 } });
        });
    });

    test("CORS reflects only the configured FRONTEND_URL, not the request's Origin", async () => {
        const resEvil = await request(app).get("/api/teams").set("Origin", "http://evil.com");
        const resAllowed = await request(app).get("/api/teams").set("Origin", "http://localhost:8080");

        expect(resEvil.headers["access-control-allow-origin"]).toBe("http://localhost:8080");
        expect(resAllowed.headers["access-control-allow-origin"]).toBe("http://localhost:8080");
    });
});
