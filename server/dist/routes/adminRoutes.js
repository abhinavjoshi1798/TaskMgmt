import { Router } from "express";
import { createAdmin } from "../controller/adminController.js";
const router = Router();
// Public route but protected by secret key
router.post("/create", createAdmin);
export default router;
