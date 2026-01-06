import { UserModel } from "../models/User.js";
import bcrypt from "bcrypt";
export const createAdmin = async (req, res) => {
    try {
        const { email, password, name, secretKey } = req.body;
        if (!secretKey || secretKey !== process.env.ADMIN_SECRET_KEY) {
            res.status(403).json({ message: "Invalid secret key" });
            return;
        }
        if (!email || !password || !name) {
            res.status(400).json({ message: "Email, password, and name are required" });
            return;
        }
        const existingUser = await UserModel.findOne({ email, isDeleted: false });
        if (existingUser) {
            if (existingUser.role === "admin") {
                res.status(400).json({ message: "Admin user with this email already exists" });
                return;
            }
            else {
                const saltRounds = 10;
                const hashPassword = await bcrypt.hash(password, saltRounds);
                existingUser.role = "admin";
                existingUser.password = hashPassword;
                existingUser.name = name;
                await existingUser.save();
                const userResponse = existingUser.toObject();
                delete userResponse.password;
                userResponse.id = userResponse._id.toString();
                delete userResponse._id;
                res.status(200).json({
                    message: "User updated to admin successfully",
                    user: userResponse
                });
                return;
            }
        }
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        const adminUser = await UserModel.create({
            name,
            email,
            password: hashPassword,
            role: "admin",
            emailVerified: true,
            isDeleted: false,
            points: 0
        });
        const userResponse = adminUser.toObject();
        delete userResponse.password;
        userResponse.id = userResponse._id.toString();
        delete userResponse._id;
        res.status(201).json({
            message: "Admin user created successfully",
            user: userResponse
        });
        return;
    }
    catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({ message: "Internal server error" });
        return;
    }
};
