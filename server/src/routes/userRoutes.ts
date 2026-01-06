import { Router } from "express";
import { getUsers } from "../controller/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get("/", getUsers);

export default router;
