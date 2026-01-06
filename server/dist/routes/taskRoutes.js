import { Router } from "express";
import { createTask, getTasks, getTaskById, updateTask, updateTaskStatus, deleteTask, getTaskActivityLog } from "../controller/taskController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
const router = Router();
// All task routes require authentication
router.use(authenticate);
// Admin routes
router.post("/", requireAdmin, createTask);
router.put("/:id", requireAdmin, updateTask);
router.delete("/:id", requireAdmin, deleteTask);
router.get("/:id/activity", requireAdmin, getTaskActivityLog);
// User routes
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.patch("/:id/status", updateTaskStatus);
export default router;
