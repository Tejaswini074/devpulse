const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check for platform deploy checks (Railway, etc.) - no DB dependency
app.get("/health", (req, res) => res.status(200).json({ success: true, message: "ok" }));

// Login Rate Limiter
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes."
    }
});

// Shared limiter for other public, abuse-prone endpoints (org signup, forgot-password email spam)
const sensitiveActionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(req.ip),
    message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes."
    }
});

const authRoutes = require("./modules/auth");
const inviteRoutes = require("./modules/invite");
const userRoutes = require("./modules/users");
const teamRoutes = require("./modules/teams");
const projectRoutes = require("./modules/projects");
const taskRoutes = require("./modules/tasks");
const dailyLogRoutes = require("./modules/dailyLogs");
const milestoneRoutes = require("./modules/milestones");
const githubRoutes = require("./modules/github");
const productivityRoutes = require("./modules/productivity");
const dashboardRoutes = require("./modules/dashboard");
const reportRoutes = require("./modules/reports");
const commentRoutes = require("./modules/comments");
const attachmentRoutes = require("./modules/attachments");
const notificationRoutes = require("./modules/notifications");
const sprintRoutes = require("./modules/sprints");
const leaveRoutes = require("./modules/leave");
const calendarRoutes = require("./modules/calendar");
const activityLogRoutes = require("./modules/activityLogs");
const settingRoutes = require("./modules/settings");

app.use("/api/invite", inviteRoutes);
// Apply limiter ONLY to login endpoint
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/register-organization", sensitiveActionLimiter);
app.use("/api/auth/forgot-password", sensitiveActionLimiter);

// Auth Routes
app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/productivity", productivityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sprints", sprintRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/settings", settingRoutes);

const errorMiddleware = require("./middleware/errorMiddleware");

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorMiddleware);

module.exports = app;