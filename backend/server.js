require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const app = require("./src/app");
const { setIo } = require("./src/sockets/io");
const githubSyncJob = require("./src/jobs/githubSync");
const productivityCronJob = require("./src/jobs/productivityCron");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }
});

io.use((socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("No token provided"));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
    } catch (error) {
        next(new Error("Invalid token"));
    }
});

io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);
});

setIo(io);

server.listen(PORT, () => {
    console.log(`🚀 DevPulse Server running on port ${PORT}`);
    githubSyncJob.start();
    productivityCronJob.start();
});