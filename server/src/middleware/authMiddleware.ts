import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/tokenService.js";
import { UserModel } from "../models/User.js";

export interface AuthRequest extends Request {
    userId?: string;
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Authentication token required" });
            return;
        }

        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        if (!decoded) {
            res.status(401).json({ message: "Invalid or expired token" });
            return;
        }

        const user = await UserModel.findById(decoded.userId).select("-password");
        if (!user || user.isDeleted) {
            res.status(401).json({ message: "User not found" });
            return;
        }

        if (!user.emailVerified) {
            res.status(403).json({ message: "Email not verified. Please verify your email first" });
            return;
        }

        req.userId = decoded.userId;
        req.user = user;
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Authentication failed" });
    }
};
