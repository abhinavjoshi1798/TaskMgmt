import { Request, Response } from "express";
import { UserModel } from "../models/User.js";
import bcrypt from "bcrypt";
import {
  generateVerificationToken,
  verifyToken,
} from "../utils/tokenService.js";
import { sendVerificationEmail } from "../utils/emailService.js";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const user = await UserModel.findOne({ email, isDeleted: false });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json({
          message: "Email not verified. Please verify your email first",
        });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateVerificationToken({
      email: user.email,
      userId: user._id.toString(),
    });

    const userResponse: any = user.toObject();
    delete userResponse.password;
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;

    return res
      .status(200)
      .json({ message: "Login successful", token: token, user: userResponse });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, Email, Password fields are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await UserModel.create({
      name: username,
      email,
      password: hashPassword,
      role: "user",
      emailVerified: false,
      isDeleted: false,
    });

    const verificationToken = generateVerificationToken({
      email,
      userId: newUser._id.toString(),
    });

    await sendVerificationEmail(email, verificationToken, newUser.name);

    return res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification link.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    const decodedTokenValues = verifyToken(token as string);
    if (!decodedTokenValues) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const user = await UserModel.findOne({
      email: decodedTokenValues.email,
      isDeleted: false,
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    user.emailVerified = true;
    await user.save();
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const adminLoginAsUser = async (req: Request, res: Response) => {
  try {
    const { email, password, targetUserId } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Admin email and password are required" });
    }

    const admin = await UserModel.findOne({ email, isDeleted: false });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    if (admin.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admins can use this feature" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid admin password" });
    }

    if (!admin.emailVerified) {
      return res.status(403).json({ message: "Admin email not verified" });
    }

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    const targetUser = await UserModel.findById(targetUserId).select(
      "-password"
    );
    if (!targetUser || targetUser.isDeleted) {
      return res.status(400).json({ message: "Target user not found" });
    }

    const token = generateVerificationToken({
      email: targetUser.email,
      userId: targetUser._id.toString(),
    });

    const userResponse: any = targetUser.toObject();
    userResponse.id = userResponse._id.toString();
    delete userResponse._id;

    return res.status(200).json({
      message: "Login as user successful",
      token: token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Error in adminLoginAsUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
