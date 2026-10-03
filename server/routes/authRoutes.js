import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
