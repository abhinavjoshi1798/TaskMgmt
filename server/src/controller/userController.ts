import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { UserModel } from "../models/User.js";

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userRole = req.user!.role;

        if (userRole !== "admin") {
            res.status(403).json({ message: "Only admin can view users" });
            return;
        }

        const users = await UserModel.find({ isDeleted: false })
            .select("name email role points")
            .sort({ name: 1 });

        res.status(200).json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
