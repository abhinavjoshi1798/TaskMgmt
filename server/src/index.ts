import express, { Application } from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";
import "dotenv/config";
import routes from "./routes/routes.js";
import { connectDB } from "./db/db.js";
import { connectRedis } from "./utils/redisClient.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { setSocketIO } from "./controller/taskController.js";
import { initializeLeaderboard } from "./services/leaderboardService.js";

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 }, // Image Size Limit : 2MB
    createParentPath: true
}));

setSocketIO(io);

io.use(async (socket: any, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication token required"));
        }

        const { verifyToken } = await import("./utils/tokenService.js");
        const decoded = verifyToken(token);
        if (!decoded) {
            return next(new Error("Invalid token"));
        }

        const { UserModel } = await import("./models/User.js");
        const user = await UserModel.findById(decoded.userId);
        if (!user || user.isDeleted) {
            return next(new Error("User not found"));
        }

        socket.userId = decoded.userId;
        socket.userRole = user.role;
        next();
    } catch (error) {
        next(new Error("Authentication failed"));
    }
});

io.on("connection", (socket: any) => {
    console.log(`User connected: ${socket.userId}`);

    socket.join(`user:${socket.userId}`);

    if (socket.userRole === "admin") {
        socket.join("admin");
    }

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
    });
});

app.use("/api", routes);

app.use("/api", express.static(path.join(process.cwd(), "public", "images")));

app.use(notFound);
app.use(errorHandler);

httpServer.listen(PORT, async () => {
    try {
        await connectDB();
        await connectRedis().catch(err => {
            console.warn("Redis not available, some features may be limited:", err.message);
        });
        try {
            await initializeLeaderboard();
        } catch (err) {
            console.warn("Could not initialize leaderboard:", err);
        }
        console.log(`Server is running on port ${PORT}`);
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
});
