import { Router } from "express";
import { getLeaderboardData, getUserStats } from "../controller/leaderboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
const router = Router();
router.use(authenticate);
router.get("/", requireAdmin, getLeaderboardData);
router.get("/my-stats", getUserStats);
export default router;
