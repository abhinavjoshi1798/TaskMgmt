import { Router } from "express";
import { login, register, verifyEmail, adminLoginAsUser } from "../controller/authController.js";
const router = Router();
router.post("/login", login);
router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/admin/login-as-user", adminLoginAsUser);
export default router;
